// Consists database models and helper function for books

package models

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	ID        uint      `gorm:"primary_key"`
	BookID    uint      `gorm:"not null"` // Foreign key referencing the book
	UserID    uint      `gorm:"not null"`
	Rating    int       `gorm:"not null"`
	Comment   string    `gorm:"type:text"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
}

type Book struct {
	gorm.Model
	Title         string   `json:"title" gorm:"not null"`
	Author        string   `json:"author" gorm:"not null"`
	Description   string   `json:"description"`
	ISBN          string   `json:"isbn" gorm:"unique;not null"`
	PublishedYear int      `json:"published_year"`
	Price         float64  `json:"price"`
	Reviews       []Review // One-to-many relationship with reviews
	// BookDownload  BookDownload `gorm:"foreignkey:ISBN"`
}

type BookDownload struct {
	ISBN         string `gorm:"not null"` // Using ISBN as primary key
	DownloadLink string `gorm:"not null"`
}

type BookInput struct {
	Title         string  `json:"title" binding:"required"`
	Author        string  `json:"author" binding:"required"`
	Description   string  `json:"description"`
	ISBN          string  `json:"isbn" binding:"required"`
	PublishedYear int     `json:"published_year"`
	Price         float64 `json:"price" binding:"required"`
	DownloadLink  string  `json:"download_link" binding:"required"`
}

// helper functions

func GetAllBooks() ([]Book, error) {
	var books []Book
	err := DB.Find(&books).Error
	if err != nil {
		return nil, err
	}
	return books, nil
}

func GetBookByID(bookID int) (Book, error) {
	var book Book
	err := DB.First(&book, bookID).Error
	if err != nil {
		return Book{}, err
	}
	return book, nil
}

func GetBookByISBN(isbn string) (Book, error) {
	var book Book
	if err := DB.Where("isbn = ?", isbn).First(&book).Error; err != nil {
		return book, err
	}
	return book, nil
}

func GetBookDownloadByISBN(isbn string) (*BookDownload, error) {
	var bookDownload BookDownload
	err := DB.Where("isbn = ?", isbn).First(&bookDownload).Error
	if err != nil {
		return nil, err
	}
	return &bookDownload, nil
}
