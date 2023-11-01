build:
	docker-compose build todo-app
cont:
	docker build -t m1m1kq/oxcs .
start:
	docker-compose up -d oxcs