FROM _BASE_

COPY build-container/build /opt/tasui

COPY docker/files/proxy.js /opt/proxy.js

WORKDIR /opt

RUN npm install serve-handler http-proxy

EXPOSE 80

WORKDIR /opt/tasui

ENV NODE_PATH=/opt

CMD node ../proxy.js
