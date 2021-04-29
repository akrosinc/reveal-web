FROM node:10.24.0-stretch-slim

RUN mkdir -p /usr/src/app/reveal-frontend && mkdir -p /usr/src/app/express-server

COPY ./web/build /usr/src/app/reveal-frontend
COPY ./express-server /usr/src/app/express-server

RUN cd /usr/src/app/express-server && yarn

EXPOSE 3000

WORKDIR /usr/src/app