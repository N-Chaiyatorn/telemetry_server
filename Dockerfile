FROM node:12.16.3

WORKDIR /dockeri

ENV PORT 80

COPY package.json /dockeri/package.json

RUN npm install

COPY . /dockeri

CMD ["npm", "start"]