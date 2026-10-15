FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B -Dmaven.test.skip=true package


FROM eclipse-temurin:17-jre

WORKDIR /app

# Certificado público de Aiven
COPY certs/aiven-ca.pem /tmp/aiven-ca.pem

RUN keytool -importcert \
    -noprompt \
    -alias aiven-techzone \
    -file /tmp/aiven-ca.pem \
    -cacerts \
    -storepass changeit \
    && rm /tmp/aiven-ca.pem

RUN useradd --system --uid 10001 techzone

COPY --from=build /app/target/*.jar /app/app.jar

USER techzone

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]