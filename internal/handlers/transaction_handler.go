/*
   transaction_handler.go contains HTTP request handlers for managing book transactions and ownership status in a bookstore.
   These handlers include functionality for buying books, checking balance, ownership status, and retrieving download links.
*/

package handlers

import (
	"bookstore/internal/middlewares"
	"bookstore/internal/models"
	"bookstore/internal/session_manager"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func InitializeTransactionRoutes(router *gin.Engine) {
	router.GET("/api/buy-book/:isbn", middlewares.CheckOwnershipStatus(), BuyBook)
	router.GET("/api/getBalance", GetBalance)
	router.GET("/api/ownershipStatus/:isbn", OwnershipStatus)
	router.GET("/api/getDownloadLink/:isbn", GetDownloadLink)
}

func BuyBook(c *gin.Context) {
	session, _ := session_manager.Store.Get(c.Request, "session-name")
	userID, exists := session.Values["user_id"].(uint)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	isbn := c.Param("isbn")
	book, err := models.GetBookByISBN(isbn)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	balance, err := models.GetBalanceByUserID(models.DB, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch balance"})
		return
	}

	if balance.Amount < book.Price {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient balance"})
		return
	}

	// Deduct the book price from the user's balance
	newBalance := balance.Amount - book.Price
	err = models.UpdateBalance(models.DB, userID, newBalance)
	if err != nil {
		logrus.WithError(err).Error("Failed to update balance")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
		return
	}

	// Record the transaction
	err = models.CreateTransaction(models.DB, userID, book.ID, book.Price)
	if err != nil {
		logrus.WithError(err).Error("Failed to create transaction")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Book purchased successfully"})
}

func GetBalance(c *gin.Context) {
	session, _ := session_manager.Store.Get(c.Request, "session-name")
	userID, exists := session.Values["user_id"].(uint)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	balance, err := models.GetBalanceByUserID(models.DB, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch balance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"balance": balance.Amount})
}

// OwnershipStatus handles the ownership status check for a user and a book
func OwnershipStatus(c *gin.Context) {
	// Get the user ID from the session
	session, err := session_manager.Store.Get(c.Request, "session-name")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get session"})
		return
	}

	userID, exists := session.Values["user_id"]
	if !exists || userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not logged in"})
		return
	}

	// Get the ISBN from the URL parameter
	isbn := c.Param("isbn")

	// Check if the user has bought the book with the given ISBN
	hasBought, err := models.HasUserBoughtBook(userID.(uint), isbn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check ownership"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": hasBought})
}

func GetDownloadLink(c *gin.Context) {
	session, _ := session_manager.Store.Get(c.Request, "session-name")
	userID, exists := session.Values["user_id"]
	if !exists || userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": false})
		return
	}

	isbn := c.Param("isbn")
	if isbn == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ISBN is required"})
		return
	}

	hasBought, err := models.HasUserBoughtBook(userID.(uint), isbn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check ownership"})
		return
	}

	if hasBought {
		bookDownload, err := models.GetBookDownloadByISBN(isbn)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch download link"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": bookDownload.DownloadLink})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": false})
	}
}
