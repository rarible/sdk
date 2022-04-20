FROM node:16.13.0-buster as build

WORKDIR /app/
COPY packages/transaction-backend/package.json /app/package.json
RUN yarn install

COPY packages/transaction-backend/ /app/
RUN yarn build

FROM node:16.13.0-buster-slim

RUN apt-get update -y \
    && apt-get install -y curl vim-tiny procps less \
    && rm -rf /var/{lib/apt,lib/dpkg/info,cache,log}/

ENV HOME /tmp/
ENV PORT 8080

USER nobody:nogroup

WORKDIR /app

COPY --from=build /app/ /app/

CMD ["yarn", "start"]