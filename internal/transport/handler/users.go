package handler

import (
	"crm/internal/domain"
	"crm/internal/services"
	"github.com/gin-gonic/gin"
	ginSession "github.com/go-session/gin-session"
	"net/http"
)

func (h *Handler) getOperators(c *gin.Context) {
	store := ginSession.FromContext(c)

	user, _ := store.Get("userInfo")
	userInfo := user.(domain.UserInfo)

	users, err := h.services.Users.GetUsersByGroupAndPlot(userInfo)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

func (h *Handler) getManagers(c *gin.Context) {
	users, err := h.services.Users.GetManagers()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

func (h *Handler) getUsers(c *gin.Context) {
	users, err := h.services.Users.GetUsers()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

func (h *Handler) getAllUsers(c *gin.Context) {
	users, err := h.services.Users.GetAllUsers()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

func (h *Handler) deleteUser(c *gin.Context) {
	userID := c.Param("user-id")

	if err := h.services.Users.DeleteUser(userID); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newOkResponse(c, http.StatusOK)
}

func (h *Handler) getUserByID(c *gin.Context) {
	data := map[string]string{}

	if err := c.Bind(&data); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	user, err := h.services.Users.GetUserByID(data["id"])
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	newDataResponse(c, 200, user)
}

func (h *Handler) addUser(c *gin.Context) {
	var user domain.UserInfo

	if err := c.Bind(&user); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	id, err := h.services.Users.CreateUser(user)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"id": id,
	})
}

func (h *Handler) editUser(c *gin.Context) {
	var user domain.UserInfo
	if err := c.Bind(&user); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err)
		return
	}

	err := h.services.Users.EditUser(user)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "ok",
	})
}

func (h *Handler) getAllOperators(c *gin.Context) {
	users, err := h.services.Users.GetOperators()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"data": users,
	})
}

func NewHandler(services *services.Services) *Handler {
	return &Handler{
		services: services,
	}
}
