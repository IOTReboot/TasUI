FROM node:8.17.0-alpine3.11

COPY . /tasui

WORKDIR /tasui

RUN apk add --no-cache git
RUN npm install
RUN npm run build
RUN yarn global add serve

CMD serve -s build -l 8081
EXPOSE 8081
