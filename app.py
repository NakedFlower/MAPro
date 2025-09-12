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


# ------------------ 분류/키워드 사전 ------------------
# 카테고리 매핑
CATEGORY_PHRASES = {
    "음식점": ["음식점", "식당", "레스토랑", "먹을데", "먹을 곳", "밥집", "맛집"],
    "카페": ["카페", "커피숍", "커피 숍", "다방", "카페테리아", "카페라운지"],
    "편의점": ["편의점", "편의 마트", "편의 소매", "편의 상점"],
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
                "new", "open", "renewal", "fresh", "brand new", "newly", "recent",
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
                "couple", "romantic", "mood", "atmosphere", "candle", "dating",
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
                "no kids", "adult only", "성인만", "어른만", "미성년자 금지",
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
                "지역 화폐", "지역 상품권", "상품권", "지역 페이", "시민 페이", "지역페이",
                "경기 페이", "서울 페이", "제로 페이", "간편 결제", "모바일 결제",
                "경기페이", "서울페이", "제로페이", "지역화폐", "상품권",
                "부천페이", "수원페이", "용인페이", "성남페이", "고양페이", "안산페이",
                "평택페이", "안양페이", "의정부페이", "남양주페이", "시흥페이",
                "광명페이", "군포페이", "하남페이", "오산페이", "이천페이",
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
                "주차", "파킹", "무료 주차", "발렛", "주차장", "parking", "park",
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
                "hot", "famous", "popular", "trendy", "viral", "buzz", "trending",
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
                "comfortable", "sofa", "cushion", "relax", "cozy", "spacious",
                "의자", "체어", "chair", "암체어", "라운지체어", "리클라이너",
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
                "카공", "공부", "스터디", "작업", "업무", "노트북", "laptop", "study",
                "와이파이", "wifi", "콘센트", "전원", "충전", "조용", "wifi", "internet",
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
                "노키즈", "성인 전용", "어른 전용", "출입 금지", "no kids",
                "adult only", "성인만", "어른만", "미성년자 금지", "19세 이상",
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
                "분위기", "무드", "감성", "갬성", "뷰", "조명", "인테리어", "view",
                "창가", "테라스", "음악", "bgm", "힐링", "atmosphere", "mood", "vibe",
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
                "인테리어", "디자인", "꾸밈", "감각적", "세련된", "모던", "modern",
                "빈티지", "유니크", "독특", "컨셉", "벽화", "아트", "design",
                "vintage", "unique", "concept", "art", "interior", "decoration",
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
                "디저트", "케이크", "마카롱", "쿠키", "타르트", "와플", "dessert",
                "달콤", "수제", "홈메이드", "cake", "macaron", "cookie", "tart", "waffle",
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
                "조용", "차분", "정숙", "평화", "고요", "힐링", "한적", "quiet",
                "peaceful", "calm", "relaxing", "healing", "tranquil", "serene",
                "소음 없는", "시끄럽지 않은", "조용조용", "조용한 분위기",
                "차분한 분위기", "평화로운", "고요한", "적막", "정적",
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
                "24hours", "all night", "midnight", "late night", "dawn",
                "24시", "이십사시간", "하루종일", "야간", "밤", "늦은 시간",
                "새벽 시간", "심야 시간", "밤샘", "올밤", "통밤", "밤새",
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
                "야외", "테라스", "밖에", "외부", "옥외", "outdoor", "outside",
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
                "ATM", "현금 인출기", "CD 기", "은행 기기", "출금", "cash",
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
                "취식", "먹을곳", "테이블", "의자", "이트인", "좌석", "eat in",
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
                "친절", "상냥", "다정", "설명", "자세히", "꼼꼼", "kind", "nice",
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
                "파스", "비타민", "처방전 없이", "상비약", "over the counter",
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
                "spa", "sauna", "jacuzzi", "whirlpool", "hot spring", "healing",
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
                "pet", "dog", "cat", "puppy", "kitten", "pet friendly",
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
                "parking", "park", "valet", "무료파킹", "주차 가능", "주차시설",
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
                "electric car", "electric vehicle", "charging station", "charger",
                "전기차 충전", "EV 충전", "급속충전", "완속충전", "충전시설",
                "충전 서비스", "충전 스테이션", "차지비", "환경차", "친환경차",
                "하이브리드", "플러그인", "배터리", "전력", "전원", "콘센트",
                "테슬라", "아이오닉", "EQS", "볼트", "니로", "코나", "GV60",
                "BMW", "벤츠", "아우디", "포르쉐", "현대", "기아", "제네시스"
            ],
            "negative": [
                "전기차 충전 없다", "충전소 없다", "충전 불가"
            ]
        },
        "객실금연": {
            "positive": [
                "금연", "객실 금연", "흡연 금지", "금연 객실", "깨끗한 공기",
                "no smoking", "non smoking", "smoke free", "금연실", "비흡연",
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
                "netflix", "youtube", "wavve", "tving", "streaming", "television",
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
                "수영장", "풀", "pool", "물놀이", "키즈 풀", "인피니티",
                "swimming pool", "infinity pool", "outdoor pool", "indoor pool",
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
                "PC", "컴퓨터", "노트북", "인터넷", "와이파이", "wifi", "콘센트",
                "computer", "laptop", "internet", "wireless", "desktop", "모니터",
                "키보드", "마우스", "프린터", "스캐너", "업무", "비즈니스",
                "work", "business", "office", "작업", "일", "회사", "출장",
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
                "barbecue", "grill", "outdoor cooking", "grilling", "party",
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
                "조식", "아침 식사", "breakfast", "모닝", "뷔페", "식사 제공",
                "아침", "morning", "buffet", "브런치", "brunch", "식당",
                "레스토랑", "다이닝", "meal", "food", "음식", "메뉴",
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
                "popular", "famous", "skilled", "talented", "hot", "핫한",
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
                "coupon", "discount", "membership", "point", "event", "benefit",
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
                "예약 필수", "사전 예약", "미리", "예약제", "reservation required",
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
                "emergency", "24hours", "general hospital", "ambulance",
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
                "specialist", "expert", "professor", "doctor", "PhD",
                "전문 의사", "분과 전문의", "세부 전문의", "임상 교수",
                "주치의", "담당의", "원장", "과장", "부장", "실장",
                "내과", "외과", "소아과", "산부인과", "정형외과", "신경과",
                "정신과", "피부과", "안과", "이비인후과", "비뇨기과",
                "흉부외과", "신경외과", "성형외과", "마취과", "영상의학과",
                "병리과", "진단검사의학과", "재활의학과", "가정의학과",
                "경험", "실력", "숙련", "베테랑", "노하우", "기술", "솜씨"
            ],
            "negative": [
                "전문의 없다", "일반의", "전문 진료 불가"
            ]
        },
        "야간진료": {
            "positive": [
                "야간", "밤", "저녁", "24 시간", "심야", "당직", "night",
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
MOIS_API_KEY = os.getenv("MOIS_API_KEY", "devU01TX0FVVEgyMDI1MDkxMjExMzczMjExNjE3ODE=")
MOIS_ADDR_API_URL = "https://business.juso.go.kr/addrlink/addrLinkApi.do"

def _parse_region_from_address(addr: str) -> Optional[str]:
    """주소 문자열에서 시/군/구 등의 지역명만 간략히 추출.
    예) "서울특별시 강남구 역삼동 ..." -> "서울 강남구"
    """
    if not addr:
        return None
    tokens = (addr or "").strip().split()
    if not tokens:
        return None
    def is_region_token(tok: str) -> bool:
        return tok.endswith(("시", "군", "구"))

    region_tokens = [t for t in tokens[:5] if is_region_token(t)]
    if not region_tokens:
        # 동/읍/면이라도 잡아본다
        sub_tokens = [t for t in tokens[:5] if t.endswith(("동", "읍", "면"))]
        if sub_tokens:
            return sub_tokens[0]
        return None

    # 광역시/특별시 표기를 간략화
    def simplify(tok: str) -> str:
        return tok.replace("특별시", "").replace("광역시", "").replace("자치구", "").strip()

    simplified = [simplify(t) for t in region_tokens[:2]]
    # 최소 1개, 최대 2개 조합 (예: 서울 강남구 / 성남시 분당구)
    return " ".join([t for t in simplified if t]) or None

def resolve_location_with_mois(keyword_text: str, timeout_sec: float = 0.7) -> Optional[str]:
    """행안부(도로명주소) API를 호출해 입력 텍스트에서 지역명을 표준화하여 추출.
    - 성공 시 간략 지역명(예: "서울 강남구") 반환
    - 실패/없음 시 None
    """
    if not MOIS_API_KEY:
        raise ValueError("MOIS_API_KEY가 설정되지 않았습니다.")
    
    if not keyword_text:
        return None
    params = {
        "confmKey": MOIS_API_KEY,
        "resultType": "json",
        "currentPage": "1",
        "countPerPage": "5",
        "keyword": keyword_text,
    }
    resp = requests.get(MOIS_ADDR_API_URL, params=params, timeout=timeout_sec)
    if resp.status_code != 200:
        raise ValueError(f"행안부 API 호출 실패: {resp.status_code}")
    data = resp.json() if resp.content else None
    juso_list = ((data or {}).get("results") or {}).get("juso") or []
    if not juso_list:
        return None
    # 우선 roadAddr, 없으면 jibunAddr 사용
    top = juso_list[0]
    addr = top.get("roadAddr") or top.get("jibunAddr") or ""
    region = _parse_region_from_address(addr)
    return region

def resolve_location_candidates(keyword_text: str, timeout_sec: float = 0.7) -> List[str]:
    """행안부 주소 API에서 복수의 지역 후보를 수집하여 반환한다.
    - 예: "시흥" → ["경기 시흥시", "서울 금천구 시흥동"] 등의 형태
    - 중복 제거 및 최대 5개까지만 반환
    """
    if not MOIS_API_KEY:
        raise ValueError("MOIS_API_KEY가 설정되지 않았습니다.")
    if not keyword_text:
        return []
    params = {
        "confmKey": MOIS_API_KEY,
        "resultType": "json",
        "currentPage": "1",
        "countPerPage": "20",
        "keyword": keyword_text,
    }
    resp = requests.get(MOIS_ADDR_API_URL, params=params, timeout=timeout_sec)
    if resp.status_code != 200:
        return []
    data = resp.json() if resp.content else None
    juso_list = ((data or {}).get("results") or {}).get("juso") or []
    if not juso_list:
        return []

    candidates: List[str] = []
    seen = set()

    for j in juso_list:
        addr = j.get("roadAddr") or j.get("jibunAddr") or ""
        # 가능한 한 상세 행정구역까지 포함되도록 구성 (도/시 + 구/군 + 동)
        # 기존 파서로 상위 레벨을 우선 추출
        region_hi = _parse_region_from_address(addr)  # 예: "서울 금천구" 혹은 "경기 시흥시"
        # 세부 동 단위도 보조로 붙인다
        tokens = (addr or "").split()
        dong = next((t for t in tokens if t.endswith(("동", "읍", "면"))), None)
        label = f"{region_hi} {dong}".strip() if dong and region_hi and dong not in region_hi else (region_hi or dong or addr)
        key = label.strip()
        if key and key not in seen:
            seen.add(key)
            candidates.append(key)

    # 너무 많으면 상위 5개만
    return candidates[:5]

def _generate_location_keyword_candidates(text: str) -> list:
    """입력에서 행정구역 접미사(구/시/군) 보완 후보들을 생성한다.
    - 원문 그대로 1순위
    - 공백 기준 토큰 중 접미사가 없는 것에는 구/시/군을 덧붙인 버전도 생성
    - 중복 제거, 원본 순서 최대한 유지
    """
    if not text:
        return []
    candidates: list = []
    seen = set()

    def push(s: str):
        key = s.strip()
        if key and key not in seen:
            seen.add(key)
            candidates.append(key)

    push(text)
    tokens = (text or "").split()
    admin_suffixes = ("시", "군", "구", "동", "읍", "면")
    trial_suffixes = ("구", "시", "군")

    for tok in tokens:
        if not tok:
            continue
        if tok.endswith(admin_suffixes):
            # 이미 접미사가 있으면 그대로도 한 번 더 강조해서 후보에 추가
            push(tok)
            continue
        for suf in trial_suffixes:
            push(f"{tok}{suf}")
            # 문장 내 해당 토큰을 1회 치환한 전체 문장 후보도 추가
            push(text.replace(tok, f"{tok}{suf}", 1))

    return candidates

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
                # 지역이 없는 경우: 먼저 후보를 시도적으로 제안
                cand = resolve_location_candidates(user_message)
                if cand and len(cand) > 1:
                    return ChatResponse(
                        reply="여러 지역이 검색되었어요. 원하시는 지역을 선택해 주세요.",
                        places=None,
                        action="choose_location",
                        candidates=cand,
                        pending={"category": category, "features": extracted.get("features") or []}
                    )
                # 후보가 없거나 1개뿐이면 기존 안내
                return ChatResponse(reply=f"어느 지역에서 {category}을(를) 찾으시나요? 🤔\n예: \"강남 {category}\"", places=None)
            else: # not category
                # 카테고리가 없는 경우
                return ChatResponse(reply=f"'{location}'에서 어떤 장소를 찾으세요? 👀\n(예: 음식점, 카페, 약국 등)", places=None)
        # 2.5) 단순화: 추출된 location 기준으로만 후보 확인 → 0:그대로, 1:확정, 2+:선택요청
        cand_all: List[str] = []
        if location:
            try:
                cand_all = resolve_location_candidates(location)
            except Exception:
                cand_all = []
            if cand_all:
                if len(cand_all) == 1:
                    extracted["location"] = cand_all[0]
                    location = cand_all[0]
                elif len(cand_all) > 1:
                    return ChatResponse(
                        reply="여러 지역이 검색되었어요. 원하시는 지역을 선택해 주세요.",
                        places=None,
                        action="choose_location",
                        candidates=cand_all,
                        pending={"category": category, "features": extracted.get("features") or []}
                    )

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
    """행안부 주소 API만 사용하여 지역을 인식한다. (NER 폴백 없음)
    - 원문과 접미사 보완 후보들을 순차 조회하여 최초 성공값을 반환
    """
    for kw in _generate_location_keyword_candidates(text):
        region = resolve_location_with_mois(kw, timeout_sec=0.5)
        if region:
            return region
    return None

def extract_query(text: str) -> dict:
    """규칙/사전 기반으로 쿼리 성분을 추출한다."""
    t = normalize(text)
    
    category = classify_category_with_rules(t)
    
    features = extract_features_with_rules(t, category) if category else []
    
    location = extract_location(t)
    
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

        # 1) 동일 매장(place_id) 중복 제거
        unique_rows = []
        seen_place_ids = set()
        for row in rows:
            place_id = row.get("place_id")
            if place_id in seen_place_ids:
                continue
            seen_place_ids.add(place_id)
            unique_rows.append(row)

        if not unique_rows:
            return []

        # 2) 특성(feature) 점수 기반으로 Python에서 재정렬
        def score(place):
            place_features = (place.get("feature") or "").split(",")
            place_features = [f.strip() for f in place_features if f.strip()]
            
            # 검색어에 포함된 feature가 매장의 feature에 얼마나 있는지 계산
            match_count = sum(1 for f in features if f in place_features)
            return match_count

        unique_rows.sort(key=score, reverse=True)
        # 최대 5개까지 반환(중복 제거로 5개 미만이 될 수 있음)
        return unique_rows[:5]
        
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
