# 1단계: 빌드
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2단계: 실행
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/MAPro-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 4000
ENTRYPOINT ["java", "-jar", "app.jar"]
