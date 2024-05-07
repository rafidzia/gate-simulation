FROM node:20-alpine3.18

RUN apk add --no-cache busybox-extras

COPY . .

ENV HOST "localhost"
ENV PORT 2000
ENV CLIENT_PER_WORKER 1000
ENV WORKER_COUNT 2
ENV WAIT_FOR_REPLY true
ENV GENERATE_DELAY 0
ENV DEVICE concox

RUN npm ci

RUN npm run build

CMD ["node", "build"]