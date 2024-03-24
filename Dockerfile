FROM oven/bun:alpine

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package*.json bun.lockb /usr/app/
RUN bun install --omit=dev

COPY . /usr/app/

ENV PORT 8080
ENV NODE_ENV production

EXPOSE ${PORT}
CMD [ "bun", "server/server.ts" ]
