/*
   auth_handler contains HTTP request handlers for user authentication and account management.
   These handlers include functionality for user registration, login, logout, and account deletion.
*/

package handlers

import (
	"bookstore/internal/models"
	"bookstore/internal/session_manager"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

func InitializeRoutes(router *gin.Engine) {

	router.POST("/api/auth/register", Register)
	router.POST("/api/auth/login", Login)
	router.GET("/api/auth/logout", Logout)
	router.DELETE("/api/auth/delete-account", DeleteAccount)
}

func Register(c *gin.Context) {
	var input models.Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingUser models.User
	if err := models.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User with this email already exists"})
		return
	}

	if err := models.DB.Where("username = ?", input.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User with this username already exists"})
		return
	}

	var activeDeletedUser models.User
	if err := models.DB.Where("email = ?", input.Email).First(&activeDeletedUser).Error; err == nil {
		if activeDeletedUser.IsActive == false && activeDeletedUser.IsDeleted == true {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown error! Contact our team at support@support.com"})
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	models.DB.Create(&user)

	initialBalance := models.Balance{
		UserID: user.ID,
		Amount: 5000.0,
	}
	models.DB.Create(&initialBalance)

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func Login(c *gin.Context) {
	session, _ := session_manager.Store.Get(c.Request, "session-name")

	// Delete any existing session values
	session.Values["user_id"] = nil
	session.Values["role"] = nil
	session.Save(c.Request, c.Writer)

	var input models.Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := models.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	var activeDeletedUser models.User
	if err := models.DB.Where("email = ?", input.Email).First(&activeDeletedUser).Error; err == nil {
		if activeDeletedUser.IsActive == false && activeDeletedUser.IsDeleted == true {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown error! Contact our team at support@support.com"})
			return
		}
	}

	// Set the user ID in the session
	// Set user ID in session
	session.Values["user_id"] = user.ID

	// Set the role based on the username
	if user.Username == "admin" {
		session.Values["role"] = "admin"
	} else {
		session.Values["role"] = "user"
	}

	// Save the session and handle errors
	if err := session.Save(c.Request, c.Writer); err != nil {
		// Handle the error gracefully
		fmt.Println("Error saving session:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Logged in successfully"})
}

func Logout(c *gin.Context) {
	session, err := session_manager.Store.Get(c.Request, "session-name")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get session"})
		return
	}

	userID := session.Values["user_id"]

	if userID == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active user"})
		return
	}

	// Clear user ID and role from the session
	delete(session.Values, "user_id")
	delete(session.Values, "role")

	// Save the session and handle errors
	if err := session.Save(c.Request, c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session during logout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func DeleteAccount(c *gin.Context) {
	var input models.Input
	if err := c.ShouldBindJSON(&input); err != nil {
		logrus.WithError(err).Error("Invalid request payload")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		logrus.WithError(err).Error("Validation error")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	result := models.DB.Where("email = ?", input.Email).First(&user)
	if result.Error != nil {
		logrus.WithError(result.Error).Error("User not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		logrus.WithError(err).Error("Invalid password")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	if user.IsDeleted {
		logrus.Warn("Account has already been deleted")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account has already been deleted"})
		return
	}

	// Update user properties
	user.IsDeleted = true
	user.IsActive = false

	// Save the changes
	result = models.DB.Save(&user)
	if result.Error != nil {
		logrus.WithError(result.Error).Error("Failed to delete account")
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error})
		return
	}

	logrus.Info("Account is successfully deleted")
	c.JSON(http.StatusOK, gin.H{"message": "Account is successfully deleted"})
}
