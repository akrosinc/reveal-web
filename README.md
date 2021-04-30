# Reveal Web

## Docker builds

### build the base node container

```sh
BUILD_NUMBER=4
docker build . -t ar-node:$BUILD_NUMBER -f Dockerfile.node
```

### build the base container container

```sh
BUILD_NUMBER=2
docker build . -t ar-reveal-test:$BUILD_NUMBER -f Dockerfile.test
```

### build the container

build the container

```sh
BUILD_NUMBER=7
docker build . -t ar-reveal-web:$BUILD_NUMBER
docker tag ar-reveal-web:$BUILD_NUMBER skylum.azurecr.io/ar-reveal-web:$BUILD_NUMBER
docker push skylum.azurecr.io/ar-reveal-web:$BUILD_NUMBER
```
