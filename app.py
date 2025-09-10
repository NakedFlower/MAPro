from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from dotenv import load_dotenv
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline, AutoModel
import torch
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# AI 모델 로드 (앱 시작 시 로드)
print("AI 모델들을 로딩 중...")

# 1. Zero-shot 분류 모델 (카테고리 분류용)
try:
    # 한국어 입력 대응을 위해 다국어 NLI 모델 사용
    zero_shot_classifier = pipeline(
        "zero-shot-classification",
        model="joeddav/xlm-roberta-large-xnli",
        device=0 if torch.cuda.is_available() else -1,
    )
    print("✅ Zero-shot 분류 모델 로드 완료")
except Exception as e:
    print(f"⚠️ Zero-shot 분류 모델 로드 실패: {e}")
    zero_shot_classifier = None

# 2. 한국어 NER 모델 (위치 추출용)
try:
    # 한국어 NER에 특화된 파인튜닝 체크포인트 사용
    # 참고: monologg/koelectra-base-v3-finetuned-ner 는 LOC/LC 등 위치 라벨을 제공합니다.
    ner_pipeline = pipeline(
        "ner",
        model="Davlan/bert-base-multilingual-cased-ner-hrl",
        aggregation_strategy="simple",
        device=0 if torch.cuda.is_available() else -1,
    )
    print("✅ 한국어 NER 모델 로드 완료")
except Exception as e:
    print(f"⚠️ 한국어 NER 모델 로드 실패: {e}")
    ner_pipeline = None

# 3. 한국어 Sentence Transformer (특성 추출용)
try:
    sentence_model = SentenceTransformer('jhgan/ko-sroberta-multitask')
    print("✅ 한국어 Sentence Transformer 로드 완료")
except Exception as e:
    print(f"⚠️ Sentence Transformer 로드 실패: {e}")
    sentence_model = None

print("AI 모델 로딩 완료!")

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    places: list | None = None


app = FastAPI(title="MAPro Chat API", version="0.1.0")
# 공용 도움말 메시지
HELP_MESSAGE = (
    "입력이 너무 간단해요! 😅\n\n"
    "💡 올바른 입력 예시:\n"
    "• \"강남구 분위기좋은 카페\"\n"
    "• \"판교 24시간 편의점\"\n"

    "📋 사용 가능한 매장 종류:\n"
    "음식점, 카페, 편의점, 약국, 호텔, 헤어샵, 병원\n\n"
)


def is_low_quality_input(text: str) -> bool:
    """의미 없는 입력(기호만, 너무 짧음 등)을 판별."""
    if not text:
        return True
    # 공백 제거 후 영숫자/한글만 남김
    cleaned = re.sub(r"[^0-9A-Za-z가-힣]", "", text)
    # 전부 기호이거나 유효 글자 수가 2 미만
    if len(cleaned) < 2:
        return True
    # 한글/영문/숫자 중 하나도 없으면 무의미
    if not re.search(r"[0-9A-Za-z가-힣]", text):
        return True
    return False


# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# chat_endpoint
@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    user_message = (req.message or "").strip()
    if not user_message:
        return ChatResponse(reply="메시지가 비어 있어요.")

    try:
        # 0) 입력 유효성 1차 필터
        if is_low_quality_input(user_message):
            return ChatResponse(reply=HELP_MESSAGE, places=None)

        # 1) NLP: 카테고리/특성/지역 추출
        extracted = extract_query(user_message)
        
        # 2) 필수 정보(지역, 카테고리) 검증 강화
        location = extracted.get("location")
        category = extracted.get("category")

        if not location or not category:
            # 지역이나 카테고리 중 하나라도 없으면 더 구체적인 질문으로 응답
            if not location and not category:
                # 둘 다 없는 경우: 기존 도움말
                return ChatResponse(reply=HELP_MESSAGE, places=None)
            elif not location:
                # 지역이 없는 경우
                return ChatResponse(reply=f"어느 지역에서 {category}을(를) 찾으시나요? 🤔\n예: \"강남 {category}\"", places=None)
            else: # not category
                # 카테고리가 없는 경우
                return ChatResponse(reply=f"'{location}'에서 어떤 장소를 찾으세요? 👀\n(예: 음식점, 카페, 약국 등)", places=None)
        

        # 3) DB 조회 
        matched_places = query_places(extracted)
        
        # 4) 응답 생성
        if matched_places:
            reply_text = build_reply(extracted, matched_places)
            # places 리스트에는 DB에서 받은 모든 정보를 포함하여 프론트에서 활용할 수 있도록 개선
            return ChatResponse(reply=reply_text, places=matched_places[:5])
        else:
            return ChatResponse(reply="조건에 맞는 매장을 찾지 못했어요. 다른 키워드로 시도해 보시겠어요?", places=None)
            
    except Exception as e:
        print(f"채팅 엔드포인트 오류: {e}") # 디버깅을 위한 로그 추가
        return ChatResponse(reply="서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", places=None)


@app.get("/health")
def health_check():
    try:
        # DB 연결 테스트
        engine = get_db_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}


# ------------------ 설정/DB ------------------
load_dotenv()

def get_engine() -> Engine:
    # GCP MySQL Database Configuration
    host = os.getenv("DB_HOST", "mapro.cloud")
    port = os.getenv("DB_PORT", "3306")
    user = os.getenv("DB_USER", "dev")
    password = os.getenv("DB_PASSWORD", "Dev1010**")
    name = os.getenv("DB_NAME", "mapro")
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"
    return create_engine(url, pool_pre_ping=True)

ENGINE: Optional[Engine] = None

def get_db_engine() -> Engine:
    global ENGINE
    if ENGINE is None:
        ENGINE = get_engine()
    return ENGINE


# ------------------ AI 모델 설정 ------------------
# 카테고리 라벨 정의
CATEGORY_LABELS = ["음식점", "카페", "편의점", "약국", "호텔", "헤어샵", "병원"]

# ------------------ AI 기반 NLP ------------------
def normalize(text: str) -> str:
    return text.strip()


def classify_category_with_ai(text: str) -> str:
    """Zero-shot 분류를 사용하여 카테고리 분류"""
    if zero_shot_classifier is None:
        return None
    
    try:
        # 한국어 라벨을 그대로 후보로 사용 + 한국어 가설 템플릿 적용
        result = zero_shot_classifier(
            text,
            candidate_labels=CATEGORY_LABELS,
            hypothesis_template="이 문장은 {}와 관련이 있다.",
            multi_label=False,
        )
        # 한국어 입력 대비 임계값 소폭 완화
        if result['scores'][0] > 0.2:
            return result['labels'][0]
        return None
            
    except Exception:
        return None


def extract_features_with_ai(text: str, category: str) -> list:
    """Sentence Transformer를 사용하여 특성 추출"""
    if sentence_model is None:
        return []
    
    try:
        # 카테고리별 특성 키워드
        feature_keywords = {
            "음식점": ["유아의자", "혼밥", "새로오픈", "데이트", "노키즈존", "지역화폐", "주차", "인기많은"],
            "카페": ["편한좌석", "카공", "노키즈존", "분위기좋은", "인테리어", "디저트", "조용한", "24시간"],
            "편의점": ["야외좌석", "ATM", "취식공간"],
            "약국": ["친절", "비처방의약품"],
            "호텔": ["스파/월풀/욕조", "반려동물 동반", "주차가능", "전기차 충전", "객실금연", "OTT", "수영장", "객실내 PC", "바베큐", "조식"],
            "헤어샵": ["인기많은", "쿠폰멤버십", "예약필수"],
            "병원": ["응급실", "전문의", "야간진료"]
        }
        
        if category not in feature_keywords:
            return []
        # 공백 무시 변형을 자동 생성하여 유사 의미 표현 간 편차 감소
        def normalize_space(s: str) -> str:
            return re.sub(r"\s+", "", s)

        text_variants = [text, normalize_space(text)]
        keywords = feature_keywords[category]
        keyword_variants = []
        variant_to_canonical = {}
        for kw in keywords:
            kw_var = normalize_space(kw)
            keyword_variants.append(kw)
            variant_to_canonical[kw] = kw
            if kw_var != kw:
                keyword_variants.append(kw_var)
                variant_to_canonical[kw_var] = kw

        # 임베딩 계산
        text_embedding = sentence_model.encode(text_variants)
        feature_embeddings = sentence_model.encode(keyword_variants)
        
        # 코사인 유사도 계산
        similarities = cosine_similarity(text_embedding, feature_embeddings)

        # 두 텍스트 변형 중 최대 유사도를 사용하고, 변형을 원래 표준 키워드로 매핑
        max_sim_by_variant = np.max(similarities, axis=0)

        selected_canonicals = []
        for idx, sim in enumerate(max_sim_by_variant):
            if sim > 0.3:
                canon = variant_to_canonical[keyword_variants[idx]]
                selected_canonicals.append(canon)

        # 중복 제거, 원래 정의된 키워드 순서 유지
        seen = set()
        ordered = []
        for kw in keywords:
            if kw in selected_canonicals and kw not in seen:
                seen.add(kw)
                ordered.append(kw)
        return ordered
        
    except Exception:
        return []




def extract_location_with_ai(text: str) -> str:
    """개선된 NER을 사용하여 위치 정보 추출"""
    if ner_pipeline is None:
        return None
    
    try:
        # NER 파이프라인으로 엔티티 추출
        entities = ner_pipeline(text)
        
        # 위치 관련 엔티티 필터링 및 정리
        location_entities = []
        for entity in entities:
            # 다양한 위치 라벨 수용 (다국어/영어/한국어 모델 호환)
            if entity['entity_group'] in ['LOC', 'LC', 'GPE', 'LOCATION', 'B-LOC', 'I-LOC']:
                entity_text = entity['word'].strip()
                # 기본적인 길이 필터링만 적용
                if len(entity_text) >= 2:
                    location_entities.append({
                        'text': entity_text,
                        'score': entity['score'],
                        'label': entity['entity_group']
                    })
        
        if not location_entities:
            return None
        
        # 신뢰도 순으로 정렬하여 가장 높은 신뢰도의 위치 반환
        location_entities.sort(key=lambda x: x['score'], reverse=True)
        return location_entities[0]['text']
        
    except Exception:
        return None

def extract_query(text: str) -> dict:
    """AI 모델을 사용하여 쿼리 추출"""
    t = normalize(text)
    
    # AI 모델로 카테고리 분류
    category = classify_category_with_ai(t)
    
    # AI로 특성 추출
    features = extract_features_with_ai(t, category) if category else []
    
    # AI로 위치 추출
    location = extract_location_with_ai(t)
    
    extracted = {"category": category, "features": features, "location": location}
    # 진단 로그 (배포 환경에서도 유용하도록 간단 출력)
    try:
        print(f"[extract_query] parsed -> {extracted}")
    except Exception:
        pass
    return extracted


# ------------------ DB 조회 ------------------
def query_places(query: dict) -> list:
    try:
        engine = get_db_engine()
        
        # chat_endpoint에서 검증을 거쳤으므로 category와 location은 항상 존재
        category = query["category"]
        location = query["location"]
        features = query.get("features") or []

        # WHERE 절을 명시적으로 구성
        where_clauses = [
            "category = :category",
            "location LIKE :location"
        ]
        params = {
            "category": category,
            "location": f"%{location}%"
        }

        # SQL 쿼리 생성
        base_sql = "SELECT place_id, category, name, location, feature FROM place WHERE "
        sql_query = base_sql + " AND ".join(where_clauses)
        sql_query += " ORDER BY updated_at DESC, created_at DESC LIMIT 30"
        
        sql = text(sql_query)
        
        with engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(sql, params)]

        if not rows:
            return []

        # 특성(feature) 점수 기반으로 Python에서 재정렬
        def score(place):
            place_features = (place.get("feature") or "").split(",")
            place_features = [f.strip() for f in place_features if f.strip()]
            
            # 검색어에 포함된 feature가 매장의 feature에 얼마나 있는지 계산
            match_count = sum(1 for f in features if f in place_features)
            return match_count

        rows.sort(key=score, reverse=True)
        return rows[:5]
        
    except Exception as e:
        print(f"DB 조회 오류: {e}") # 디버깅을 위한 로그 추가
        return []


# ------------------ 응답 생성 ------------------
def build_reply(query: dict, places: list) -> str:
    parts = []
    if query.get("location"):
        parts.append(query['location'])
    if query.get("category"):
        parts.append(query['category'])
    if query.get("features"):
        parts.append(", ".join(query["features"]))

    cond = " ".join(parts) if parts else "요청하신"
    names = ", ".join([p["name"] for p in places[:5]])
    
    if len(places) > 0:
        return f"{cond} 조건으로 {len(places)}곳을 찾았어요"
    else:
        return f"{cond} 조건에 맞는 매장을 찾지 못했어요. 다른 키워드로 시도해 보시겠어요?"