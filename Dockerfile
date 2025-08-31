FROM mysql:9.2.0
WORKDIR /
COPY my.cnf /etc/mysql/conf.d/my.cnf
COPY ./dump.sql /docker-entrypoint-initdb.d/
ENV MYSQL_ROOT_PASSWORD=Cabello1998
ENV MYSQL_DATABASE=comercial_cabello
EXPOSE 3306