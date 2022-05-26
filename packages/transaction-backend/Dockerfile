FROM node:alpine

RUN mkdir -p /app && chown -R node:node /app

ADD ./package.json /app

WORKDIR /app

RUN apk add --no-cache git
RUN yarn install

COPY ./ /app

RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]
