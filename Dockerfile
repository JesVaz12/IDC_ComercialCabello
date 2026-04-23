FROM mysql:9.2.0
WORKDIR /
COPY my.cnf /etc/mysql/conf.d/my.cnf
COPY ./dump.sql /docker-entrypoint-initdb.d/
# Las credenciales se inyectan en runtime via docker-compose o --env-file.
# NO hardcodear passwords en el Dockerfile.
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
ENV MYSQL_DATABASE=${DB_NAME}
EXPOSE 3306