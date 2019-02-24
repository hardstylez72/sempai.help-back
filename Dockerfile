FROM node:8.12.0-alpine

#RUN apk add --update --no-cache netcat-openbsd
#RUN cd
#COPY docker-entrypoint.sh .
#RUN chmod 777 /docker-entrypoint.sh
RUN mkdir -p /usr/server/content/

ENV APPDIR=/opt/app
RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

COPY package.json .
COPY package-lock.json .
COPY socket.io.js .

COPY src src

RUN npm i
EXPOSE 4000

CMD [ "node", "index.js" ]