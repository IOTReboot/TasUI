FROM node:8.17-jessie

COPY . /tasui

WORKDIR /tasui

RUN npm install
RUN npm run build
RUN yarn global add serve

CMD serve -s build -l 8081
EXPOSE 8081