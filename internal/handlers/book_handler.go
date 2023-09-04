/*
   book_handler.go contains HTTP request handlers for managing bookstore books.
   These handlers include functionality for fetching all books and retrieving details
   of a specific book by ID.
*/

package handlers

import (
	"bookstore/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func InitializeBookRoutes(router *gin.Engine) {
	router.GET("/api/books", GetBooks)
	router.GET("/api/books/:id", GetBookDetails)
}

func GetBooks(c *gin.Context) {
	// Get all books from the database
	books, err := models.GetAllBooks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch books"})
		return
	}

	c.JSON(http.StatusOK, books)
}

func GetBookDetails(c *gin.Context) {
	// Get the book ID from the URL parameter
	bookIDStr := c.Param("id")
	bookID, err := strconv.Atoi(bookIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid book ID"})
		return
	}

	// Get the book details from the database
	book, err := models.GetBookByID(bookID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	c.JSON(http.StatusOK, book)
}
