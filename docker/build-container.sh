#!/bin/bash

mkdir -p build-container/build
mkdir -p build-container/node_modules
docker run -it --rm --name tasui-builder -v "$PWD":/tasui -v "$PWD/build-container/node_modules":/tasui/node_modules -v "$PWD/build-container/build":/tasui/build -w /tasui node:13.6 sh -c "npm install && npm run build"
docker build -f docker/Dockerfile .