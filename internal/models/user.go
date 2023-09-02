// models/user.go

package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primary_key"`
	Username  string    `gorm:"unique;not null"`
	Email     string    `gorm:"unique;not null"`
	Password  string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time
	IsActive  bool `gorm:"default:true"`
	IsDeleted bool `gorm:"default:false"`
}

type Input struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}
