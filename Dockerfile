FROM oven/bun

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package*.json bun.lockb /usr/app/
RUN bun install

COPY . /usr/app/

ENV PORT 3000
ENV NODE_ENV production

EXPOSE ${PORT}
CMD [ "bun", "server/server.ts" ]
