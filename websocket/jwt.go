package main

import (
	"os"

	"github.com/golang-jwt/jwt/v5"
)

var JWT_SECRET string = os.Getenv("JWT_SECRET")

func ValidateJWT(tokenString string) (string, error) {

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(JWT_SECRET), nil
	})

	if err != nil || !token.Valid {
		return "", err
	}

	claims := token.Claims.(jwt.MapClaims)

	userId := claims["sub"].(string)

	return userId, nil
}
