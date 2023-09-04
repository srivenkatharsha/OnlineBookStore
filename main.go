package main

import (
	"bookstore/internal/models"
	"bufio"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"bookstore/internal/handlers"

	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
)

// Checks whether admin user exists in the db (if not enforces the developer to create one)
func checkAdmin(db *gorm.DB) {
	var admin models.User
	result := db.Where("username = ?", "admin").First(&admin)

	if result.RowsAffected == 0 {
		reader := bufio.NewReader(os.Stdin)

		fmt.Println("Admin user does not exist. Let's create one.")
		fmt.Print("Enter admin's email: ")
		email, _ := reader.ReadString('\n')
		email = strings.TrimSpace(email)

		fmt.Print("Enter admin's password: ")
		password, _ := reader.ReadString('\n')
		password = strings.TrimSpace(password)

		fmt.Print("Confirm admin's password: ")
		confirmPassword, _ := reader.ReadString('\n')
		confirmPassword = strings.TrimSpace(confirmPassword)

		if password != confirmPassword {
			fmt.Println("Passwords do not match. Aborting.")
			return
		}

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Println("Failed to hash password. Aborting.")
			return
		}

		// Create the admin user
		admin = models.User{
			Username: "admin",
			Email:    email,
			Password: string(hashedPassword),
		}

		if err := db.Create(&admin).Error; err != nil {
			fmt.Println("Failed to create admin user:", err)
			return
		}

		fmt.Println("Admin user created successfully. use [admin] (without square brackets) username to sign in as admin. ")
	} else {
		fmt.Println("Admin user already exists.")
	}
}

// setting up the routes
func run() {

	// Initialize the Gin router
	router := gin.Default()
	// Set up CORS middleware to allow any origin

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{os.Getenv("REACT_APP_FRONTEND")}
	config.AllowCredentials = true

	router.Use(cors.New(config))

	//Configuring all the defined routes
	handlers.InitializeRoutes(router)
	handlers.InitializeBookRoutes(router)
	handlers.InitializeAdminRoutes(router)
	handlers.InitializeReviewRoutes(router)
	handlers.InitializeTransactionRoutes(router)

	// Get the port from the environment variable
	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "8080" // Default port
	}

	// Start the HTTP server
	port := ":" + appPort
	logrus.Infof("Starting the server on port %s", port)
	if err := http.ListenAndServe(port, router); err != nil {
		logrus.WithError(err).Fatal("Error starting the server")
	}
}

func main() {

	// Load the .env file from the parent directory
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
		return
	}

	// Get log file name from environment variable
	logFileName := os.Getenv("LOG_FILENAME")
	if logFileName == "" {
		logFileName = "app.log" // Default log file name
	}

	// Combine relative path with log file name
	logFilePath := filepath.Join("..", logFileName)

	// Get max size from environment variable
	logFileMaxSizeStr := os.Getenv("LOG_FILE_MAXSIZE")
	logFileMaxSize, err := strconv.Atoi(logFileMaxSizeStr)
	if err != nil {
		logFileMaxSize = 10 // Default max Size
	}

	// Get max age from environment variable
	logFileMaxAgeStr := os.Getenv("LOG_FILE_MAXAGE")
	logFileMaxAge, err := strconv.Atoi(logFileMaxAgeStr)
	if err != nil {
		logFileMaxAge = 7 // Default max age
	}

	// Get max backups from environment variable
	logFileMaxBackupsStr := os.Getenv("LOG_FILE_MAXSIZE")
	logFileMaxBackups, err := strconv.Atoi(logFileMaxBackupsStr)
	if err != nil {
		logFileMaxBackups = 3 // Default max Backups
	}

	// Configure log rotation
	logFile := &lumberjack.Logger{
		Filename:   logFilePath,
		MaxSize:    logFileMaxSize,    // Max size in megabytes before rotation
		MaxBackups: logFileMaxBackups, // Max number of old log files to retain
		MaxAge:     logFileMaxAge,     // Max days to retain log files
	}

	// Set up logrus with custom output and JSON formatting
	logrus.SetOutput(logFile)
	logrus.SetFormatter(&logrus.JSONFormatter{})

	// Initialize the database
	_, db_err := models.InitDB()
	if db_err != nil {
		logrus.WithError(db_err).Fatal("Error initializing database")
	}

	checkAdmin(models.DB) // enforcing admin account
	run()

}
