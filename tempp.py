import requests
import json
import pandas as pd
import time
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# 1. 키워드-표현 사전 정의
KEYWORD_DICT = {
    "음식점": {
        "유아의자": {
            "positive": [
                "유아", "아기", "하이체어", "베이비체어", "키즈", "어린이",
                "유모차", "베이비카", "육아맘", "애기엄마"
            ],
            "negative": [
                "유아의자 없", "아기의자 없", "하이체어 없", "베이비체어 없",
                "아이 앉힐 곳 없", "키즈의자 없", "아이 데리고 가기 힘듦"
            ]
        },
        "혼밥": {
            "positive": [
                "혼밥", "1인", "솔로", "혼자", "카운터석", "바 테이블"
            ],
            "negative": [
                "혼밥 불가", "1인 안됨", "혼자 오기 어려", "1인석 없",
                "2인 이상", "단체 전용", "커플 전용", "가족 전용"
            ]
        },
        "새로오픈": {
            "positive": [
                "새로", "신규", "오픈", "그랜드", "리뉴얼", "신상", "뉴",
                "최근", "갓", "막", "따끈따끈", "신생", "깨끗", "말끔"
            ],
            "negative": [
                "오래된", "전통", "역사", "원조", "본점", "노포", "수십년"
            ]
        },
        "데이트": {
            "positive": [
                "데이트", "연인", "커플", "애인", "무드", "로맨틱",
                "조명", "캔들", "기념일", "프러포즈",
                "힙한", "감성", "갬성", "뷰", "야경", "테라스", "루프탑"
            ],
            "negative": [
                "데이트 비추", "분위기 별로", "무드 없", "시끄러운",
                "형광등", "데이트 분위기 아님"
            ]
        },
        "노키즈존": {
            "positive": [
                "노키즈", "성인전용", "어른전용", "19세이상", "출입금지"
            ],
            "negative": [
                "아이들 많", "시끄러운 아이들", "노키즈존 아님",
                "키즈 카페", "키즈 프렌들리"
            ]
        },
        "지역화폐": {
            "positive": [
                "지역화폐", "지역상품권", "상품권", "지역페이", "시민페이",
                "경기페이", "서울페이", "제로페이", "간편결제", "모바일결제"
            ],
            "negative": [
                "지역화폐 안됨", "상품권 사용 불가", "페이 안됨",
                "현금만", "카드만"
            ]
        },
        "주차": {
            "positive": [
                "주차", "파킹", "무료주차", "발렛", "주차장",
                "주차면", "주차자리", "주차칸"
            ],
            "negative": [
                "주차 어려움", "주차장 없", "주차 힘들", "주차 불가",
                "주차난", "주차비 비쌈"
            ]
        },
        "인기많은": {
            "positive": [
                "인기", "핫한", "핫플", "유명", "웨이팅", "대기", "줄서기",
                "예약 필수", "예약 어려움", "붐비는", "맛집", "SNS",
                "TV 나온", "연예인", "재방문", "단골", "소문난"
            ],
            "negative": [
                "한산한", "웨이팅 없", "인기 없", "알려지지 않"
            ]
        }
    },
    "카페": {
        "편한좌석": {
            "positive": [
                "편한", "소파", "쿠션", "푹신", "넓은", "여유로운", "안락"
            ],
            "negative": [
                "불편", "딱딱한", "좁은", "비좁은", "오래 앉기 힘듦"
            ]
        },
        "카공": {
            "positive": [
                "카공", "공부", "스터디", "작업", "업무", "노트북",
                "와이파이", "wifi", "콘센트", "전원", "충전", "조용"
            ],
            "negative": [
                "카공 불가", "공부 금지", "노트북 사용 제한",
                "콘센트 없", "와이파이 약함"
            ]
        },
        "노키즈존": {
            "positive": [
                "노키즈", "성인전용", "어른전용", "출입금지"
            ],
            "negative": [
                "아이들 많", "시끄러운", "노키즈존 아님", "키즈 카페"
            ]
        },
        "분위기좋은": {
            "positive": [
                "분위기", "무드", "감성", "갬성", "뷰", "조명", "인테리어",
                "창가", "테라스", "음악", "bgm", "힐링"
            ],
            "negative": [
                "분위기 별로", "무드 없", "감성 없", "밋밋한"
            ]
        },
        "인테리어": {
            "positive": [
                "인테리어", "디자인", "꾸밈", "감각적", "세련된", "모던",
                "빈티지", "유니크", "독특", "컨셉", "벽화", "아트"
            ],
            "negative": [
                "인테리어 별로", "꾸밈 없", "단조로운", "특색 없"
            ]
        },
        "디저트": {
            "positive": [
                "디저트", "케이크", "마카롱", "쿠키", "타르트", "와플",
                "달콤", "수제", "홈메이드"
            ],
            "negative": [
                "디저트 별로", "케이크 없", "달지 않", "맛없는"
            ]
        },
        "조용한": {
            "positive": [
                "조용", "차분", "정숙", "평화", "고요", "힐링", "한적"
            ],
            "negative": [
                "시끄러운", "소음", "떠들썩", "북적북적", "혼잡"
            ]
        },
        "24시간": {
            "positive": [
                "24시간", "24시", "밤늦게", "새벽", "심야", "올나잇"
            ],
            "negative": [
                "24시간 아님", "일찍 닫", "밤에 문 닫", "늦은 시간 안됨"
            ]
        }
    },
    "편의점": {
        "야외좌석": {
            "positive": [
                "야외", "테라스", "밖에", "외부", "옥외"
            ],
            "negative": [
                "야외좌석 없", "테라스 없", "실내만"
            ]
        },
        "ATM": {
            "positive": [
                "ATM", "현금인출기", "CD기", "은행기기", "출금"
            ],
            "negative": [
                "ATM 없", "현금인출 불가", "돈 못 뽑"
            ]
        },
        "취식공간": {
            "positive": [
                "취식", "먹을곳", "테이블", "의자", "이트인", "좌석"
            ],
            "negative": [
                "취식공간 없", "먹을 곳 없", "앉을 곳 없", "포장만"
            ]
        }
    },
    "약국": {
        "친절": {
            "positive": [
                "친절", "상냥", "다정", "설명", "자세히", "꼼꼼"
            ],
            "negative": [
                "불친절", "차갑", "무뚝뚝", "설명 부족", "귀찮아함"
            ]
        },
        "비처방의약품": {
            "positive": [
                "일반의약품", "일반약", "OTC", "감기약", "두통약", "소화제",
                "파스", "비타민", "처방전 없이", "상비약"
            ],
            "negative": [
                "일반약 없", "처방전 필요", "전문의약품만"
            ]
        }
    },
    "펜션": {
        "수영장": {
            "positive": [
                "수영장", "풀", "pool", "물놀이", "키즈풀", "인피니티"
            ],
            "negative": [
                "수영장 없", "물놀이 불가", "수영 불가"
            ]
        },
        "스파": {
            "positive": [
                "스파", "온천", "사우나", "찜질", "자쿠지", "마사지", "힐링"
            ],
            "negative": [
                "스파 없", "온천 없", "사우나 없"
            ]
        },
        "인기많은": {
            "positive": [
                "인기", "유명", "핫한", "예약 어려움", "웨이팅",
                "소문난", "SNS", "후기 좋", "재방문"
            ],
            "negative": [
                "예약 쉬움", "한산", "인기 없"
            ]
        },
        "애완동물동반": {
            "positive": [
                "애완동물", "반려동물", "펫", "강아지", "고양이", "댕댕이"
            ],
            "negative": [
                "애완동물 불가", "펫 불가", "동물 금지"
            ]
        },
        "조식": {
            "positive": [
                "조식", "아침식사", "breakfast", "모닝", "뷔페"
            ],
            "negative": [
                "조식 없음", "아침식사 불가"
            ]
        },
        "바베큐": {
            "positive": [
                "바베큐", "BBQ", "고기구이", "숯불", "그릴", "야외취사"
            ],
            "negative": [
                "바베큐 불가", "고기 못 구움", "야외취사 금지"
            ]
        }
    },
    "헤어샵": {
        "인기많은": {
            "positive": [
                "인기", "유명", "예약 어려움", "웨이팅", "잘하는", "실력"
            ],
            "negative": [
                "예약 쉬움", "한산", "유명하지 않"
            ]
        },
        "쿠폰멤버십": {
            "positive": [
                "쿠폰", "할인", "멤버십", "적립", "이벤트", "혜택"
            ],
            "negative": [
                "쿠폰 없", "할인 안됨", "혜택 없"
            ]
        },
        "예약필수": {
            "positive": [
                "예약필수", "사전예약", "미리", "예약제"
            ],
            "negative": [
                "예약 안해도 됨", "바로 방문", "워킹 가능"
            ]
        }
    },
    "병원": {
        "응급실": {
            "positive": [
                "응급실", "응급", "24시간", "종합병원", "ER", "구급차"
            ],
            "negative": [
                "응급실 없", "응급 불가", "24시간 아님"
            ]
        },
        "전문의": {
            "positive": [
                "전문의", "전문가", "교수", "박사", "스페셜리스트"
            ],
            "negative": [
                "전문의 없", "일반의", "전문 진료 불가"
            ]
        },
        "야간진료": {
            "positive": [
                "야간", "밤", "저녁", "24시간", "심야", "당직"
            ],
            "negative": [
                "야간진료 없", "일찍 닫", "밤에 안됨"
            ]
        }
    }
}

SEARCH_QUERY_TO_CATEGORY = {
    "food": "음식점",
    "cafe": "카페",
    "convenience store": "편의점",
    "pharmacy": "약국",
    "pension": "펜션",
    "beauty salon": "헤어샵",
    "hospital": "병원"
}

# Spring Boot 애플리케이션 URL - 실제 IP 주소 및 포트로 변경 필요
SPRING_BOOT_API_URL = "http://localhost:8080/api/data"

 
def save_to_springboot(df: pd.DataFrame, api_url: str):
    """
    DataFrame의 데이터를 Spring Boot API를 통해 저장합니다.
    """
    if df.empty:
        print("저장할 데이터가 없습니다.")
        return

    # DataFrame을 Spring Boot API가 예상하는 JSON 형식으로 변환합니다.
    # 각 row를 {'name': '...', 'address': '...', 'category': '...', 'keyword': '...'} 형태로 만듭니다.
    data_to_send = []
    for _, row in df.iterrows():
        data_to_send.append({
            'name': row['place_name'],
            'address': row['place_address'],
            'category': row['category'],
            'keyword': row['keywords']
        })

    headers = {'Content-Type': 'application/json'}

    print(f"Spring Boot API ({api_url})로 데이터 전송 시도 중...")
    try:
        response = requests.post(api_url, data=json.dumps(data_to_send), headers=headers)
        response.raise_for_status()  # HTTP 오류가 발생하면 예외 발생

        if response.status_code == 201: # Created 상태 코드 (성공적으로 생성되었을 때)
            print(f"데이터가 Spring Boot API를 통해 성공적으로 저장되었습니다. 응답: {response.json()}")
        else:
            print(f"데이터 저장 실패: HTTP 상태 코드 {response.status_code}")
            print(f"응답 내용: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Spring Boot API 호출 중 오류 발생: {e}")
        print(f"호출 URL: {api_url}")
        print(f"보내려던 데이터 일부 (첫 3개): {data_to_send[:3]}")
    except json.JSONDecodeError:
        print(f"Spring Boot API 응답을 JSON으로 디코딩하는 데 실패했습니다. 응답: {response.text}")

def extract_keywords_from_review_by_category(review_text: str, category: str, keyword_dict: dict) -> dict:
    result = {}
    if category not in keyword_dict:
        return result
    keywords = keyword_dict[category]
    for keyword, exprs in keywords.items():
        found = None
        for neg in exprs.get("negative", []):
            if neg in review_text:
                result[f"{category}_{keyword}"] = "negative"
                found = "negative"
                break
        if found:
            continue
        for pos in exprs.get("positive", []):
            if pos in review_text:
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
    keywords = set()
    for kw_list in group['matched_keywords']:
        if isinstance(kw_list, list):
            keywords.update(kw_list)
    keywords = [k.split('_', 1)[1] for k in keywords]
    return ','.join(sorted(set(keywords)))

class GoogleMapsReviewCollector:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api/place"
    
    def search_places(self, query: str, location: str = None, radius: int = 1000) -> List[Dict]:
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
                        }
                        reviews.append(review_data)
            else:
                print(f"장소 상세 정보 오류: {data['status']} - {place_id}")
        except requests.exceptions.RequestException as e:
            print(f"API 요청 오류: {e}")
        return reviews

    def _is_within_years(self, timestamp: int, years: int = 5) -> bool:
        try:
            review_date = datetime.fromtimestamp(timestamp)
            cutoff_date = datetime.now() - timedelta(days=years * 365)
            return review_date >= cutoff_date
        except:
            return False
    
    def collect_reviews_from_search(self, query: str, location: str = None, 
                                  max_places: int = 10, delay: float = 1.0, years_filter: int = None) -> pd.DataFrame:
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
            if i < min(len(places), max_places) - 1:
                time.sleep(delay)
        if all_reviews:
            df = pd.DataFrame(all_reviews)
            columns = ['place_name', 'place_address', 'review_text']
            df = df[columns]
            years_text = f" ({years_filter}년 이내)" if years_filter else ""
            print(f"\n총 {len(df)}개 리뷰{years_text} 수집 완료!")
            return df
        else:
            print("수집된 리뷰가 없습니다.")
            return pd.DataFrame()
    
    def collect_reviews_from_place_id(self, place_id: str, years_filter: int = None) -> pd.DataFrame:
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
    # Google Maps API 키 #보안 유지를 위한 보완 필요
    API_KEY = "asdf"
    
    # 리뷰 수집기 초기화    
    collector = GoogleMapsReviewCollector(API_KEY)
    
    # 판교디지털센터의 위도와 경도    # 현재 위치 불러오는 거 생각해야 함
    goorm_location = "37.4023,127.1012"
    
    print("=== 구름스퀘어 판교 주변 음식점 리뷰 수집 ===")
    
    # 위치 기반으로 다양한 음식점 타입 검색
    search_queries = [
        "food",             # 음식점
        "cafe",              # 카페
        "convenience store", # 편의점
        "pharmacy",          # 약국
        "pension",           # 펜션
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
                    
                    df_new = add_keywords_to_reviews_by_category(df_new, KEYWORD_DICT, category)
                    all_reviews_df = pd.concat([all_reviews_df, df_new], ignore_index=True)
                    
                    print(f"  -> 발견된 장소: {df_new['place_name'].unique()}")
        if i < len(search_queries) - 1:
            time.sleep(2)
    
    print(f"\n판교디지털센터 주변 음식점 리뷰 {len(all_reviews_df)}개 수집 완료!")    

    if not all_reviews_df.empty:
        keyword_df = all_reviews_df.groupby(['place_name', 'place_address', 'category']).apply(aggregate_keywords, include_groups=False).reset_index()
        keyword_df.columns = ['place_name', 'place_address', 'category', 'keywords']

        # Spring Boot API 호출 함수
        save_to_springboot(keyword_df, SPRING_BOOT_API_URL)
            
        # 수집된 데이터 요약
        print(f"\n=== 수집 결과 요약 ===")
        print(f"총 리뷰 개수: {len(all_reviews_df):,}")
        print(f"필터링 후 수집된 장소 수: {all_reviews_df['place_name'].nunique()}")
        print(all_reviews_df[['place_name', 'category', 'matched_keywords']])
    else:
        print("수집된 리뷰가 없습니다.")