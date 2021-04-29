# Reveal Web

## Docker builds

### build the container

build the container

```sh
BUILD_NUMBER=7
docker build . -t ar-reveal-web:$BUILD_NUMBER
docker tag ar-reveal-web:$BUILD_NUMBER skylum.azurecr.io/ar-reveal-web:$BUILD_NUMBER
docker push skylum.azurecr.io/ar-reveal-web:$BUILD_NUMBER
```
