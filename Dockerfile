FROM node:18-alpine

WORKDIR /usr/local/app
ADD . .
RUN chmod +x deploy.sh

RUN yarn && \
    yarn global add serve

EXPOSE 3000

ENTRYPOINT ["/usr/local/app/deploy.sh"]
