# syntax=docker/dockerfile:1
FROM golang

RUN go version

WORKDIR /app
COPY ./ ./

#
RUN apt-get update
RUN apt-get -y install webpack
RUN apt -y install nodejs
RUN curl -L https://npmjs.org/install.sh | sh
RUN node --version
RUN npm install --save-dev webpack-cli

RUN cd /app/web/src/static/js/modules
RUN touch appAddr.js
RUN printf "export const appAddr = '%s'" $APP_ADDRESS >> appAddr.js

RUN webpack --node-env=production

#RUN apt-get -y install postgresql-client
#
## make wait-for-postgres.sh executable
#RUN chmod +x wait-for-postgres.sh

RUN go mod download
RUN go build -o app ./cmd/main.go
RUN chmod 777 app

EXPOSE 6000

CMD ["./app"]