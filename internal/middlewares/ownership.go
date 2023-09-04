/*This is a middleware whose main role is to ensure ownership positive enforcement to custom routes*/

package middlewares

import (
	"bookstore/internal/models"
	"bookstore/internal/session_manager"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CheckOwnershipStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		session, _ := session_manager.Store.Get(c.Request, "session-name")
		userID, exists := session.Values["user_id"].(uint)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		isbn := c.Param("isbn")
		ownsBook, err := models.HasUserBoughtBook(userID, isbn)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check ownership status"})
			c.Abort()
			return
		}

		if ownsBook {
			c.JSON(http.StatusOK, gin.H{"message": "Already bought"})
			c.Abort()
			return
		}

		c.Next()
	}
}
