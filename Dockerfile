# syntax=docker/dockerfile:1
FROM golang

ARG APP_ADDRESS

RUN go version

WORKDIR /app
COPY ./ ./

RUN apt-get update
RUN apt-get -y install webpack
RUN apt -y install nodejs
RUN curl -L https://npmjs.org/install.sh | sh
RUN node --version
RUN npm install --save-dev webpack-cli

RUN go mod download
RUN go build -o app ./cmd/main.go
RUN chmod 777 app

EXPOSE 6000

CMD ["./app"]