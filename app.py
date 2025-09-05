from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from dotenv import load_dotenv

# 간단한 형태소 분석기: kiwipiepy (가벼운 한국어 형태소 분석)
try:
    from kiwipiepy import Kiwi  # type: ignore
    kiwi: Optional[Kiwi] = Kiwi()
except Exception:
    kiwi = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    places: list | None = None


app = FastAPI(title="MAPro Chat API", version="0.1.0")

# CORS 설정: VM 외부 IP 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://34.64.120.99:3000",
        "http://34.64.120.99:80",
        "http://34.64.120.99",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    user_message = (req.message or "").strip()
    if not user_message:
        return ChatResponse(reply="메시지가 비어 있어요.")

    # 1) NLP: 카테고리/특성/지역 추출
    extracted = extract_query(user_message)
    # 2) DB 조회
    matched_places = query_places(extracted)
    # 3) 응답 생성
    if matched_places:
        reply_text = build_reply(extracted, matched_places)
        return ChatResponse(reply=reply_text, places=[{"name": p["name"]} for p in matched_places[:5]])
    else:
        return ChatResponse(reply="조건에 맞는 매장을 찾지 못했어요. 다른 키워드로 시도해 보시겠어요?", places=None)


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
    host = os.getenv("DB_HOST", "34.22.81.216")
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


# ------------------ 도메인 사전 ------------------
CATEGORY_KEYWORDS = {
    "음식점": ["음식점", "식당", "맛집"],
    "카페": ["카페", "카공"],
    "편의점": ["편의점"],
    "약국": ["약국"],
    "호텔": ["호텔"],
    "헤어샵": ["헤어샵", "미용실", "헤어 살롱"],
    "병원": ["병원", "의원", "클리닉"],
}

FEATURE_KEYWORDS = {
    "음식점": ["유아의자", "혼밥", "새로오픈", "데이트", "노키즈존", "지역화폐", "주차", "인기많은"],
    "카페": ["편한좌석", "카공", "노키즈존", "분위기좋은", "인테리어", "디저트", "조용한", "24시간"],
    "편의점": ["야외좌석", "ATM", "취식공간"],
    "약국": ["친절", "비처방의약품"],
    "호텔": ["스파/월풀/욕조", "반려동물 동반", "주차가능", "전기차 충전", "객실금연", "OTT", "수영장", "객실내 PC", "바베큐", "조식"],
    "헤어샵": ["인기많은", "쿠폰멤버십", "예약필수"],
    "병원": ["응급실", "전문의", "야간진료"],
}


# ------------------ NLP ------------------
def normalize(text: str) -> str:
    return text.strip()


def extract_query(text: str) -> dict:
    t = normalize(text)

    # 형태소 분석으로 명사/형용사 후보 확보 (실패 시 단순 분리)
    tokens: List[str]
    if kiwi:
        tokens = [lemma for lemma, tag, _, _ in kiwi.analyze(t)[0][0] if tag.startswith("N") or tag.startswith("VA")]
    else:
        tokens = t.replace(",", " ").replace("/", " ").split()

    # 카테고리 결정
    category = None
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in t for kw in kws):
            category = cat
            break

    # 특성 추출
    features = []
    if category and category in FEATURE_KEYWORDS:
        for f in FEATURE_KEYWORDS[category]:
            if f in t:
                features.append(f)

    # 위치(간단 추론: '구', '동' 포함 토큰 또는 고정 키워드)
    location = None
    for tok in tokens:
        if tok.endswith("구") or tok.endswith("동") or tok.endswith("시"):
            location = tok
            break
    # 자주 쓰는 지역 키워드 백업
    COMMON_LOCS = ["강남", "강남구", "서초", "서초구", "판교", "분당", "일산", "파주", "운정", "홍대", "여의도", "잠실"]
    if not location:
        for loc in COMMON_LOCS:
            if loc in t:
                location = loc if loc.endswith(("구", "동", "시")) else f"{loc}"
                break

    return {"category": category, "features": features, "location": location}


# ------------------ DB 조회 ------------------
def query_places(query: dict):
    engine = get_db_engine()
    category = query.get("category")
    features = query.get("features") or []
    location = query.get("location")

    # 기본 WHERE
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

    # 우선 후보 가져오기
    sql = text(base_sql + " ORDER BY updated_at DESC, created_at DESC LIMIT 100")
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
    return rows[:10]


# ------------------ 응답 생성 ------------------
def build_reply(query: dict, places: list) -> str:
    parts = []
    if query.get("location"):
        parts.append(f"{query['location']}")
    if query.get("category"):
        parts.append(f"{query['category']}")
    if query.get("features"):
        parts.append(", ".join(query["features"]))

    cond = " ".join(parts) if parts else "조건"
    names = ", ".join([p["name"] for p in places[:3]])
    return f"{cond} 조건으로 {len(places)}곳을 찾았어요. 예: {names}"


