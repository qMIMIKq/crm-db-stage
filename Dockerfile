# syntax=docker/dockerfile:1
FROM golang

RUN go version

WORKDIR /app
COPY ./ ./

RUN apt-get update
RUN apt-get -y install postgresql-client

# make wait-for-postgres.sh executable
RUN chmod +x wait-for-postgres.sh


RUN go mod download
RUN go build -o app ./cmd/main.go
RUN chmod 777 app

CMD ["./app"]