FROM node:16.3.0-alpine

WORKDIR /usr/local/app
ADD . .

COPY .env.production /.env

RUN yarn && \
    yarn build

EXPOSE 3000

CMD [ "yarn", "start", "production" ]
