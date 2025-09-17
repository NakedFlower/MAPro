from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from dotenv import load_dotenv
import re
import requests

# ------------------ 지역명 처리 클래스 ------------------
class LocationService:
    def __init__(self):
        self.api_key = os.getenv("MOIS_API_KEY", "devU01TX0FVVEgyMDI1MDkxMjExMzczMjExNjE3ODE=")
        self.api_url = "https://business.juso.go.kr/addrlink/addrLinkApi.do"

    def _call_mois_api(self, keyword: str, max_results: int = 20, timeout_sec: float = 0.7) -> list:
        if not keyword or not self.api_key:
            return []
        params = {
            "confmKey": self.api_key,
            "resultType": "json",
            "currentPage": "1",
            "countPerPage": str(max_results),
            "keyword": keyword,
        }
        try:
            resp = requests.get(self.api_url, params=params, timeout=timeout_sec)
            if resp.status_code != 200:
                return []
            data = resp.json() if resp.content else None
            return ((data or {}).get("results") or {}).get("juso") or []
        except Exception:
            return []

    def _parse_region_from_address(self, addr: str) -> Optional[str]:
        if not addr:
            return None
        tokens = addr.strip().split()
        if not tokens:
            return None
        def is_region_token(tok: str) -> bool:
            return tok.endswith(("시", "군", "구"))
        region_tokens = [t for t in tokens[:5] if is_region_token(t)]
        if not region_tokens:
            sub_tokens = [t for t in tokens[:5] if t.endswith(("동", "읍", "면"))]
            return sub_tokens[0] if sub_tokens else None
        def simplify(tok: str) -> str:
            return tok.replace("특별시", "").replace("광역시", "").replace("자치구", "").strip()
        simplified = [simplify(t) for t in region_tokens[:2]]
        return " ".join([t for t in simplified if t]) or None

    def _generate_location_candidates(self, text: str) -> list:
        if not text:
            return []
        candidates = []
        seen = set()
        def push(s: str):
            key = s.strip()
            if key and key not in seen:
                seen.add(key)
                candidates.append(key)
        push(text)
        tokens = text.split()
        admin_suffixes = ("시", "군", "구", "동", "읍", "면")
        trial_suffixes = ("구", "시", "군")
        for tok in tokens:
            if not tok:
                continue
            if tok.endswith(admin_suffixes):
                push(tok)
                continue
            for suf in trial_suffixes:
                push(f"{tok}{suf}")
                push(text.replace(tok, f"{tok}{suf}", 1))
        return candidates

    def get_location_candidates(self, text: str, timeout_sec: float = 0.7) -> list:
        candidates = []
        seen = set()
        for keyword in self._generate_location_candidates(text):
            juso_list = self._call_mois_api(keyword, timeout_sec=timeout_sec)
            for juso in juso_list:
                addr = juso.get("roadAddr") or juso.get("jibunAddr") or ""
                region = self._parse_region_from_address(addr)
                tokens = addr.split()
                dong = next((t for t in tokens if t.endswith(("동", "읍", "면"))), None)
                if region:
                    label = f"{region} {dong}".strip() if dong and dong not in region else region
                    if label and label not in seen:
                        seen.add(label)
                        candidates.append(label)
        return candidates[:5]

    def resolve_single_location(self, text: str, timeout_sec: float = 0.7) -> Optional[str]:
        candidates = self.get_location_candidates(text, timeout_sec)
        return candidates[0] if len(candidates) == 1 else None

# 지역 처리 서비스 인스턴스 생성
location_service = LocationService()

# ------------------ 분류/키워드 사전 ------------------
# 카테고리 매핑
CATEGORY_PHRASES = {
    "음식점": ["음식점", "식당", "레스토랑", "먹을데", "먹을 곳", "밥집", "맛집"],
    "카페": ["카페", "커피숍", "커피 숍", "다방", "카페테리아", "카페라운지"],
    "편의점": ["편의점", "편의 마트", "상점"],
    "약국": ["약국"],
    "호텔": ["호텔", "숙소", "숙박", "레지던스", "리조트"],
    "헤어샵": ["헤어샵", "미용실", "헤어 살롱", "헤어살롱", "살롱","바버샵", "이발소"],
    "병원": ["병원", "의원", "클리닉", "메디컬"]
}

# 1. 키워드-표현 사전 정의
KEYWORD_DICT = {
    "음식점": {
        "유아의자": {
            "positive": [
                "유아", "아기", "하이 체어", "베이비 체어", "키즈", "어린이", "아이", "아가", "애기",
                "유모차", "베이비 카", "육아 맘", "애기 엄마", "엄마", "맘", "모유", "수유", "기저귀",
                "유아차", "카시트", "붐체어", "아기의자", "어린이의자", "키즈체어", "하이체어",
                "영유아", "신생아", "걸음마", "토들러", "어머니", "부모", "가족단위", "패밀리",
                "애들", "꼬마", "꼬맹이", "애기들", "아이들", "소아", "미취학", "유치원",
                "임신부", "임산부", "출산", "육아", "자녀", "딸", "아들", "첫째", "둘째",
                "쌍둥이", "다둥이", "워킹맘", "육아맘", "신혼부부"
            ],
            "negative": [
                "유아 의자 없다", "아기 의자 없다", "하이 체어 없다", "베이비 체어 없다",
                "아이 앉히다 곳 없다", "키즈 의자 없다", "아이 데리 고 가기 힘들다"
            ]
        },
        "혼밥": {
            "positive": [
                "혼밥", "1인", "솔로", "혼자", "카운터 석", "바 테이블", "홀로", "나홀로",
                "개인", "단독", "1인석", "바석", "카운터", "혼자서", "혼자만", "홀몸",
                "원맨", "1인용", "싱글", "개별", "혼행", "혼자 식사", "1인 식사",
                "개인 식사", "솔로 식사", "혼밥족", "혼밥러", "나 혼자", "외로운",
                "혼자 오다", "혼자 방문", "1인 방문", "개인 방문", "솔로 방문"
            ],
            "negative": [
                "혼밥 불가", "1 인 안됨", "혼자 오기 어렵다", "1 인석 없다",
                "2 인 이상", "단체 전용", "커플 전용", "가족 전용"
            ]
        },
        "새로오픈": {
            "positive": [
                "새롭다", "신규", "오픈", "그랜드", "리뉴얼", "신상", "뉴", "신선",
                "최근", "갓", "막", "따끈따끈", "신생", "깨끗", "말끔", "새로", "신진",
                "새단장", "새로 생긴", "새로 문 열다", "새로 개업", "개업", "개점",
                "신규 오픈", "그랜드 오픈", "소프트 오픈", "프리 오픈", "베타 오픈",
                "리오픈", "재오픈", "재개업", "재개점", "새단장 오픈", "새로워진",
                "새로 바뀐", "새로 단장", "새롭게", "개선", "업그레이드", "신축",
                "신설", "신생", "따끈", "막 오픈", "갓 오픈", "방금 열다"
            ],
            "negative": [
                "오래된", "전통", "역사", "원조", "본점", "노포", "수십 년"
            ]
        },
        "데이트": {
            "positive": [
                "데이트", "연인", "커플", "애인", "분위기", "무드", "로맨틱", "로맨스",
                "은은한 조명", "간접 조명", "캔들", "기념일", "프러포즈", "프로포즈",
                "힙한", "감성", "갬성", "뷰", "야경", "테라스", "루프탑", "옥상",
                "연애", "썸", "썸타다", "밀당", "소개팅", "미팅", "만남", "첫만남",
                "기념", "발렌타인", "화이트데이", "생일", "100일", "200일", "1주년",
                "결혼기념일", "특별한 날", "이벤트", "서프라이즈", "깜짝", "이색",
                "로맨틱한", "달달한", "설렘", "심쿵", "설레는", "두근두근", "느낌",
                "분위기 있는", "무드 있는", "고급진", "세련된", "감각적", "예쁜",
                "이쁜", "아름다운", "멋진", "근사한", "분위기 좋은", "뷰 맛집",
                "야경 맛집", "데이트 코스", "연인 코스", "커플 코스", "분위기 맛집"
            ],
            "negative": [
                "데이트 비추", "분위기 별로", "무드 없다", "시끄럽다",
                "형광등", "데이트 분위기 아니다"
            ]
        },
        "노키즈존": {
            "positive": [
                "노키즈", "성인 전용", "어른 전용", "19 세 이상", "출입 금지",
                "성인만", "어른만", "미성년자 금지",
                "아동 출입 금지", "키즈 출입 금지", "어린이 출입 금지", "유아 출입 금지",
                "조용한", "정적인", "차분한", "성인 공간", "어른 공간", "정숙",
                "미성년 출입 불가", "아동 금지", "키즈 금지", "어린이 금지"
            ],
            "negative": [
                "아이들 많다", "시끄럽다 아이들", "노키즈존 아니다",
                "키즈 카페", "키즈 프렌들리"
            ]
        },
        "지역화폐": {
            "positive": [
                "지역 화폐", "지역 상품권", "상품권", "지역 페이", "시민 페이",
                "QR코드", "QR 결제", "바코드", "바코드 결제", "앱 결제", "핸드폰 결제",
                "디지털 화폐", "전자 화폐", "전자 상품권", "디지털 상품권",
                "페이", "pay", "wallet", "월렛", "간편페이", "원터치", "터치결제"
            ],
            "negative": [
                "지역 화폐 안됨", "상품권 사용 불가", "페이 안됨",
                "현금만", "카드만"
            ]
        },
        "주차": {
            "positive": [
                "주차", "파킹", "무료 주차", "발렛", "주차장",
                "주차 면", "주차 자리", "주차 칸", "주차공간", "주차시설",
                "무료파킹", "발렛파킹", "셀프파킹", "지상주차", "지하주차",
                "옥외주차", "실내주차", "주차타워", "기계식주차", "평면주차",
                "주차요금", "주차비", "주차할인", "주차무료", "주차가능",
                "주차편리", "주차여유", "주차넓다", "차 세우기", "차 댈 곳",
                "차량", "자동차", "차", "승용차", "SUV", "트럭", "밴"
            ],
            "negative": [
                "주차 어렵다", "주차장 없다", "주차 힘들다", "주차 불가",
                "주차 난", "주차비 비싸다"
            ]
        },
        "인기많은": {
            "positive": [
                "인기", "핫한", "핫플", "유명", "웨이팅", "대기", "줄서기", "줄서다",
                "예약 필수", "예약 어렵다", "붐비는", "맛집", "SNS", "인스타", "블로그",
                "TV 나온", "연예인", "재방문", "단골", "소문난", "입소문", "화제",
                "대박", "핫", "뜨는", "뜨다", "뜨거운", "화제의", "인기 폭발",
                "줄 서는", "대기 시간", "웨이팅 시간", "예약 대기", "예약 밀림",
                "만석", "대기 줄", "웨이팅 줄", "인산인해", "북적북적",
                "방송", "TV", "드라마", "예능", "유튜브", "틱톡", "인플루언서",
                "셀럽", "스타", "아이돌", "배우", "연예계", "방송인", "BJ",
                "리뷰", "평점", "별점", "추천", "강추", "좋다", "맛있다", "최고",
                "검증된", "인정받은", "소셜", "바이럴", "핫이슈", "이슈"
            ],
            "negative": [
                "한산한", "웨이팅 없다", "인기 없다", "알려지지 않다"
            ]
        }
    },
    "카페": {
        "편한좌석": {
            "positive": [
                "편한", "소파", "쿠션", "푹신", "넓은", "여유로운", "안락", "편안한",
                "의자", "체어", "암체어", "라운지체어", "리클라이너",
                "소파석", "쿠션석", "안락의자", "편안한 의자", "푹신한 의자",
                "넓은 의자", "여유로운 좌석", "릴렉스", "휴식", "쉬기 좋은",
                "앉기 편한", "등받이", "팔걸이", "발받침", "오토만", "빈백"
            ],
            "negative": [
                "불편", "딱딱한", "좁은", "비좁은", "오래 앉기 힘들다"
            ]
        },
        "카공": {
            "positive": [
                "카공", "공부", "스터디", "작업", "업무", "노트북",
                "와이파이", "콘센트", "전원", "충전", "조용",
                "카페 공부", "카페 작업", "스터디카페", "북카페", "도서관",
                "독서", "책", "교재", "참고서", "문제집", "필기", "메모",
                "시험", "고시", "자격증", "토익", "토플", "수능", "대입", "편입",
                "과제", "레포트", "논문", "프로젝트", "회사일", "업무처리",
                "재택근무", "원격근무", "프리랜서", "창업", "사업", "기획",
                "컴퓨터", "태블릿", "아이패드", "맥북", "노트북", "pc",
                "인터넷", "온라인", "클라우드", "구글", "네이버", "유튜브",
                "전원 콘센트", "충전기", "어댑터", "USB", "멀티탭"
            ],
            "negative": [
                "카공 불가", "공부 금지", "노트북 사용 제한",
                "콘센트 없다", "와이파이 약하다"
            ]
        },
        "노키즈존": {
            "positive": [
                "노키즈", "성인 전용", "어른 전용", "출입 금지",
                "성인만", "어른만", "미성년자 금지", "19세 이상",
                "아동 출입 금지", "키즈 출입 금지", "어린이 출입 금지", "유아 출입 금지",
                "조용한", "정적인", "차분한", "성인 공간", "어른 공간", "정숙",
                "미성년 출입 불가", "아동 금지", "키즈 금지", "어린이 금지"
            ],
            "negative": [
                "아이들 많다", "시끄럽다", "노키즈존 아니다", "키즈 카페"
            ]
        },
        "분위기좋은": {
            "positive": [
                "분위기 좋은", "무드", "감성", "갬성", "뷰", "조명", "인테리어",
                "창가", "테라스", "음악", "bgm", "힐링",
                "예쁜", "이쁜", "아름다운", "멋진", "근사한", "세련된", "감각적",
                "풍경", "경치", "전망", "야경", "일출", "일몰", "노을", "바다",
                "산", "강", "호수", "공원", "숲", "나무", "꽃", "정원",
                "루프탑", "옥상", "발코니", "베란다", "창문", "통창", "창문가",
                "자연광", "햇살", "햇빛", "햇살 좋은", "밝은", "환한",
                "간접조명", "은은한 조명", "따뜻한 조명", "포근한", "아늑한",
                "로맨틱", "낭만", "감성적", "감성 카페", "갬성 카페", "힙한"
            ],
            "negative": [
                "분위기 별로", "무드 없다", "감성 없다", "밋밋한"
            ]
        },
        "인테리어": {
            "positive": [
                "인테리어", "디자인", "꾸밈", "감각적", "세련된", "모던",
                "빈티지", "유니크", "독특", "컨셉", "벽화", "아트",
                "장식", "소품", "가구", "테이블", "의자", "조명", "식물", "화분",
                "그림", "사진", "액자", "포스터", "스티커", "네온사인", "간판",
                "색깔", "컬러", "톤", "파스텔", "모노톤", "블랙앤화이트",
                "스타일", "테마", "콘셉트", "컨셉", "트렌드", "힙", "감각",
                "미니멀", "심플", "클래식", "레트로", "안틱", "러스틱",
                "인더스트리얼", "스칸디", "북유럽", "프렌치", "아메리칸"
            ],
            "negative": [
                "인테리어 별로", "꾸밈 없다", "단조로운", "특색 없다"
            ]
        },
        "디저트": {
            "positive": [
                "디저트", "케이크", "마카롱", "쿠키", "타르트", "와플",
                "달콤", "수제", "홈메이드",
                "빵", "크로아상", "스콘", "머핀", "도넛", "베이글", "샌드위치",
                "파이", "푸딩", "젤라토", "아이스크림", "소르베", "파르페",
                "티라미수", "치즈케이크", "초콜릿", "카라멜", "바닐라", "딸기",
                "맛있는", "달다", "단맛", "달달한", "깔끔한", "부드러운", "촉촉한",
                "바삭한", "고소한", "향긋한", "신선한", "프리미엄", "고급",
                "베이커리", "제과", "제빵", "패스트리", "브런치", "애프터눈티"
            ],
            "negative": [
                "디저트 별로", "케이크 없다", "달지 않다", "맛없는"
            ]
        },
        "조용한": {
            "positive": [
                "조용", "차분", "정숙", "평화", "고요", "힐링", "한적",
                "소음 없는", "시끄럽지 않은", "조용", 
                "차분한", "평화로운", "고요한", "적막", "정적",
                "휴식", "쉬기 좋은", "편안한", "안정적", "여유로운",
                "집중", "집중하기 좋은", "사색", "명상", "힐링 타임"
            ],
            "negative": [
                "시끄럽다", "소음", "떠들썩", "북적북적", "혼잡"
            ]
        },
        "24시간": {
            "positive": [
                "24 시간", "24 시", "밤늦게", "새벽", "심야", "올나잇", "24h",
                "24시", "이십사시간", "하루종일", "야간", "밤", "늦은 시간",
                "새벽 시간", "심야 시간", "밤샘", "밤새",
                "언제나", "항상", "늘", "계속", "무제한", "제한 없이"
            ],
            "negative": [
                "24 시간 아니다", "일찍 닫다", "밤에 문 닫다", "늦은 시간 안됨"
            ]
        }
    },
    "편의점": {
        "야외좌석": {
            "positive": [
                "야외", "테라스", "밖에", "외부", "옥외",
                "바깥", "바깥쪽", "실외", "노천", "오픈에어", "야외석",
                "야외 테이블", "야외 의자", "테라스석", "파라솔", "그늘막",
                "하늘", "공기", "바람", "자연", "신선한 공기", "환기"
            ],
            "negative": [
                "야외 좌석 없다", "테라스 없다", "실내만"
            ]
        },
        "ATM": {
            "positive": [
                "ATM", "현금 인출기", "CD 기", "은행 기기", "출금",
                "현금", "돈", "인출", "출금기", "자동출금기", "현금자동지급기",
                "ATM기", "CD기", "현금지급기", "은행", "금고", "카드",
                "체크카드", "신용카드", "통장", "계좌", "잔고", "수수료"
            ],
            "negative": [
                "ATM 없다", "현금 인출 불가", "돈 못 뽑다"
            ]
        },
        "취식공간": {
            "positive": [
                "취식", "먹을곳", "테이블", "의자", "이트인", "좌석",
                "식사", "음식", "먹기", "앉아서", "테이블석", "의자석",
                "취식 공간", "식사 공간", "테이블 공간", "앉을 곳", "쉴 곳",
                "편의점 테이블", "편의점 의자", "편의점 좌석", "간이 테이블",
                "간이 의자", "플라스틱 테이블", "플라스틱 의자", "바 테이블",
                "높은 테이블", "스탠딩 테이블", "카운터 테이블"
            ],
            "negative": [
                "취식 공간 없다", "먹을 곳 없다", "앉을 곳 없다", "포장만"
            ]
        }
    },
    "약국": {
        "친절": {
            "positive": [
                "친절", "상냥", "다정", "설명", "자세히", "꼼꼼",
                "친절한", "상냥한", "다정한", "따뜻한", "부드러운", "정중한",
                "예의바른", "공손한", "세심한", "배려", "배려심", "서비스",
                "미소", "웃음", "웃는", "밝은", "활기찬", "긍정적",
                "설명 잘해주다", "자세한 설명", "꼼꼼한 설명", "친절한 설명",
                "상담", "조언", "도움", "도와주다", "챙겨주다", "신경써주다",
                "약사", "직원", "스태프", "사장", "사장님", "원장", "선생님"
            ],
            "negative": [
                "불친절", "차갑", "무뚝뚝", "설명 부족", "귀찮아하다"
            ]
        },
        "비처방의약품": {
            "positive": [
                "일반 의약품", "일반약", "OTC", "감기약", "두통약", "소화제",
                "파스", "비타민", "처방전 없이", "상비약",
                "처방전 불필요", "처방전 필요 없는", "바로 살 수 있는",
                "해열제", "진통제", "소염제", "항히스타민제", "종합감기약",
                "기침약", "가래약", "콧물약", "코감기약", "목감기약",
                "배탈", "설사", "변비", "위장약", "제산제", "정장제",
                "영양제", "보조제", "건강식품", "유산균", "오메가3",
                "마그네슘", "칼슘", "철분", "아연", "비타민C", "비타민D",
                "연고", "크림", "로션", "밴드", "거즈", "소독약",
                "안약", "귀약", "코 스프레이", "목 스프레이", "물약"
            ],
            "negative": [
                "일반약 없다", "처방전 필요", "전문 의약품만"
            ]
        }
    },
    "호텔": {
        "스파/월풀/욕조": {
            "positive": [
                "스파", "온천", "사우나", "찜질", "자쿠지", "월풀", "욕조", "힐링",
                "온수", "온탕", "냉탕", "노천탕", "실내탕", "대욕장", "목욕",
                "입욕", "반신욕", "족욕", "한증막", "황토", "편백", "옥",
                "마사지", "아로마", "테라피", "치료", "휴식", "재충전",
                "스파 시설", "웰니스", "힐링 센터", "휴양", "리조트",
                "물놀이", "수치료", "수압 마사지", "기포욕", "버블욕"
            ],
            "negative": [
                "스파 없다", "온천 없다", "사우나 없다", "월풀 없다", "욕조 없다"
            ]
        },
        "반려동물 동반": {
            "positive": [
                "반려 동물", "애완 동물", "펫", "강아지", "고양이", "댕댕이", "동반 가능",
                "반려견", "반려묘", "애견", "애묘", "개", "냥이", "멍멍이",
                "펫동반", "펫 프렌들리", "동물 동반", "강아지 동반", "고양이 동반",
                "애완동물 허용", "반려동물 허용", "펫 허용", "동물 허용",
                "펫샵", "펫호텔", "펫카페", "펫 전용", "펫 서비스",
                "산책", "애견 동반", "소형견", "중형견", "대형견", "견종",
                "목줄", "리드줄", "하네스", "애견용품", "펫용품", "사료"
            ],
            "negative": [
                "반려 동물 불가", "애완 동물 불가", "펫 불가", "동물 금지"
            ]
        },
        "주차가능": {
            "positive": [
                "주차", "무료 주차", "주차장", "주차 면", "주차 자리", "발렛",
                "무료파킹", "주차 가능", "주차시설",
                "주차공간", "주차타워", "지하주차장", "지상주차장", "옥외주차",
                "실내주차", "기계식주차", "평면주차", "입체주차", "자주식주차",
                "셀프주차", "발렛파킹", "주차요금", "주차비", "주차할인",
                "무료주차", "주차 서비스", "파킹 서비스", "주차 편의",
                "주차 여유", "넓은 주차", "주차 넉넉", "차량", "자동차", "승용차"
            ],
            "negative": [
                "주차 어렵다", "주차장 없다", "주차 불가", "주차비 비싸다"
            ]
        },
        "전기차 충전": {
            "positive": [
                "전기차", "전기 충전", "충전소", "충전기", "EV", "전기 자동차",
                "전기차 충전", "EV 충전", "급속충전", "완속충전", "충전시설",
                "충전 서비스", "충전 스테이션", "차지비", "환경차", "친환경차",
                "하이브리드", "플러그인", "배터리", "전력", "전원", "콘센트",
            ],
            "negative": [
                "전기차 충전 없다", "충전소 없다", "충전 불가"
            ]
        },
        "객실금연": {
            "positive": [
                "금연", "객실 금연", "흡연 금지", "금연 객실", "깨끗한 공기",
                "금연실", "비흡연",
                "담배 금지", "흡연 불가", "금연 구역", "금연 지역", "금연 호텔",
                "깨끗한", "상쾌한", "신선한", "맑은 공기", "공기 청정",
                "냄새 없는", "담배 냄새 없는", "연기 없는", "건강", "웰빙"
            ],
            "negative": [
                "금연 아니다", "흡연 가능", "금연 객실 없다"
            ]
        },
        "OTT": {
            "positive": [
                "OTT", "넷플릭스", "유튜브", "웨이브", "티빙", "스트리밍", "TV",
                "넷플", "유투브", "디즈니", "디즈니플러스", "아마존", "프라임",
                "애플TV", "왓챠", "쿠팡플레이", "시즌", "드라마", "영화",
                "예능", "다큐", "애니", "만화", "콘텐츠", "VOD", "동영상",
                "미디어", "엔터테인먼트", "시청", "감상", "관람", "재생",
                "스마트TV", "인터넷TV", "IPTV", "케이블", "위성", "디지털"
            ],
            "negative": [
                "OTT 없다", "넷플릭스 없다", "TV 없다", "스트리밍 불가"
            ]
        },
        "수영장": {
            "positive": [
                "수영장", "풀", "물놀이", "키즈 풀", "인피니티",
                "야외 수영장", "실내 수영장", "옥상 수영장", "루프탑 풀",
                "어린이 수영장", "성인 수영장", "온수 수영장", "냉수 풀",
                "수영", "헤엄", "물", "워터", "아쿠아", "리조트", "휴양",
                "레저", "액티비티", "운동", "피트니스", "건강", "다이어트",
                "수상", "워터파크", "물놀이장", "풀사이드", "선베드", "파라솔"
            ],
            "negative": [
                "수영장 없다", "물놀이 불가", "수영 불가"
            ]
        },
        "객실내 PC": {
            "positive": [
                "PC", "컴퓨터", "노트북", "인터넷", "와이파이", "콘센트",
                "모니터",
                "키보드", "마우스", "프린터", "스캐너", "업무", "비즈니스",
                "작업", "일", "회사", "출장",
                "원격근무", "재택근무", "화상회의", "온라인", "클라우드",
                "이메일", "문서", "엑셀", "파워포인트", "워드", "한글",
                "소프트웨어", "프로그램", "앱", "애플리케이션", "전원", "충전"
            ],
            "negative": [
                "PC 없다", "컴퓨터 없다", "인터넷 없다", "와이파이 없다"
            ]
        },
        "바베큐": {
            "positive": [
                "바베큐", "BBQ", "그릴", "야외 요리", "고기 굽기", "파티",
                "고기", "삼겹살", "갈비", "소고기", "돼지고기", "치킨", "닭",
                "야외", "테라스", "정원", "마당", "발코니", "루프탑", "캠핑",
                "숯", "석탄", "가스", "전기", "그릴팬", "불판", "철판",
                "요리", "구이", "로스팅", "훈제", "스모킹", "시즈닝",
                "가족", "친구", "모임", "파티", "행사", "이벤트", "축제"
            ],
            "negative": [
                "바베큐 없다", "그릴 없다", "야외 요리 불가"
            ]
        },
        "조식": {
            "positive": [
                "조식", "아침 식사", "모닝", "뷔페", "식사 제공",
                "아침", "브런치", "식당",
                "레스토랑", "다이닝", "음식", "메뉴",
                "한식", "양식", "일식", "중식", "아시안", "컨티넨탈",
                "빵", "시리얼", "과일", "요거트", "우유", "주스", "커피",
                "차", "계란", "베이컨", "소시지", "토스트", "샐러드",
                "무료 조식", "조식 포함", "조식 서비스", "조식 제공",
                "아침 뷔페", "조식 뷔페", "셀프 서비스", "올인클루시브"
            ],
            "negative": [
                "조식 없다", "아침 식사 불가", "식사 제공 안함"
            ]
        }
    },
    "헤어샵": {
        "인기많은": {
            "positive": [
                "인기", "유명", "예약 어렵다", "웨이팅", "잘하는", "실력",
                "핫한",
                "핫플", "핫샵", "인기샵", "유명샵", "맛집", "헤어 맛집",
                "예약 필수", "예약 대기", "예약 밀림", "붐비는", "바쁜",
                "솜씨", "기술", "테크닉", "전문", "숙련", "경험", "베테랑",
                "원장", "실장", "디자이너", "스타일리스트", "아티스트",
                "SNS", "인스타", "블로그", "후기", "리뷰", "추천", "소문",
                "입소문", "방송", "TV", "연예인", "셀럽", "아이돌",
                "트렌드", "유행", "최신", "감각", "센스", "스타일"
            ],
            "negative": [
                "예약 쉽다", "한산", "유명하지 않다"
            ]
        },
        "쿠폰멤버십": {
            "positive": [
                "쿠폰", "할인", "멤버십", "적립", "이벤트", "혜택",
                "포인트", "스탬프", "적립금", "캐시백", "리워드", "보상",
                "회원", "VIP", "우대", "특가", "세일", "프로모션",
                "이벤트", "특별", "한정", "기간 한정", "신규 고객",
                "재방문", "단골", "고객", "서비스", "무료", "공짜",
                "1+1", "반값", "50%", "30%", "20%", "10%", "할인율"
            ],
            "negative": [
                "쿠폰 없다", "할인 안됨", "혜택 없다"
            ]
        },
        "예약필수": {
            "positive": [
                "예약 필수", "사전 예약", "미리", "예약제",
                "예약만", "예약 전용", "완전 예약제", "100% 예약제",
                "사전 연락", "미리 연락", "전화 예약", "온라인 예약",
                "앱 예약", "카카오톡", "네이버", "인스타", "DM", "문자",
                "예약 시스템", "예약 앱", "예약 사이트", "예약 플랫폼",
                "시간 예약", "날짜 예약", "스케줄", "일정", "타임",
                "대기", "웨이팅", "순서", "차례", "번호표", "순번"
            ],
            "negative": [
                "예약 안해도 됨", "바로 방문", "워킹 가능"
            ]
        }
    },
    "병원": {
        "응급실": {
            "positive": [
                "응급실", "응급", "24 시간", "종합 병원", "ER", "구급차",
                "응급 의료", "응급 치료", "응급 환자", "응급 상황", "위급",
                "급한", "긴급", "즉시", "바로", "신속", "빠른", "당장",
                "24시", "이십사시간", "하루종일", "야간", "새벽", "밤",
                "늦은 시간", "심야", "올나잇", "언제나", "항상", "늘",
                "종합병원", "대학병원", "상급종합병원", "큰 병원", "대형병원",
                "의료진", "의사", "간호사", "응급의학과", "외상센터"
            ],
            "negative": [
                "응급실 없다", "응급 불가", "24 시간 아니다"
            ]
        },
        "전문의": {
            "positive": [
                "전문의", "전문가", "교수", "박사", "스페셜리스트",
                "전문 의사", "분과 전문의", "세부 전문의", "임상 교수",
                "주치의", "담당의", "원장", "과장", "부장", "실장",
                "경험", "실력", "숙련", "베테랑", "노하우", "기술", "솜씨"
            ],
            "negative": [
                "전문의 없다", "일반의", "전문 진료 불가"
            ]
        },
        "야간진료": {
            "positive": [
                "야간", "밤", "저녁", "24 시간", "심야", "당직",
                "야간 진료", "밤 진료", "저녁 진료", "늦은 시간", "늦게",
                "24시", "24시간", "이십사시간", "하루종일", "올나잇",
                "새벽", "새벽 진료", "심야 진료", "밤샘", "통밤", "올밤",
                "당직의", "당직 의사", "야간 의사", "응급", "응급실",
                "응급 진료", "긴급", "급한", "위급", "즉시", "바로",
                "언제나", "항상", "늘", "계속", "무제한", "제한 없이"
            ],
            "negative": [
                "야간 진료 없다", "일찍 닫다", "밤에 안됨"
            ]
        }
    }
}


# 규칙/사전 기반 설정 로딩 완료 로그
print("규칙 기반 파서 로딩 완료!")

class ChatRequest(BaseModel):
    message: str
    selected_location: Optional[str] = None
    pending: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    reply: str
    places: list | None = None
    action: Optional[str] = None
    candidates: Optional[List[str]] = None
    pending: Optional[Dict[str, Any]] = None


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


# ------------------ 외부 API 설정 (행안부 주소 API) ------------------
# 실제 배포 시 환경변수 MOIS_API_KEY로 주입. 미설정 시 아래 기본값 사용
# ------------------ 외부 API 설정 ------------------

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

# /chat 엔드포인트 이전에 추가
def clean_location_query(text: str, category: str, features: list) -> str:
    """사용자 메시지에서 카테고리와 특징 관련 키워드를 제거하여 지역명만 남깁니다."""
    cleaned_text = text
    
    # 카테고리 관련 표현 제거
    if category and category in CATEGORY_PHRASES:
        for phrase in CATEGORY_PHRASES[category]:
            cleaned_text = cleaned_text.replace(phrase, "")
            
    # 특징 관련 표현 제거
    if category and features:
        for feature in features:
            if feature in KEYWORD_DICT.get(category, {}):
                all_phrases = KEYWORD_DICT[category][feature].get("positive", []) + \
                              KEYWORD_DICT[category][feature].get("negative", [])
                for phrase in all_phrases:
                    # 너무 짧은 단어가 다른 단어의 일부를 지우는 것을 방지
                    if len(phrase) > 1:
                         cleaned_text = cleaned_text.replace(phrase, "")

    # 공백 정리 후 반환
    return " ".join(cleaned_text.split())

# chat_endpoint
@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    user_message = (req.message or "").strip()
    # 후속 요청(지역 선택) 처리
    if req.selected_location and req.pending:
        try:
            category = (req.pending or {}).get("category")
            features = (req.pending or {}).get("features") or []
            if not category:
                return ChatResponse(reply=HELP_MESSAGE, places=None)
            extracted = {"category": category, "features": features, "location": req.selected_location}
            matched_places = query_places(extracted)
            if matched_places:
                reply_text = build_reply(extracted, matched_places)
                return ChatResponse(reply=reply_text, places=matched_places[:5])
            else:
                return ChatResponse(reply="조건에 맞는 매장을 찾지 못했어요. 다른 키워드로 시도해 보시겠어요?", places=None)
        except Exception as e:
            print(f"후속 선택 처리 오류: {e}")
            return ChatResponse(reply="서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", places=None)

    if not user_message:
        return ChatResponse(reply="메시지가 비어 있어요.")

    try:
        # 0) 입력 유효성 1차 필터
        if is_low_quality_input(user_message):
            return ChatResponse(reply=HELP_MESSAGE, places=None)

        # 1) NLP: 카테고리/특성 먼저 추출
        category = classify_category_with_rules(user_message)
        features = extract_features_with_rules(user_message, category)
        
        # 2) [수정된 로직] 지역명 검색을 위한 쿼리 정제
        location_query = clean_location_query(user_message, category, features)
        
        extracted = {"category": category, "features": features, "location": None}

        # 3) [수정된 로직] 정제된 쿼리로만 지역 후보 검색
        cand_from_text = []
        if location_query: # 정제된 쿼리가 있을 때만 지역 검색을 수행합니다.
            try:
                # API 호출 최소화를 위해 resolve_single_location 대신 get_location_candidates를 사용
                cand_from_text = location_service.get_location_candidates(location_query, timeout_sec=1.0)
            except Exception as e:
                print(f"Location candidate search error: {e}")
                cand_from_text = []

        if cand_from_text:
            if len(cand_from_text) == 1:
                extracted["location"] = cand_from_text[0]
            # 여러 지역이 검색되었고, 카테고리가 명확할 때만 사용자에게 선택 요청
            elif len(cand_from_text) > 1 and category:
                return ChatResponse(
                    reply="여러 지역이 검색되었어요. 원하시는 지역을 선택해 주세요.",
                    places=None,
                    action="choose_location",
                    candidates=cand_from_text,
                    pending={"category": category, "features": features}
                )

        location = extracted.get("location")

        # 4) [수정된 로직] 필수 정보(지역, 카테고리) 검증
        if not category:
            # 카테고리가 없는 경우 (지역 정보 유무와 상관없이)
            location_display = f"'{location}'에서" if location else ""
            return ChatResponse(reply=f"{location_display} 어떤 장소를 찾으세요? 👀\n(예: 음식점, 카페, 약국 등)".strip(), places=None)
        
        if not location:
            # 카테고리는 있지만 지역 정보가 없는 경우
            return ChatResponse(reply=f"어느 지역에서 {category}을(를) 찾으시나요? 🤔\n예: \"강남 {category}\"", places=None)

        # 5) 모든 정보가 확정되었으므로 DB 조회 및 응답 생성
        matched_places = query_places(extracted)
        
        if matched_places:
            reply_text = build_reply(extracted, matched_places)
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
#동석 api  


# 동석 API 추가 (기존 DB 연결 방식 사용)
@app.get("/db/export")
def export_places():
    """전체 매장 데이터를 JSON으로 export"""
    try:
        engine = get_db_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM place")).fetchall()
            return [dict(row._mapping) for row in result]
    except Exception as e:
        return {"error": str(e)}

@app.get("/db/schema")
def get_db_schema():
    """DB 테이블 구조를 반환하는 API"""
    try:
        engine = get_db_engine()
        with engine.connect() as conn:
            # 테이블 구조 조회
            schema_query = text("DESCRIBE place")
            schema_result = conn.execute(schema_query).fetchall()
            
            # 샘플 데이터 조회 (5개만)
            sample_query = text("SELECT * FROM place LIMIT 5")
            sample_result = conn.execute(sample_query).fetchall()
            
            return {
                "schema": [dict(row._mapping) for row in schema_result],
                "sample_data": [dict(row._mapping) for row in sample_result]
            }
    except Exception as e:
        return {"error": str(e)}

@app.post("/send-to-map")
def send_places_to_map(places: List[dict]):
    """챗봇 결과를 지도 API로 전송"""
    try:
        import requests
        response = requests.post(
            "http://34.64.120.99:5000/api/chat-places",
            json={"places": places},
            timeout=5
        )
        return {"status": "success", "map_response": response.json()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test/places")
def test_places():
    """테스트용 - 판교 지역 데이터 확인"""
    try:
        engine = get_db_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM place WHERE location LIKE '%판교%' LIMIT 10")).fetchall()
            return [dict(row._mapping) for row in result]
    except Exception as e:
        return {"error": str(e)}
# ------------------ 설정/DB ------------------
load_dotenv()

def get_engine() -> Engine:
    host = os.getenv("DB_HOST", "mapro.cloud")
    port = os.getenv("DB_PORT", "3306")
    user = os.getenv("DB_USER", "dev")
    password = os.getenv("DB_PASSWORD", "Dev1010**")
    name = os.getenv("DB_NAME", "mapro")
    
    # mariadb+mariadbconnector에서 mysql+pymysql로 변경
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"
    return create_engine(url, pool_pre_ping=True)

ENGINE: Optional[Engine] = None

def get_db_engine() -> Engine:
    global ENGINE
    if ENGINE is None:
        ENGINE = get_engine()
    return ENGINE

# ------------------ 텍스트 파싱 ------------------
def normalize(text: str) -> str:
    return text.strip()


def classify_category_with_rules(text: str) -> str:
    """규칙 기반 분류: 카테고리 매핑(CATEGORY_PHRASES)에서 1개만 매칭될 때 인정.
    - 공백/대소문자 무시 간단 정규화 지원
    - 다중 매칭 시 모호 판정(None)
    """
    if not text:
        return None

    def norm(s: str) -> str:
        return re.sub(r"\s+", "", (s or "").lower())

    t = norm(text)

    matched_labels = []
    for label, phrases_raw in CATEGORY_PHRASES.items():
        phrases = [norm(p) for p in phrases_raw if p]
        for p in phrases:
            if p and p in t:
                matched_labels.append(label)
                break

    matched_labels = list(dict.fromkeys(matched_labels))
    if len(matched_labels) == 1:
        return matched_labels[0]
    return None


def extract_features_with_rules(text: str, category: str) -> list:
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

## NER 기반 위치 추출은 더 이상 사용하지 않음

def extract_location(text: str) -> Optional[str]:
    """LocationService를 사용하여 지역을 인식한다."""
    return location_service.resolve_single_location(text)

def extract_query(text: str) -> dict:
    """규칙/사전 기반으로 쿼리 성분을 추출한다."""
    t = normalize(text)
    category = classify_category_with_rules(t)
    features = extract_features_with_rules(t, category) if category else []
    location = location_service.resolve_single_location(t)
    extracted = {"category": category, "features": features, "location": location}
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

        # 1) 중복 제거: 매장 이름 기준(정규화)으로만 단일화
        def normalize_name(name: str) -> str:
            if not name:
                return ""
            base = re.sub(r"\s+", "", name)
            base = re.sub(r"[^0-9A-Za-z가-힣]", "", base)
            return base.lower()

        name_deduped_rows = []
        seen_names = set()
        for row in rows:
            norm = normalize_name(row.get("name"))
            if not norm or norm in seen_names:
                continue
            seen_names.add(norm)
            name_deduped_rows.append(row)

        if not name_deduped_rows:
            return []

        # 2) 특성(feature) 점수 기반으로 Python에서 재정렬
        def score(place):
            place_features = (place.get("feature") or "").split(",")
            place_features = [f.strip() for f in place_features if f.strip()]
            
            # 검색어에 포함된 feature가 매장의 feature에 얼마나 있는지 계산
            match_count = sum(1 for f in features if f in place_features)
            return match_count

        name_deduped_rows.sort(key=score, reverse=True)
        # 최대 5개까지 반환(중복 제거로 5개 미만이 될 수 있음)
        return name_deduped_rows[:5]
        
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
    
    if len(places) > 0:
        return f"{cond} 조건으로 {len(places)}곳을 찾았어요"
    else:
        return f"{cond} 조건에 맞는 매장을 찾지 못했어요. 다른 키워드로 시도해 보시겠어요?"
