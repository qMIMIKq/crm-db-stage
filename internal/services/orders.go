package services

import (
	"crm/internal/domain"
	"crm/internal/repository"
)

type OrdersService struct {
	repo repository.Orders
}

func (o OrdersService) UpdateOrders(orders []*domain.Order) error {
	return o.repo.UpdateOrders(orders)
}

func (o OrdersService) GetOrders() ([]*domain.Order, error) {
	return o.repo.GetOrders()
}

func (o OrdersService) AddOrders(orders []*domain.Order) error {
	return o.repo.AddOrders(orders)
}

func NewOrdersService(repo repository.Orders) *OrdersService {
	return &OrdersService{repo: repo}
}
