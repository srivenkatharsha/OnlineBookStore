/*
   admin_handler.go contains HTTP request handlers for managing books in a bookstore.
   These handlers include functionality for creating, updating, and deleting books, and are
   protected by an admin-only middleware.
*/

package handlers

import (
	"bookstore/internal/middlewares"
	"bookstore/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func InitializeAdminRoutes(router *gin.Engine) {
	router.POST("/api/books/create-book", middlewares.AdminOnly(), CreateBook)
	router.PUT("/api/books/:isbn", middlewares.AdminOnly(), UpdateBook)
	router.DELETE("/api/books/:isbn", middlewares.AdminOnly(), DeleteBook)
}

func CreateBook(c *gin.Context) {
	// Check if the middleware halted the execution
	if c.IsAborted() {
		return
	}

	var bookInput models.BookInput
	if err := c.ShouldBindJSON(&bookInput); err != nil {
		logrus.WithError(err).Warn("Failed to bind JSON")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create the book record
	book := models.Book{
		Title:         bookInput.Title,
		Author:        bookInput.Author,
		Description:   bookInput.Description,
		ISBN:          bookInput.ISBN,
		PublishedYear: bookInput.PublishedYear,
		Price:         bookInput.Price,
	}

	err := models.DB.Create(&book).Error
	if err != nil {
		logrus.WithError(err).Error("Failed to create book")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book"})
		return
	}

	// Create the download link record
	downloadLink := models.BookDownload{
		ISBN:         bookInput.ISBN,
		DownloadLink: bookInput.DownloadLink,
	}

	err = models.DB.Create(&downloadLink).Error
	if err != nil {
		logrus.WithError(err).Error("Failed to add download link to BookDownload table")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book"})
		return
	}

	logrus.Info("Book created successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Book created successfully", "data": book})
}

func UpdateBook(c *gin.Context) {
	if c.IsAborted() {
		return
	}

	isbn := c.Param("isbn")

	var book models.Book

	// First, let's retrieve the existing book by ISBN
	if err := models.DB.Where("isbn = ?", isbn).First(&book).Error; err != nil {
		logrus.WithError(err).Warn("Book not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	// Bind the JSON data to the book variable
	var bookInput models.BookInput
	if err := c.ShouldBindJSON(&bookInput); err != nil {
		logrus.WithError(err).Warn("Failed to bind JSON")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update the book fields
	book.Title = bookInput.Title
	book.Author = bookInput.Author
	book.Description = bookInput.Description
	book.ISBN = bookInput.ISBN
	book.PublishedYear = bookInput.PublishedYear
	book.Price = bookInput.Price

	// Save the updated book information
	if err := models.DB.Save(&book).Error; err != nil {
		logrus.WithError(err).Error("Failed to update book")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book"})
		return
	}

	// Update the download link in the BookDownload table
	var bookDownload models.BookDownload
	if err := models.DB.Where("isbn = ?", isbn).First(&bookDownload).Error; err != nil {
		logrus.WithError(err).Warn("BookDownload entry not found, creating a new one")
		bookDownload = models.BookDownload{
			ISBN:         isbn,
			DownloadLink: bookInput.DownloadLink,
		}
		if err := models.DB.Create(&bookDownload).Error; err != nil {
			logrus.WithError(err).Error("Failed to create BookDownload entry")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create BookDownload entry"})
			return
		}
	} else {
		// If the BookDownload entry exists, update the download link
		if err := models.DB.Model(&models.BookDownload{}).Where("isbn = ?", isbn).Update("download_link", bookInput.DownloadLink).Error; err != nil {
			logrus.WithError(err).Error("Failed to update download link in BookDownload table")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update download link"})
			return
		}
	}

	logrus.Info("Book updated successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Book updated successfully", "data": book})
}

func DeleteBook(c *gin.Context) {
	if c.IsAborted() {
		return
	}

	isbn := c.Param("isbn")

	var book models.Book
	if err := models.DB.Where("isbn = ?", isbn).First(&book).Error; err != nil {
		logrus.WithError(err).Warn("Book not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	if err := models.DB.Delete(&book).Error; err != nil {
		logrus.WithError(err).Error("Failed to delete book")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete book"})
		return
	}

	logrus.Info("Book deleted successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Book deleted successfully"})
}
