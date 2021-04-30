FROM ar-reveal-web:6

RUN mkdir -p /usr/src/app/reveal-frontend && mkdir -p /usr/src/app/express-server

COPY ./web /usr/src/app/reveal-frontend
COPY ./express-server /usr/src/app/express-server

EXPOSE 3000

WORKDIR /usr/src/app