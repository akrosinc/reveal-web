FROM node:17.3.0 as build

COPY . /project

WORKDIR /project
ENV PATH /project/node_modules/.bin:$PATH

RUN chown -R node .
USER node

RUN cp /project/.env.production /project/.env && yarn

USER root
RUN chown -R node .
USER node
RUN yarn build

FROM node:17.3.0-alpine as final

RUN apk add --no-cache tini

WORKDIR /usr/src/web

COPY --from=build /project/build /usr/src/app

RUN chown -R node /usr/src/app

WORKDIR /usr/src/app

USER node

EXPOSE 3000

CMD [ "/bin/sh", "-c", "node ." ]

ENTRYPOINT ["/sbin/tini", "--"]