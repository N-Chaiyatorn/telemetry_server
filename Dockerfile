FROM node:latest

WORKDIR /server

COPY package.json /server/package.json

RUN npm install

COPY . /server

CMD ["npm", "start"]