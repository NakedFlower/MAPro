from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from dotenv import load_dotenv
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# AI 모델 로드 (앱 시작 시 로드)
MODEL_NAME = "klue/roberta-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=7)
model.eval()

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
    "• \"노키즈존 음식점\"\n"
    "• \"주차가능 호텔\"\n\n"
    "📋 사용 가능한 매장 종류:\n"
    "음식점, 카페, 편의점, 약국, 호텔, 헤어샵, 병원\n\n"
    "🔍 특성 키워드 예시:\n"
    "분위기좋은, 24시간, 노키즈존, 주차가능, 인기많은 등"
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
        
        # 입력 검증 및 도움말 제공
        if not extracted.get("category") and not extracted.get("location"):
            return ChatResponse(reply=HELP_MESSAGE, places=None)
        
        # 2) DB 조회
        matched_places = query_places(extracted)
        
        # 3) 응답 생성
        if matched_places:
            reply_text = build_reply(extracted, matched_places)
            return ChatResponse(reply=reply_text, places=[{"name": p["name"]} for p in matched_places[:5]])
        else:
            return ChatResponse(reply="조건에 맞는 매장을 찾지 못했어요. 다른 키워드로 시도해 보시겠어요?", places=None)
            
    except Exception:
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
    """AI 모델을 사용하여 카테고리 분류"""
    try:
        # 텍스트 토크나이징
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        
        # 모델 예측
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_class_id = torch.argmax(predictions, dim=-1).item()
            confidence = predictions[0][predicted_class_id].item()
        
        # 신뢰도가 낮으면 None 반환
        if confidence < 0.3:
            return None
            
        return CATEGORY_LABELS[predicted_class_id]
    except Exception as e:
        print(f"AI 분류 오류: {e}")
        return None


def extract_features_with_ai(text: str, category: str) -> list:
    try:
        # 간단한 규칙 기반 특성 추출 (AI 모델이 없으므로)
        features = []
        
        # 카테고리별 특성 키워드 (정확한 feature 목록)
        feature_keywords = {
            "음식점": ["유아의자", "혼밥", "새로오픈", "데이트", "노키즈존", "지역화폐", "주차", "인기많은"],
            "카페": ["편한좌석", "카공", "노키즈존", "분위기좋은", "인테리어", "디저트", "조용한", "24시간"],
            "편의점": ["야외좌석", "ATM", "취식공간"],
            "약국": ["친절", "비처방의약품"],
            "호텔": ["스파/월풀/욕조", "반려동물 동반", "주차가능", "전기차 충전", "객실금연", "OTT", "수영장", "객실내 PC", "바베큐", "조식"],
            "헤어샵": ["인기많은", "쿠폰멤버십", "예약필수"],
            "병원": ["응급실", "전문의", "야간진료"]
        }
        
        if category in feature_keywords:
            for feature in feature_keywords[category]:
                if feature in text:
                    features.append(feature)
        
        return features
    except Exception as e:
        print(f"특성 추출 오류: {e}")
        return []


def extract_location_with_ai(text: str) -> str:
    """AI를 사용하여 위치 정보 추출"""
    try:
        # 간단한 패턴 매칭으로 위치 추출
        import re
        
        # 지역명 패턴 (구, 동, 시로 끝나는 단어)
        location_pattern = r'(\w+(?:구|동|시))'
        matches = re.findall(location_pattern, text)
        if matches:
            return matches[0]
        
        # 주요 지역명
        common_locations = ["강남", "강남구", "서초", "서초구", "판교", "분당", "일산", "파주", "운정", "홍대", "여의도", "잠실"]
        for loc in common_locations:
            if loc in text:
                return loc
        
        return None
    except Exception as e:
        print(f"위치 추출 오류: {e}")
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
    
    return {"category": category, "features": features, "location": location}


# ------------------ DB 조회 ------------------
def query_places(query: dict) -> list:
    try:
        engine = get_db_engine()
        
        category = query.get("category")
        features = query.get("features") or []
        location = query.get("location")

        # 기본 WHERE 절 구성
        where = []
        params = {}
        if category:
            where.append("category = :category")
            params["category"] = category
        if location:
            where.append("location LIKE :location")
            params["location"] = f"%{location}%"

        base_sql = "SELECT place_id, category, name, location, feature FROM place"
        if where:
            base_sql += " WHERE " + " AND ".join(where)

        # 우선 후보 30개 조회
        sql = text(base_sql + " ORDER BY updated_at DESC, created_at DESC LIMIT 30")
        
        with engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(sql, params)]

        if not rows:
            return []

        # 특성 점수 기반 정렬
        def score(row):
            row_features = (row.get("feature") or "").split(",")
            row_features = [rf.strip() for rf in row_features if rf.strip()]
            return sum(1 for f in features if f in row_features)

        rows.sort(key=score, reverse=True)
        return rows[:5]
        
    except Exception:
        return []  # DB 오류 시 빈 리스트 반환


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
