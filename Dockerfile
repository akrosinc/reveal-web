FROM node:10.24.0-stretch-slim

RUN mkdir -p /usr/src/app/reveal-frontend && mkdir -p /usr/src/app/express-server && mkdir -p /usr/src/app/builder

COPY ./web /usr/src/app/builder
COPY ./express-server /usr/src/app/express-server

RUN cd /usr/src/app/builder && yarn && yarn build && mv build/* /usr/src/app/reveal-frontend
RUN cd /usr/src/app/express-server && yarn
RUN rm -Rf /usr/src/app/builder

EXPOSE 3000

WORKDIR /usr/src/app