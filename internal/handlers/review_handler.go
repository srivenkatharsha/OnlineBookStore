/*
   review_handler.go contains HTTP request handlers for managing book reviews in a bookstore.
   These handlers include functionality for retrieving reviews for a book by ISBN and posting reviews.
*/

package handlers

import (
	"bookstore/internal/models"
	"bookstore/internal/session_manager"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func InitializeReviewRoutes(router *gin.Engine) {
	router.GET("/api/getReview/:isbn", GetReviewByISBN)
	router.POST("/api/post-review/:isbn", PostReview)
}

func GetReviewByISBN(c *gin.Context) {
	isbn := c.Param("isbn")

	var book models.Book
	if err := models.DB.Where("isbn = ?", isbn).Preload("Reviews").First(&book).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	reviewDetails := []gin.H{}
	for _, review := range book.Reviews {
		var user models.User
		if err := models.DB.Where("id = ?", review.UserID).First(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
			return
		}

		reviewDetails = append(reviewDetails, gin.H{
			"userName":  user.Username,
			"rating":    review.Rating,
			"comment":   review.Comment,
			"createdAt": review.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, reviewDetails)
}

func PostReview(c *gin.Context) {
	isbn := c.Param("isbn")
	book, err := models.GetBookByISBN(isbn)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	session, _ := session_manager.Store.Get(c.Request, "session-name")
	userID := session.Values["user_id"].(uint)

	var input models.Review
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create the review
	review := models.Review{
		BookID:    book.ID,
		UserID:    userID,
		Rating:    input.Rating,
		Comment:   input.Comment,
		CreatedAt: time.Now(),
	}

	err = models.DB.Create(&review).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to post review"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Review posted successfully"})
}
