package models

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() (*gorm.DB, error) {
	dbUsername := os.Getenv("DB_USERNAME")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbTimeZone := os.Getenv("DB_TIME_ZONE")

	dsn := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable TimeZone=%s",
		dbUsername, dbPassword, dbName, dbHost, dbPort, dbTimeZone)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
		return nil, err
	}

	DB = db

	// Auto Migrate the models to create/update tables
	err = DB.AutoMigrate(&User{})
	err = DB.AutoMigrate(&Book{})
	err = DB.AutoMigrate(&Review{})
	err = DB.AutoMigrate(&Balance{})
	err = DB.AutoMigrate(&Transaction{})
	err = DB.AutoMigrate(&BookDownload{})
	if err != nil {
		log.Fatalf("Error auto migrating database: %v", err)
		return nil, err
	}
	return db, nil
}
