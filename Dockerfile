# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 앱 파일 복사
COPY tempp.py /app/tempp.py
COPY keyword.csv /app/keyword.csv

# 기본 실행 커맨드 (환경변수로 API 키와 SPRING_BOOT_API_URL 전달할 것)
CMD ["python", "/app/tempp.py"]