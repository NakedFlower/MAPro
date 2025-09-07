FROM python:3.11-slim

# 작업 디렉터리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 Java(Konlpy용), C++ 빌드 도구 설치
# openjdk-11-jre-headless를 openjdk-17-jre-headless로 변경
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jre-headless \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt 먼저 복사 (캐싱 최적화)
COPY requirements.txt .

# Python 패키지 관리 도구 업그레이드 및 필요한 라이브러리 설치
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY app.py .

# 포트 8000 노출
EXPOSE 8000

# 환경변수 설정
ENV PYTHONUNBUFFERED=1

# 컨테이너 시작 시 실행할 명령어
# uvicorn을 프로덕션 모드로 실행 (멀티 워커, 자동 리로드 비활성화)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
