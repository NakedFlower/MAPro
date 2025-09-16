# MAPro Chat API

FastAPI 기반의 챗봇 API 서버입니다. 사용자의 자연어 입력을 받아 NLP 처리 후 데이터베이스에서 적절한 매장을 검색하여 응답을 제공합니다.

## 주요 기능 

- **자연어 처리**: 한국어 형태소 분석
- **매장 검색**: 카테고리, 특성, 위치 기반 매장 검색
- **RESTful API**: FastAPI 기반의 REST API 제공
- **데이터베이스 연동**: MySQL 데이터베이스 연동
- **CORS 지원**: 프론트엔드와의 통신 지원

## 기술 스택

- **Backend**: FastAPI, Python 3.9
- **Database**: MySQL
- **NLP**: kiwipiepy (한국어 형태소 분석)
- **ORM**: SQLAlchemy
- **Container**: Docker

## 설치

### 1. 가상환경 생성 및 활성화
```bash
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

## 환경 설정

GCP MySQL 데이터베이스 연결을 위해 환경변수를 설정하세요:

```bash
# Windows (PowerShell)
$env:DB_HOST="34.22.81.216"
$env:DB_PORT="3306"
$env:DB_NAME="mapro"
$env:DB_USER="dev"
$env:DB_PASSWORD="Dev1010**"

# Linux/Mac
export DB_HOST="34.22.81.216"
export DB_PORT="3306"
export DB_NAME="mapro"
export DB_USER="dev"
export DB_PASSWORD="Dev1010**"
```

또는 `.env` 파일을 생성하여 설정할 수 있습니다:

```env
DB_HOST=34.22.81.216
DB_PORT=3306
DB_NAME=mapro
DB_USER=dev
DB_PASSWORD=Dev1010**
```
 
## 실행

### 개발 서버 실행
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Docker로 실행
```bash
# 이미지 빌드
docker build -t mapro-chat-api .

# 컨테이너 실행
docker run -d --name mapro-chat-api \
  -p 8000:8000 \
  -e DB_HOST="34.22.81.216" \
  -e DB_PORT="3306" \
  -e DB_NAME="mapro" \
  -e DB_USER="dev" \
  -e DB_PASSWORD="Dev1010**" \
  mapro-chat-api
```

## API 엔드포인트

### POST `/chat`
챗봇과의 대화를 위한 엔드포인트

**Request:**
```json
{
  "message": "강남구 노키즈존 카페 추천해줘"
}
```

**Response:**
```json
{
  "reply": "강남구 카페 노키즈존 조건으로 3곳을 찾았어요. 예: 스타벅스, 이디야, 카페베네",
  "places": [
    {"name": "스타벅스"},
    {"name": "이디야"},
    {"name": "카페베네"}
  ]
}
```

### GET `/health`
서버 및 데이터베이스 연결 상태 확인

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

## CORS 설정

VM 외부 IP 주소(`http://34.64.120.99`)에서의 접근이 허용됩니다.

## CI/CD 파이프라인

이 프로젝트는 GitHub Actions를 사용한 자동 배포 파이프라인이 구축되어 있습니다.

### 트리거 조건
- `dev/chat` 브랜치에 push 또는 pull request 생성 시 자동 실행

### 배포 과정
1. **Docker 이미지 빌드**: chat 폴더의 Dockerfile을 사용하여 이미지 생성
2. **GCR 푸시**: Google Container Registry에 이미지 업로드
3. **VM 배포**: GCP VM에 컨테이너 배포 및 실행
4. **헬스체크**: 배포 후 API 서버 상태 확인

### 필요한 GitHub Secrets
- `GCP_SA_KEY`: GCP 서비스 계정 키
- `GCP_VM_IP`: VM 외부 IP 주소
- `NF_GCP_VM_USER`: VM 사용자명
- `NF_GCP_SSH_KEY`: VM SSH 키
- `GCP_SPRING_DATASOURCE_HOST`: DB 호스트
- `GCP_SPRING_DATASOURCE_PORT`: DB 포트
- `GCP_SPRING_DATASOURCE_DBNAME`: DB 이름
- `GCP_SPRING_DATASOURCE_USERNAME`: DB 사용자명
- `GCP_SPRING_DATASOURCE_PASSWORD`: DB 비밀번호

## 개발자 정보

- **고경환**: [NakedFlower](https://github.com/)
- **김동석**: 
- **유진**: 

## 라이선스

이 프로젝트는 교육 목적으로 개발되었습니다.
