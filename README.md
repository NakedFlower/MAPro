# MAPro - Google Maps 리뷰 수집 및 분석 프로젝트

## 개요
Google Maps API를 사용하여 특정 지역의 장소 리뷰를 수집하고 키워드 분석을 수행하는 Python 프로젝트입니다.

## 주요 기능
- Google Maps API를 통한 장소 검색 및 리뷰 수집
- 한국어 형태소 분석을 통한 키워드 추출
- CSV 파일 및 MariaDB 저장 지원
- GCP VM에서 Docker 컨테이너로 실행

## MariaDB 설정 (GCP VM 환경)

### 1. MariaDB 설치 및 설정
```bash
# MariaDB 설치
sudo apt update
sudo apt install mariadb-server

# MariaDB 보안 설정
sudo mysql_secure_installation

# MariaDB 서비스 시작
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 2. 데이터베이스 및 사용자 생성
```sql
-- MariaDB 접속
sudo mysql -u root -p

-- 데이터베이스 생성
CREATE DATABASE mapro_reviews CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 및 권한 부여
CREATE USER 'mapro_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON mapro_reviews.* TO 'mapro_user'@'localhost';
FLUSH PRIVILEGES;

-- 데이터베이스 확인
SHOW DATABASES;
EXIT;
```

### 3. 코드 설정 수정
`main.py`와 `tempp.py` 파일의 `MARIA_DB_CONFIG` 섹션을 수정하세요:

```python
MARIA_DB_CONFIG = {
    'host': 'localhost',           # GCP VM의 localhost
    'port': 3306,                  # MariaDB 기본 포트
    'user': 'mapro_user',          # 생성한 사용자명
    'password': 'YOUR_PASSWORD',   # 설정한 비밀번호
    'database': 'mapro_reviews',   # 생성한 데이터베이스명
    'charset': 'utf8mb4'
}
```

## 실행 방법

### 로컬 실행
```bash
pip install -r requirements.txt
python main.py
# 또는
python tempp.py
```

### Docker 실행
```bash
docker build -t mapro-python .
docker run mapro-python
```

### GCP VM 배포
GitHub Actions를 통해 자동으로 GCP VM에 배포됩니다.

## 데이터베이스 스키마

### place_reviews 테이블
- 장소별 수집된 리뷰 정보 저장
- 키워드 매칭 결과 포함

### place_keywords 테이블
- 장소별 키워드 요약 정보 저장
- 카테고리별 분석 결과

## 주의사항
- Google Maps API 키가 필요합니다
- MariaDB 연결 정보는 보안을 위해 환경변수나 시크릿으로 관리하는 것을 권장합니다
- GCP VM의 방화벽 설정에서 MariaDB 포트(3306)가 열려있어야 합니다 