from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from dotenv import load_dotenv

# 간단한 형태소 분석기: kiwipiepy (가벼운 한국어 형태소 분석)
# 컨테이너 기동 시 메모리 피크를 피하기 위해 지연 로딩
KIWI_INSTANCE = None

def get_kiwi():
    global KIWI_INSTANCE
    if KIWI_INSTANCE is not None:
        return KIWI_INSTANCE

    # 영구 비활성화 옵션(운영에서 완전히 끄고 싶을 때만 사용)
    if os.getenv("KIWI_PERMANENT_DISABLE", "0") in ("1", "true", "True"):  # type: ignore
        return None
    try:
        print("[DEBUG] Attempting to import Kiwi...")
        from kiwipiepy import Kiwi  # type: ignore
        print("[DEBUG] Kiwi imported successfully, creating instance...")
        
        # 타임아웃 설정 (5초)
        import signal
        import threading
        import time
        
        def create_kiwi_with_timeout():
            try:
                KIWI_INSTANCE = Kiwi()
                return KIWI_INSTANCE
            except Exception as e:
                print(f"[DEBUG] Kiwi creation failed: {e}")
                return None
        
        # 별도 스레드에서 Kiwi 생성
        result = [None]
        exception = [None]
        
        def target():
            try:
                result[0] = create_kiwi_with_timeout()
            except Exception as e:
                exception[0] = e
        
        thread = threading.Thread(target=target)
        thread.daemon = True
        thread.start()
        thread.join(timeout=5)  # 5초 타임아웃
        
        if thread.is_alive():
            print("[DEBUG] Kiwi loading timeout, falling back to simple tokenization")
            return None
        
        if exception[0]:
            print(f"[DEBUG] Kiwi creation exception: {exception[0]}")
            return None
            
        if result[0]:
            print("[DEBUG] Kiwi instance created successfully")
            return result[0]
        else:
            print("[DEBUG] Kiwi creation returned None")
            return None
            
    except Exception as e:
        print(f"[DEBUG] Kiwi import/creation failed: {e}")
        return None


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
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    print(f"[DEBUG] Chat endpoint called with message: {req.message}")
    user_message = (req.message or "").strip()
    if not user_message:
        print("[DEBUG] Empty message received")
        return ChatResponse(reply="메시지가 비어 있어요.")

    try:
        print(f"[DEBUG] Step 1: Starting NLP extraction for: {user_message}")
        # 1) NLP: 카테고리/특성/지역 추출
        extracted = extract_query(user_message)
        print(f"[DEBUG] Step 1 Complete: Extracted data = {extracted}")
        
        print("[DEBUG] Step 2: Starting database query")
        # 2) DB 조회
        matched_places = query_places(extracted)
        print(f"[DEBUG] Step 2 Complete: Found {len(matched_places)} places")
        
        print("[DEBUG] Step 3: Building response")
        # 3) 응답 생성
        if matched_places:
            reply_text = build_reply(extracted, matched_places)
            print(f"[DEBUG] Step 3 Complete: Reply text = {reply_text}")
            return ChatResponse(reply=reply_text, places=[{"name": p["name"]} for p in matched_places[:5]])
        else:
            print("[DEBUG] Step 3 Complete: No places found")
            return ChatResponse(reply="조건에 맞는 매장을 찾지 못했어요. 다른 키워드로 시도해 보시겠어요?", places=None)
    except Exception as e:
        print(f"[ERROR] Chat endpoint error at step: {str(e)}")
        import traceback
        print(f"[ERROR] Full traceback: {traceback.format_exc()}")
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
        print("[DEBUG] Creating new database engine")
        ENGINE = get_engine()
        print(f"[DEBUG] Database engine created: {ENGINE is not None}")
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
    print(f"[DEBUG] extract_query called with: {text}")
    t = normalize(text)
    print(f"[DEBUG] Normalized text: {t}")

    # 형태소 분석으로 명사/형용사 후보 확보 (실패 시 단순 분리)
    tokens: List[str]
    kiwi = get_kiwi()
    print(f"[DEBUG] Kiwi instance available: {kiwi is not None}")
    
    if kiwi:
        try:
            print("[DEBUG] Starting Kiwi analysis")
            tokens = [lemma for lemma, tag, _, _ in kiwi.analyze(t)[0][0] if tag.startswith("N") or tag.startswith("VA")]
            print(f"[DEBUG] Kiwi tokens: {tokens}")
        except Exception as e:
            print(f"[DEBUG] Kiwi analysis failed: {e}, using fallback")
            tokens = t.replace(",", " ").replace("/", " ").split()
    else:
        print("[DEBUG] Kiwi not available, using fallback")
        tokens = t.replace(",", " ").replace("/", " ").split()
    
    print(f"[DEBUG] Final tokens: {tokens}")

    # 카테고리 결정
    print("[DEBUG] Starting category detection")
    category = None
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in t for kw in kws):
            category = cat
            print(f"[DEBUG] Found category: {category}")
            break
    print(f"[DEBUG] Final category: {category}")

    # 특성 추출
    print("[DEBUG] Starting feature extraction")
    features = []
    if category and category in FEATURE_KEYWORDS:
        for f in FEATURE_KEYWORDS[category]:
            if f in t:
                features.append(f)
                print(f"[DEBUG] Found feature: {f}")
    print(f"[DEBUG] Final features: {features}")

    # 위치(간단 추론: '구', '동' 포함 토큰 또는 고정 키워드)
    print("[DEBUG] Starting location detection")
    location = None
    for tok in tokens:
        if tok.endswith("구") or tok.endswith("동") or tok.endswith("시"):
            location = tok
            print(f"[DEBUG] Found location from tokens: {location}")
            break
    # 자주 쓰는 지역 키워드 백업
    COMMON_LOCS = ["강남", "강남구", "서초", "서초구", "판교", "분당", "일산", "파주", "운정", "홍대", "여의도", "잠실"]
    if not location:
        for loc in COMMON_LOCS:
            if loc in t:
                location = loc if loc.endswith(("구", "동", "시")) else f"{loc}"
                print(f"[DEBUG] Found location from common locs: {location}")
                break
    print(f"[DEBUG] Final location: {location}")

    result = {"category": category, "features": features, "location": location}
    print(f"[DEBUG] extract_query result: {result}")
    return result


# ------------------ DB 조회 ------------------
def query_places(query: dict):
    print(f"[DEBUG] query_places called with: {query}")
    try:
        print("[DEBUG] Getting database engine")
        engine = get_db_engine()
        print(f"[DEBUG] Engine obtained: {engine is not None}")
        
        category = query.get("category")
        features = query.get("features") or []
        location = query.get("location")
        print(f"[DEBUG] Query params - category: {category}, features: {features}, location: {location}")

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

        print(f"[DEBUG] SQL query: {base_sql}")
        print(f"[DEBUG] SQL params: {params}")

        # 우선 후보 가져오기
        sql = text(base_sql + " ORDER BY updated_at DESC, created_at DESC LIMIT 100")
        print("[DEBUG] Attempting database connection")
        
        with engine.connect() as conn:
            print("[DEBUG] Database connection successful")
            print("[DEBUG] Executing SQL query")
            rows = [dict(r._mapping) for r in conn.execute(sql, params)]
            print(f"[DEBUG] Query executed, got {len(rows)} rows")

        if not rows:
            print("[DEBUG] No rows returned from database")
            return []

        print(f"[DEBUG] Sample row: {rows[0] if rows else 'None'}")

        # 특성 점수 기반 정렬
        print("[DEBUG] Starting feature scoring")
        def score(row):
            row_features = (row.get("feature") or "").split(",")
            row_features = [rf.strip() for rf in row_features if rf.strip()]
            score_value = sum(1 for f in features if f in row_features)
            print(f"[DEBUG] Row {row.get('name', 'unknown')} score: {score_value}")
            return score_value

        rows.sort(key=score, reverse=True)
        result = rows[:10]
        print(f"[DEBUG] Final result: {len(result)} places")
        return result
    except Exception as e:
        print(f"[ERROR] Database query error: {str(e)}")
        import traceback
        print(f"[ERROR] Database traceback: {traceback.format_exc()}")
        return []  # DB 오류 시 빈 리스트 반환


# ------------------ 응답 생성 ------------------
def build_reply(query: dict, places: list) -> str:
    print(f"[DEBUG] build_reply called with query: {query}, places: {len(places)}")
    parts = []
    if query.get("location"):
        parts.append(f"{query['location']}")
    if query.get("category"):
        parts.append(f"{query['category']}")
    if query.get("features"):
        parts.append(", ".join(query["features"]))

    cond = " ".join(parts) if parts else "조건"
    names = ", ".join([p["name"] for p in places[:3]])
    result = f"{cond} 조건으로 {len(places)}곳을 찾았어요. 예: {names}"
    print(f"[DEBUG] build_reply result: {result}")
    return result


