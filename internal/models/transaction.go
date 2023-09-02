// models/transaction.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Balance struct {
	ID        uint      `gorm:"primary_key"`
	UserID    uint      `gorm:"not null"`
	Amount    float64   `gorm:"not null;default:0"` // The user's balance amount
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time
}

type Transaction struct {
	ID        uint      `gorm:"primary_key"`
	UserID    uint      `gorm:"not null"` // User who made the purchase
	BookID    uint      `gorm:"not null"` // Book that was purchased
	Amount    float64   `gorm:"not null"` // Amount paid for the book
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
}

// CreateTransaction creates a new transaction record
func CreateTransaction(db *gorm.DB, userID, bookID uint, amount float64) error {
	transaction := Transaction{
		UserID: userID,
		BookID: bookID,
		Amount: amount,
	}

	return db.Create(&transaction).Error
}

// GetTransactionsByUserID retrieves all transactions for a user
func GetTransactionsByUserID(db *gorm.DB, userID uint) ([]Transaction, error) {
	var transactions []Transaction
	err := db.Where("user_id = ?", userID).Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

// GetTransactionsByBookID retrieves all transactions for a book
func GetTransactionsByBookID(db *gorm.DB, bookID uint) ([]Transaction, error) {
	var transactions []Transaction
	err := db.Where("book_id = ?", bookID).Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

// CreateBalance creates a new balance record for a user
func CreateBalance(db *gorm.DB, userID uint, amount float64) error {
	balance := Balance{
		UserID: userID,
		Amount: amount,
	}

	return db.Create(&balance).Error
}

// GetBalanceByUserID retrieves a user's balance by their user ID
func GetBalanceByUserID(db *gorm.DB, userID uint) (*Balance, error) {
	var balance Balance
	err := db.Where("user_id = ?", userID).First(&balance).Error
	if err != nil {
		return nil, err
	}
	return &balance, nil
}

// UpdateBalance updates a user's balance
func UpdateBalance(db *gorm.DB, userID uint, newAmount float64) error {
	balance, err := GetBalanceByUserID(db, userID)
	if err != nil {
		return err
	}

	balance.Amount = newAmount
	return db.Save(&balance).Error
}

// HasUserBoughtBook checks if a user has bought a specific book by ISBN
func HasUserBoughtBook(userID uint, isbn string) (bool, error) {
	var transaction Transaction
	err := DB.Where("user_id = ? AND book_id IN (SELECT id FROM books WHERE isbn = ?)", userID, isbn).First(&transaction).Error
	if err == gorm.ErrRecordNotFound {
		return false, nil // User hasn't bought the book
	} else if err != nil {
		return false, err
	}
	return true, nil // User has bought the book
}
