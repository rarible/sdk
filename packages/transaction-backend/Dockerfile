FROM node:16.20.0-alpine

RUN apk add --update python3 py3-pip make
RUN mkdir -p /app && chown -R node:node /app

ADD ./package.json /app

WORKDIR /app

RUN apk add --no-cache git
RUN yarn install

COPY ./ /app

RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]
