FROM node:8.12.0-alpine

ENV APPDIR=/opt/app
RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

COPY package.json .
COPY package-lock.json .
COPY index.js .
COPY init.js .
COPY socket.io.js .

COPY api api
COPY database database
COPY middleWare middleWare
COPY routes routes
COPY views views

RUN npm i
EXPOSE 4000 4001

CMD [ "node", "index.js" ]