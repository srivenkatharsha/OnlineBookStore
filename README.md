[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/LECuYE4o)

## Instructions

1. Install Go language.
2. Git clone the repo.
3. Modify the `.env` file in the root directory. (Note: set the correct DB_USERNAME & Password)
    * APP_PORT = 8080
    * DB_USERNAME = postgres
    * DB_PASSWORD = 123
    * DB_NAME = bookstoredb
    * DB_HOST = localhost
    * DB_PORT = 5432
    * DB_TIME_ZONE = Asia/Kolkata
    * SESSION_SECRET_KEY = your-secret-key
    * LOG_FILENAME = app.log
    * LOG_FILE_MAXSIZE = 10
    * LOG_FILE_MAXBACKUPS = 3
    * LOG_FILE_MAXAGE = 7
    * REACT_APP_FRONTEND = http://localhost:5173
4. Go to `frontend/bookstore` and modify the `.env` file.
    * VITE_REACT_APP_BACKEND_URL=http://localhost:8080
5. In the root directory, run the following commands:
    * `go get .`
    * `go mod tidy`
    * `go run .`
6. In a new terminal, navigate to `frontend/bookstore` and run the following command:
    * `npm i`
    * `npm run dev`
7. The application will be accessible at `localhost:5173`.

**Note:** Make sure that you have configured the `.env` files properly.

# App's images:
![Image1](github-images/1.png "Dashboard.")
![Image2](github-images/2.png "Homepage")
![Image3](github-images/3.png "Auth Page")

