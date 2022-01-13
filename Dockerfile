FROM node:16.13.0-alpine

WORKDIR /usr/local/app
ADD . .

RUN yarn && \
    yarn build

EXPOSE 3000

CMD [ "yarn", "start", "production" ]
