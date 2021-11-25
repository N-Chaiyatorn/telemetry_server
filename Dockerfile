FROM node:latest

WORKDIR /dockeri

COPY package.json /dockeri/package.json

RUN npm install

COPY . /dockeri

CMD ["npm", "start"]