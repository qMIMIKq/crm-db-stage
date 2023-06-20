# syntax=docker/dockerfile:1
FROM golang:latest

RUN go version
ENV GOPATH=/

COPY ./ ./

RUN go mod download
RUN go build -o crm ./cmd/main.go
#RUN chmod 777 crm

CMD ["./crm"]