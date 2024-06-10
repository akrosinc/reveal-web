FROM node:18.20.3-alpine3.20

WORKDIR /usr/local/app
ADD . .
RUN chmod +x deploy.sh

RUN yarn && \
    yarn global add serve

EXPOSE 3000

ENTRYPOINT ["/usr/local/app/deploy.sh"]
