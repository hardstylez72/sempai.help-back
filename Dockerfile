FROM node:8.12.0-alpine

ENV APPDIR /opt/app

RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}


COPY package.json .
COPY package-lock.json .
COPY index.js .
COPY init.js .
COPY app.js .

COPY views views
COPY public public
COPY middleWare middleWare
COPY routes routes
COPY database database

RUN npm i
EXPOSE 4000

CMD [ "node", "app.js" ]