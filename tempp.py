import requests
import json
import pandas as pd
import time
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
# 형태소 분석기 임포트
from konlpy.tag import Okt
# MariaDB 연결을 위한 라이브러리
import pymysql
from sqlalchemy import create_engine, text

# 어간 추출 함수
okt = Okt()
def stem_text(text: str) -> str:
    # 형태소 분석 후 어간만 추출하여 공백으로 연결
    return ' '.join([stem for stem, pos in okt.pos(text, stem=True)])

# 1. 키워드-표현 사전 정의 (Okt 어간 추출 결과 반영)
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

SEARCH_QUERY_TO_CATEGORY = {
    "food": "음식점",
    "cafe": "카페",
    "convenience store": "편의점",
    "pharmacy": "약국",
    "hotel": "호텔",
    "beauty salon": "헤어샵",
    "hospital": "병원"
}


# MariaDB 연결 설정
MARIA_DB_CONFIG = {
    'host': '${{ secrets.GCP_VM_IP }}',  
    'port': 3306,         
    'user': '${{ secrets.GCP_SPRING_DATASOURCE_USERNAME }}',        
    'password': '${{ secrets.GCP_SPRING_DATASOURCE_PASSWORD }}',  
    'database': '${{ secrets.GCP_SPRING_DATASOURCE_DBNAME }}',      
    'charset': 'utf8mb4'
}

# MariaDB 연결 함수
def connect_to_mariadb():
    """MariaDB에 연결하는 함수"""
    try:
        connection = pymysql.connect(**MARIA_DB_CONFIG)
        print("MariaDB 연결 성공!")
        return connection
    except Exception as e:
        print(f"MariaDB 연결 실패: {e}")
        return None

# 데이터를 MariaDB에 저장하는 함수
def save_to_mariadb(reviews_df, keyword_df):
    """수집된 리뷰와 키워드 데이터를 MariaDB place 테이블에 저장하는 함수"""
    try:
        # MariaDB 연결
        connection = connect_to_mariadb()
        if connection is None:
            print("MariaDB 연결 실패로 데이터 저장을 건너뜁니다.")
            return False
        
        cursor = connection.cursor()
        
        # 매장별 키워드 요약 데이터를 place 테이블에 저장
        if not keyword_df.empty:
            for _, row in keyword_df.iterrows():
                # 현재 시간
                current_time = datetime.now()
                
                # place 테이블에 데이터 삽입
                insert_place_sql = """
                INSERT INTO place 
                (created_at, updated_at, category, name, location, feature)
                VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_place_sql, (
                    current_time,  # created_at
                    current_time,  # updated_at
                    row['category'],  # category
                    row['place_name'],  # name
                    row['place_address'],  # location
                    row['keywords']  # feature
                ))
        
        # 변경사항 커밋
        connection.commit()
        print(f"MariaDB place 테이블에 데이터 저장 완료!")
        print(f"  - 저장된 장소: {len(keyword_df)}개")
        
        cursor.close()
        connection.close()
        return True
        
    except Exception as e:
        print(f"MariaDB 데이터 저장 중 오류 발생: {e}")
        if 'connection' in locals() and connection:
            connection.rollback()
            connection.close()
        return False

def extract_keywords_from_review_by_category(review_text: str, category: str, keyword_dict: dict) -> dict:
    # 리뷰 텍스트를 어간 추출하여 전처리
    stemmed_review = stem_text(review_text)
    result = {}
    if category not in keyword_dict:
        return result
    keywords = keyword_dict[category]
    for keyword, exprs in keywords.items():
        found = None
        for neg in exprs.get("negative", []):
            if neg in stemmed_review:
                result[f"{category}_{keyword}"] = "negative"
                found = "negative"
                break
        if found:
            continue
        for pos in exprs.get("positive", []):
            if pos in stemmed_review:
                result[f"{category}_{keyword}"] = "positive"
                break
    return result

def add_keywords_to_reviews_by_category(df: pd.DataFrame, keyword_dict: dict, category: str) -> pd.DataFrame:
    keyword_cols = [f"{category}_{keyword}" for keyword in keyword_dict[category].keys()]
    def get_row_keywords(text):
        matches = extract_keywords_from_review_by_category(str(text), category, keyword_dict)
        return matches
    keyword_results = df['review_text'].apply(get_row_keywords)
    for col in keyword_cols:
        df[col] = keyword_results.apply(lambda x: x.get(col, ""))
    def get_matched_keywords(row):
        return [col for col in keyword_cols if row[col] == "positive"]
    df['matched_keywords'] = df.apply(get_matched_keywords, axis=1)
    return df

# 매장별로 positive 키워드만 집계
def aggregate_keywords(group):
    # 모든 리뷰의 matched_keywords를 합쳐서 set으로 만듦
    keywords = set()
    for kw_list in group['matched_keywords']:
        if isinstance(kw_list, list):
            keywords.update(kw_list)
    # 카테고리_키워드 형태이므로 뒤에 키워드만 추출
    keywords = [k.split('_', 1)[1] for k in keywords]
    return ','.join(sorted(set(keywords)))

# KEYWORD_DICT의 모든 키워드 리스트를 어간으로 변환
def stem_keyword_dict(keyword_dict: dict) -> dict:
    stemmed_dict = {}
    for category, keywords in keyword_dict.items():
        stemmed_dict[category] = {}
        for keyword, exprs in keywords.items():
            stemmed_dict[category][keyword] = {
                'positive': [stem_text(word) for word in exprs.get('positive', [])],
                'negative': [stem_text(word) for word in exprs.get('negative', [])]
            }
    return stemmed_dict

KEYWORD_STEM_DICT = stem_keyword_dict(KEYWORD_DICT)

class GoogleMapsReviewCollector:
    def __init__(self, api_key: str):
        """
        Google Maps API를 사용한 리뷰 수집기
        
        Args:
            api_key (str): Google Maps API 키
        """
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api/place"
    
    def search_places(self, query: str, location: str = None, radius: int = 1000) -> List[Dict]:
        """
        장소를 검색하여 place_id 목록을 반환
        
        Args:
            query (str): 검색할 키워드 (예: "카페", "레스토랑")
            location (str): 위치 좌표 "lat,lng" 형태 (선택사항)
            radius (int): 검색 반경 (미터)
            
        Returns:
            List[Dict]: place_id와 기본 정보가 포함된 장소 목록
        """
        url = f"{self.base_url}/textsearch/json"

        params = {
            'query': query,
            'key': self.api_key,
            'language': 'ko'
        }

        if location:
            params['location'] = location
            params['radius'] = radius

        places = []

        try:
            response = requests.get(url, params=params)

            if response.status_code != 200:
                print(f"HTTP 오류: {response.status_code}")
                print(f"응답 내용: {response.text}")
                return places
            
            response.raise_for_status()
            data = response.json()

            print(f"API 응답 상태: {data.get('status', 'UNKNOWN')}")

            if data['status'] == 'OK':
                for place in data['results']:
                    places.append({
                        'place_id': place['place_id'],
                        'name': place['name'],
                        'address': place.get('formatted_address', '')
                    })
            elif data['status'] == 'REQUEST_DENIED':
                print("API 요청이 거부되었습니다. 다음을 확인하세요:")
                print("1. API 키가 올바른지 확인")
                print("2. Google Cloud Console에서 Places API가 활성화되었는지 확인")
                print("3. API 키에 Places API 사용 권한이 있는지 확인")
                print("4. 결제 정보가 등록되어 있는지 확인")
                if 'error_message' in data:
                    print(f"오류 메시지: {data['error_message']}")
            else:
                print(f"검색 오류: {data['status']}")
                if 'error_message' in data:
                    print(f"오류 메시지: {data['error_message']}")

        except requests.exceptions.RequestException as e:
            print(f"API 요청 오류: {e}")

        return places
    
    def get_place_reviews(self, place_id: str, years_filter: int = None) -> List[Dict]:
        """
        특정 장소의 리뷰를 가져옴
        
        Args:
            place_id (str): Google Places의 place_id
            years_filter (int): 필터링할 년수 (None이면 모든 리뷰)
            
        Returns:
            List[Dict]: 리뷰 데이터 목록
        """
        url = f"{self.base_url}/details/json"

        params = {
            'place_id': place_id,
            'fields': 'reviews,name,formatted_address',
            'key': self.api_key,
            'language': 'ko'
        }

        reviews = []

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if data['status'] == 'OK':
                place_info = data['result']
                place_name = place_info.get('name', '')
                place_address = place_info.get('formatted_address', '')

                if 'reviews' in place_info:
                    for review in place_info['reviews']:
                        if years_filter and not self._is_within_years(review.get('time', 0), years_filter):
                            continue
                        review_data = {
                            'place_id': place_id,
                            'place_name': place_name,
                            'place_address': place_address,
                            'review_text': review.get('text', ''),
                            'author_url': review.get('author_url', ''),
                            'language': review.get('language', '')
                        }
                        reviews.append(review_data)
            else:
                print(f"장소 상세 정보 오류: {data['status']} - {place_id}")
        except requests.exceptions.RequestException as e:
            print(f"API 요청 오류: {e}")

        return reviews

    def _is_within_years(self, timestamp: int, years: int = 5) -> bool:
        """
        리뷰가 지정된 년수 이내에 작성되었는지 확인
        
        Args:
            timestamp (int): Unix 타임스탬프
            years (int): 기준 년수
            
        Returns:
            bool: 기준 년수 이내 작성 여부
        """
        try:
            review_date = datetime.fromtimestamp(timestamp)
            cutoff_date = datetime.now() - timedelta(days=years * 365)
            return review_date >= cutoff_date
        except:
            return False
    
    def collect_reviews_from_search(self, query: str, location: str = None, 
                                  max_places: int = 10, delay: float = 1.0, years_filter: int = None) -> pd.DataFrame:
        """
        검색어로 장소를 찾고 모든 리뷰를 수집
        
        Args:
            query (str): 검색할 키워드
            location (str): 위치 좌표 "lat,lng" 형태 (선택사항)
            max_places (int): 수집할 최대 장소 수
            delay (float): API 호출 간 딜레이 (초)
            years_filter (int): 필터링할 년수 (None이면 모든 리뷰)
            
        Returns:
            pd.DataFrame: 수집된 리뷰 데이터프레임
        """
        print(f"'{query}' 검색 중...")
        places = self.search_places(query, location)

        if not places:
            print("검색된 장소가 없습니다.")
            return pd.DataFrame()
        
        print(f"{len(places)}개 장소 발견. 최대 {max_places}개 처리 예정...")

        all_reviews = []

        for i, place in enumerate(places[:max_places]):
            print(f"[{i+1}/{min(len(places), max_places)}] {place['name']} 리뷰 수집 중...")
            
            reviews = self.get_place_reviews(place['place_id'], years_filter)
            all_reviews.extend(reviews)
            
            years_text = f" ({years_filter}년 이내)" if years_filter else ""
            print(f"  -> {len(reviews)}개 리뷰{years_text} 수집됨")

            # API 호출 제한 방지를 위한 딜레이            
            if i < min(len(places), max_places) - 1:
                time.sleep(delay)

        if all_reviews:
            df = pd.DataFrame(all_reviews)
            # 필요한 컬럼만 선택하고 정렬
            columns = ['place_name', 'place_address', 'review_text']
            df = df[columns]

            years_text = f" ({years_filter}년 이내)" if years_filter else ""
            print(f"\n총 {len(df)}개 리뷰{years_text} 수집 완료!")
            return df
        else:
            print("수집된 리뷰가 없습니다.")
            return pd.DataFrame()
    
    def collect_reviews_from_place_id(self, place_id: str, years_filter: int = None) -> pd.DataFrame:
        """
        특정 place_id의 리뷰만 수집
        
        Args:
            place_id (str): Google Places의 place_id
            years_filter (int): 필터링할 년수 (None이면 모든 리뷰)
            
        Returns:
            pd.DataFrame: 수집된 리뷰 데이터프레임
        """        
        print(f"Place ID {place_id} 리뷰 수집 중...")

        reviews = self.get_place_reviews(place_id, years_filter)

        if reviews:
            df = pd.DataFrame(reviews)
            columns = ['place_name', 'place_address', 'review_text']
            df = df[columns]

            years_text = f" ({years_filter}년 이내)" if years_filter else ""
            print(f"{len(df)}개 리뷰{years_text} 수집 완료!")
            return df
        else:
            print("수집된 리뷰가 없습니다.")
            return pd.DataFrame()

if __name__ == "__main__":
    # API 키 설정
    API_KEY = "${{ secrets.GOOGLE_MAPS_API_KEY }}"
    
    # 리뷰 수집기 초기화    
    collector = GoogleMapsReviewCollector(API_KEY)
    
    # 판교디지털센터의 위도와 경도    
    goorm_location = "37.4023,127.1012" 
    
    print("=== 구름스퀘어 판교 주변 음식점 리뷰 수집 ===")
    
    # 위치 기반으로 다양한 음식점 타입 검색
    search_queries = [
        "food",             # 음식점
        "cafe",              # 카페
        "convenience store", # 편의점
        "pharmacy",          # 약국
        "hotel",           # 호텔
        "beauty salon",      # 미용실
        "hospital"          # 병원
    ]

    all_reviews_df = pd.DataFrame()
    processed_places = set()    # 중복 방지
    
    for i, query in enumerate(search_queries):
        print(f"\n[{i+1}/{len(search_queries)}] '{query}' 검색 중...")
        
        df_reviews = collector.collect_reviews_from_search(
            query=query,
            location=goorm_location,  # 구름스퀘어 좌표
            max_places=20,  # 각 검색어당 최대 20개 장소
            delay=1.0,
            years_filter=5  # 5년 이내 리뷰만 수집
        )
        
        if not df_reviews.empty:
            # 판교, 분당구, 성남이 포함된 주소만 필터링
            df_filtered = df_reviews[
                df_reviews['place_address'].str.contains('판교|분당|성남', na=False, case=False)
            ].copy()

            if not df_filtered.empty:
                # 중복 제거 (place_name과 place_address 조합)                
                df_filtered['unique_key'] = (df_filtered['place_name'] + '_' + 
                                           df_filtered['place_address']).str.strip()
                
                # 이미 처리된 장소들 제외                
                new_mask = ~df_filtered['unique_key'].isin(processed_places)
                df_new = df_filtered[new_mask].copy()

                if not df_new.empty:
                    # 처리된 장소들에 추가
                    processed_places.update(df_new['unique_key'].tolist())
                    
                    # unique_key 컬럼 제거 후 데이터 추가
                    df_new = df_new.drop('unique_key', axis=1)

                    #매장 카테고리 별로 키워드 추출
                    category = SEARCH_QUERY_TO_CATEGORY[query]
                    df_new['category'] = category
                    
                    # 어간화된 키워드 dict 사용
                    df_new = add_keywords_to_reviews_by_category(df_new, KEYWORD_STEM_DICT, category)
                    all_reviews_df = pd.concat([all_reviews_df, df_new], ignore_index=True)
                    
                    print(f"  -> 발견된 장소: {df_new['place_name'].unique()}")
        # API 제한 방지를 위한 딜레이        
        if i < len(search_queries) - 1:
            time.sleep(2)
    
    
    print(f"\n판교디지털센터 주변 음식점 리뷰 {len(all_reviews_df)}개 수집 완료!")    

    if not all_reviews_df.empty:
        # 매장별 키워드 요약 생성
        keyword_df = all_reviews_df.groupby(['place_name', 'place_address', 'category']).apply(aggregate_keywords, include_groups=False).reset_index()
        keyword_df.columns = ['place_name', 'place_address', 'category', 'keywords']
        
        print("\n매장별 키워드 요약 생성 완료!")
        
        # MariaDB에 데이터 저장
        save_to_mariadb(all_reviews_df, keyword_df)
              
        # 수집된 데이터 요약
        print(f"\n=== 수집 결과 요약 ===")
        print(f"총 리뷰 개수: {len(all_reviews_df):,}")
        print(f"필터링 후 수집된 장소 수: {all_reviews_df['place_name'].nunique()}")
        print(all_reviews_df[['place_name', 'category', 'matched_keywords']])
    else:
        print("수집된 리뷰가 없습니다.")
