# Python 3.9 slim 이미지 사용
FROM python:3.9-slim

# 작업 디렉터리 설정
WORKDIR /app

# 코드 파일 복사
COPY tempp.py /app/

# Python 패키지 관리 도구 업그레이드 및 필요한 라이브러리 설치
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir pandas requests

# 컨테이너 시작 시 실행할 명령어
CMD ["python", "tempp.py"]
