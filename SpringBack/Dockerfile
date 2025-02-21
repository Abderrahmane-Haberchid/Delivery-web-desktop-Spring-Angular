FROM amazoncorretto:21
LABEL authors="abderahman"

WORKDIR /app

COPY target/jiraclone-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]