from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from dotenv import load_dotenv
import re
from transformers import pipeline
import torch



# ------------------ AI 모델 설정 ------------------
# 카테고리 라벨 정의
CATEGORY_LABELS = ["음식점", "카페", "편의점", "약국", "호텔", "헤어샵", "병원"]

# 1. 키워드-표현 사전 정의
KEYWORD_DICT = {
    "음식점": {
        "유아의자": {
            "positive": [
                "유아", "아기", "하이 체어", "베이비 체어", "키즈", "어린이",
                "유모차", "베이비 카", "육아 맘", "애기 엄마"
            ],
            "negative": [
                "유아 의자 없다", "아기 의자 없다", "하이 체어 없다", "베이비 체어 없다",
                "아이 앉히다 곳 없다", "키즈 의자 없다", "아이 데리 고 가기 힘들다"
            ]
        },
        "혼밥": {
            "positive": [
                "혼밥", "1 인", "솔로", "혼자", "카운터 석", "바 테이블"
            ],
            "negative": [
                "혼밥 불가", "1 인 안됨", "혼자 오기 어렵다", "1 인석 없다",
                "2 인 이상", "단체 전용", "커플 전용", "가족 전용"
            ]
        },
        "새로오픈": {
            "positive": [
                "새롭다", "신규", "오픈", "그랜드", "리뉴얼", "신상", "뉴",
                "최근", "갓", "막", "따끈따끈", "신생", "깨끗", "말끔"
            ],
            "negative": [
                "오래된", "전통", "역사", "원조", "본점", "노포", "수십 년"
            ]
        },
        "데이트": {
            "positive": [
                "데이트", "연인", "커플", "애인", "분위기", "무드", "로맨틱",
                "은은한 조명", "간접 조명", "캔들", "기념일", "프러포즈",
                "힙한", "감성", "갬성", "뷰", "야경", "테라스", "루프탑"
            ],
            "negative": [
                "데이트 비추", "분위기 별로", "무드 없다", "시끄럽다",
                "형광등", "데이트 분위기 아니다"
            ]
        },
        "노키즈존": {
            "positive": [
                "노키즈", "성인 전용", "어른 전용", "19 세 이상", "출입 금지"
            ],
            "negative": [
                "아이들 많다", "시끄럽다 아이들", "노키즈존 아니다",
                "키즈 카페", "키즈 프렌들리"
            ]
        },
        "지역화폐": {
            "positive": [
                "지역 화폐", "지역 상품권", "상품권", "지역 페이", "시민 페이",
                "경기 페이", "서울 페이", "제로 페이", "간편 결제", "모바일 결제"
            ],
            "negative": [
                "지역 화폐 안됨", "상품권 사용 불가", "페이 안됨",
                "현금만", "카드만"
            ]
        },
        "주차": {
            "positive": [
                "주차", "파킹", "무료 주차", "발렛", "주차장",
                "주차 면", "주차 자리", "주차 칸"
            ],
            "negative": [
                "주차 어렵다", "주차장 없다", "주차 힘들다", "주차 불가",
                "주차 난", "주차비 비싸다"
            ]
        },
        "인기많은": {
            "positive": [
                "인기", "핫한", "핫플", "유명", "웨이팅", "대기", "줄서기",
                "예약 필수", "예약 어렵다", "붐비는", "맛집", "SNS",
                "TV 나온", "연예인", "재방문", "단골", "소문난"
            ],
            "negative": [
                "한산한", "웨이팅 없다", "인기 없다", "알려지지 않다"
            ]
        }
    },
    "카페": {
        "편한좌석": {
            "positive": [
                "편한", "소파", "쿠션", "푹신", "넓은", "여유로운", "안락"
            ],
            "negative": [
                "불편", "딱딱한", "좁은", "비좁은", "오래 앉기 힘들다"
            ]
        },
        "카공": {
            "positive": [
                "카공", "공부", "스터디", "작업", "업무", "노트북",
                "와이파이", "wifi", "콘센트", "전원", "충전", "조용"
            ],
            "negative": [
                "카공 불가", "공부 금지", "노트북 사용 제한",
                "콘센트 없다", "와이파이 약하다"
            ]
        },
        "노키즈존": {
            "positive": [
                "노키즈", "성인 전용", "어른 전용", "출입 금지"
            ],
            "negative": [
                "아이들 많다", "시끄럽다", "노키즈존 아니다", "키즈 카페"
            ]
        },
        "분위기좋은": {
            "positive": [
                "분위기", "무드", "감성", "갬성", "뷰", "조명", "인테리어",
                "창가", "테라스", "음악", "bgm", "힐링"
            ],
            "negative": [
                "분위기 별로", "무드 없다", "감성 없다", "밋밋한"
            ]
        },
        "인테리어": {
            "positive": [
                "인테리어", "디자인", "꾸밈", "감각적", "세련된", "모던",
                "빈티지", "유니크", "독특", "컨셉", "벽화", "아트"
            ],
            "negative": [
                "인테리어 별로", "꾸밈 없다", "단조로운", "특색 없다"
            ]
        },
        "디저트": {
            "positive": [
                "디저트", "케이크", "마카롱", "쿠키", "타르트", "와플",
                "달콤", "수제", "홈메이드"
            ],
            "negative": [
                "디저트 별로", "케이크 없다", "달지 않다", "맛없는"
            ]
        },
        "조용한": {
            "positive": [
                "조용", "차분", "정숙", "평화", "고요", "힐링", "한적"
            ],
            "negative": [
                "시끄럽다", "소음", "떠들썩", "북적북적", "혼잡"
            ]
        },
        "24시간": {
            "positive": [
                "24 시간", "24 시", "밤늦게", "새벽", "심야", "올나잇"
            ],
            "negative": [
                "24 시간 아니다", "일찍 닫다", "밤에 문 닫다", "늦은 시간 안됨"
            ]
        }
    },
    "편의점": {
        "야외좌석": {
            "positive": [
                "야외", "테라스", "밖에", "외부", "옥외"
            ],
            "negative": [
                "야외 좌석 없다", "테라스 없다", "실내만"
            ]
        },
        "ATM": {
            "positive": [
                "ATM", "현금 인출기", "CD 기", "은행 기기", "출금"
            ],
            "negative": [
                "ATM 없다", "현금 인출 불가", "돈 못 뽑다"
            ]
        },
        "취식공간": {
            "positive": [
                "취식", "먹을곳", "테이블", "의자", "이트인", "좌석"
            ],
            "negative": [
                "취식 공간 없다", "먹을 곳 없다", "앉을 곳 없다", "포장만"
            ]
        }
    },
    "약국": {
        "친절": {
            "positive": [
                "친절", "상냥", "다정", "설명", "자세히", "꼼꼼"
            ],
            "negative": [
                "불친절", "차갑", "무뚝뚝", "설명 부족", "귀찮아하다"
            ]
        },
        "비처방의약품": {
            "positive": [
                "일반 의약품", "일반약", "OTC", "감기약", "두통약", "소화제",
                "파스", "비타민", "처방전 없이", "상비약"
            ],
            "negative": [
                "일반약 없다", "처방전 필요", "전문 의약품만"
            ]
        }
    },
    "호텔": {
        "스파/월풀/욕조": {
            "positive": [
                "스파", "온천", "사우나", "찜질", "자쿠지", "월풀", "욕조", "힐링"
            ],
            "negative": [
                "스파 없다", "온천 없다", "사우나 없다", "월풀 없다", "욕조 없다"
            ]
        },
        "반려동물 동반": {
            "positive": [
                "반려 동물", "애완 동물", "펫", "강아지", "고양이", "댕댕이", "동반 가능"
            ],
            "negative": [
                "반려 동물 불가", "애완 동물 불가", "펫 불가", "동물 금지"
            ]
        },
        "주차가능": {
            "positive": [
                "주차", "무료 주차", "주차장", "주차 면", "주차 자리", "발렛"
            ],
            "negative": [
                "주차 어렵다", "주차장 없다", "주차 불가", "주차비 비싸다"
            ]
        },
        "전기차 충전": {
            "positive": [
                "전기차", "전기 충전", "충전소", "충전기", "EV", "전기 자동차"
            ],
            "negative": [
                "전기차 충전 없다", "충전소 없다", "충전 불가"
            ]
        },
        "객실금연": {
            "positive": [
                "금연", "객실 금연", "흡연 금지", "금연 객실", "깨끗한 공기"
            ],
            "negative": [
                "금연 아니다", "흡연 가능", "금연 객실 없다"
            ]
        },
        "OTT": {
            "positive": [
                "OTT", "넷플릭스", "유튜브", "웨이브", "티빙", "스트리밍", "TV"
            ],
            "negative": [
                "OTT 없다", "넷플릭스 없다", "TV 없다", "스트리밍 불가"
            ]
        },
        "수영장": {
            "positive": [
                "수영장", "풀", "pool", "물놀이", "키즈 풀", "인피니티"
            ],
            "negative": [
                "수영장 없다", "물놀이 불가", "수영 불가"
            ]
        },
        "객실내 PC": {
            "positive": [
                "PC", "컴퓨터", "노트북", "인터넷", "와이파이", "wifi", "콘센트"
            ],
            "negative": [
                "PC 없다", "컴퓨터 없다", "인터넷 없다", "와이파이 없다"
            ]
        },
        "바베큐": {
            "positive": [
                "바베큐", "BBQ", "그릴", "야외 요리", "고기 굽기", "파티"
            ],
            "negative": [
                "바베큐 없다", "그릴 없다", "야외 요리 불가"
            ]
        },
        "조식": {
            "positive": [
                "조식", "아침 식사", "breakfast", "모닝", "뷔페", "식사 제공"
            ],
            "negative": [
                "조식 없다", "아침 식사 불가", "식사 제공 안함"
            ]
        }
    },
    "헤어샵": {
        "인기많은": {
            "positive": [
                "인기", "유명", "예약 어렵다", "웨이팅", "잘하는", "실력"
            ],
            "negative": [
                "예약 쉽다", "한산", "유명하지 않다"
            ]
        },
        "쿠폰멤버십": {
            "positive": [
                "쿠폰", "할인", "멤버십", "적립", "이벤트", "혜택"
            ],
            "negative": [
                "쿠폰 없다", "할인 안됨", "혜택 없다"
            ]
        },
        "예약필수": {
            "positive": [
                "예약 필수", "사전 예약", "미리", "예약제"
            ],
            "negative": [
                "예약 안해도 됨", "바로 방문", "워킹 가능"
            ]
        }
    },
    "병원": {
        "응급실": {
            "positive": [
                "응급실", "응급", "24 시간", "종합 병원", "ER", "구급차"
            ],
            "negative": [
                "응급실 없다", "응급 불가", "24 시간 아니다"
            ]
        },
        "전문의": {
            "positive": [
                "전문의", "전문가", "교수", "박사", "스페셜리스트"
            ],
            "negative": [
                "전문의 없다", "일반의", "전문 진료 불가"
            ]
        },
        "야간진료": {
            "positive": [
                "야간", "밤", "저녁", "24 시간", "심야", "당직"
            ],
            "negative": [
                "야간 진료 없다", "일찍 닫다", "밤에 안됨"
            ]
        }
    }
}


# AI 모델 로드 (앱 시작 시 로드)
print("AI 모델들을 로딩 중...")

# 2. NER 모델 (위치 추출용) - 앙상블 로딩 (규칙/하드코딩 없이 모델 병행)
try:
    ner_pipeline_primary = pipeline(
        "ner",
        model="Davlan/bert-base-multilingual-cased-ner-hrl",
        aggregation_strategy="simple",
        device=0 if torch.cuda.is_available() else -1,
    )
    print("✅ NER 모델 로드 완료 (primary): Davlan/bert-base-multilingual-cased-ner-hrl")
except Exception as e:
    print(f"⚠️ NER primary 모델 로드 실패: {e}")
    ner_pipeline_primary = None

try:
    ner_pipeline_secondary = pipeline(
        "ner",
        model="Babelscape/wikineural-multilingual-ner",
        aggregation_strategy="simple",
        device=0 if torch.cuda.is_available() else -1,
    )
    print("✅ NER 모델 로드 완료 (secondary): Babelscape/wikineural-multilingual-ner")
except Exception as e:
    print(f"⚠️ NER secondary 모델 로드 실패: {e}")
    ner_pipeline_secondary = None

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

# ------------------ AI 기반 NLP ------------------
def normalize(text: str) -> str:
    return text.strip()


def classify_category_with_ai(text: str) -> str:
    """보수적 분류: 입력에 카테고리 키워드가 '명시적으로' 포함될 때만 인정."""
    if not text:
        return None

    # 카테고리 키워드가 여러 개 나타나면 모호하므로 추정을 하지 않음
    matches = [label for label in CATEGORY_LABELS if label in text]
    if len(matches) == 1:
        return matches[0]
    else:
        return None


def extract_features_with_ai(text: str, category: str) -> list:
    """사전에 정의된 positive/negative 표현으로만 특성을 추출한다.
    - 카테고리가 주어지면 해당 카테고리만 검사
    - 카테고리가 없으면 모든 카테고리의 특성을 검사하되, 부정 표현이 하나라도 있으면 제외
    - 공백 무시 매칭 지원 (예: "24 시간" ↔ "24시간")
    """
    if not text:
        return []

    def norm(s: str) -> str:
        return re.sub(r"\s+", "", s or "")

    text_norm = norm(text)

    categories_to_scan = [category] if category and category in KEYWORD_DICT else list(KEYWORD_DICT.keys())

    selected_features: list = []
    seen = set()
    for cat in categories_to_scan:
        feature_map = KEYWORD_DICT.get(cat, {})
        for feature_name, expr in feature_map.items():
            positives = expr.get("positive", [])
            negatives = expr.get("negative", [])

            def contains_any(phrases: list) -> bool:
                for p in phrases:
                    if p and (p in text or norm(p) in text_norm):
                        return True
                return False

            if contains_any(negatives):
                continue
            if contains_any(positives):
                if feature_name not in seen:
                    seen.add(feature_name)
                    selected_features.append(feature_name)

    return selected_features




def extract_location_with_ai(text: str) -> str:
    """개선된 NER을 사용하여 위치 정보 추출"""
    if (globals().get('ner_pipeline_primary') is None) and (globals().get('ner_pipeline_secondary') is None):
        return None
    
    try:
        def run_and_collect(pipeline_fn):
            if pipeline_fn is None:
                return []
            ents = pipeline_fn(text)
            locs = []
            for entity in ents:
                if entity.get('entity_group') in ['LOC', 'LC', 'GPE', 'LOCATION', 'B-LOC', 'I-LOC']:
                    token = (entity.get('word') or '').strip()
                    if len(token) >= 2:
                        locs.append({'text': token, 'score': float(entity.get('score', 0.0))})
            return locs

        candidates = run_and_collect(globals().get('ner_pipeline_primary')) + \
                     run_and_collect(globals().get('ner_pipeline_secondary'))

        if not candidates:
            return None

        candidates.sort(key=lambda x: x['score'], reverse=True)
        return candidates[0]['text']
        
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