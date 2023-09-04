/*This is a middleware whose main role is to ensure admin only restriction to custom routes*/

package middlewares

import (
	"bookstore/internal/session_manager"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		session, _ := session_manager.Store.Get(c.Request, "session-name")
		role, exists := session.Values["role"]
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
			c.Abort()
			return
		}
		session.Save(c.Request, c.Writer)
		c.Next()
	}
}
