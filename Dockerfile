FROM node:8.6.0

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app

RUN npm install --registry=https://registry.npm.taobao.org

EXPOSE 7002

CMD npm run start