FROM node:16.13.0-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable

# install debugging tools
RUN apt-get update && apt-get install -y \
    iputils-ping \
    curl \
    dnsutils \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# copy react build
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000

ENTRYPOINT ["nginx", "-g", "daemon off;"]
