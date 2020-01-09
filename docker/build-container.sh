#!/bin/bash

npm install
npm run build
docker build -f docker/Dockerfile .