package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

// Game represents the Tic-Tac-Toe game state
type Game struct {
	Board       [9]string `json:"board"`
	CurrentTurn string    `json:"currentTurn"`
	Winner      string    `json:"winner"`
	GameOver    bool      `json:"gameOver"`
}

var game Game

// Initialize the game
func initGame() {
	game = Game{
		Board:       [9]string{"", "", "", "", "", "", "", "", ""},
		CurrentTurn: "○",
		Winner:      "",
		GameOver:    false,
	}
}

// Check if there's a winner
func checkWinner() string {
	board := game.Board
	
	// Check rows
	for i := 0; i < 9; i += 3 {
		if board[i] != "" && board[i] == board[i+1] && board[i+1] == board[i+2] {
			return board[i]
		}
	}
	
	// Check columns
	for i := 0; i < 3; i++ {
		if board[i] != "" && board[i] == board[i+3] && board[i+3] == board[i+6] {
			return board[i]
		}
	}
	
	// Check diagonals
	if board[0] != "" && board[0] == board[4] && board[4] == board[8] {
		return board[0]
	}
	if board[2] != "" && board[2] == board[4] && board[4] == board[6] {
		return board[2]
	}
	
	// Check for draw
	allFilled := true
	for _, cell := range board {
		if cell == "" {
			allFilled = false
			break
		}
	}
	if allFilled {
		return "draw"
	}
	
	return ""
}

// Handle the main page
func handleHome(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		log.Printf("Error parsing template: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	
	err = tmpl.Execute(w, game)
	if err != nil {
		log.Printf("Error executing template: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

// Handle game moves
func handleMove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	positionStr := r.FormValue("position")
	position, err := strconv.Atoi(positionStr)
	if err != nil || position < 0 || position > 8 {
		http.Error(w, "Invalid position", http.StatusBadRequest)
		return
	}
	
	// Check if game is over or position is occupied
	if game.GameOver || game.Board[position] != "" {
		http.Error(w, "Invalid move", http.StatusBadRequest)
		return
	}
	
	// Make the move
	game.Board[position] = game.CurrentTurn
	
	// Check for winner
	winner := checkWinner()
	if winner != "" {
		game.Winner = winner
		game.GameOver = true
	} else {
		// Switch turns
		if game.CurrentTurn == "○" {
			game.CurrentTurn = "×"
		} else {
			game.CurrentTurn = "○"
		}
	}
	
	// Return game state as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(game)
}

// Handle game reset
func handleReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	initGame()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(game)
}

// Handle getting current game state
func handleGameState(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(game)
}

func main() {
	// Initialize game
	initGame()
	
	// Serve static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	
	// Route handlers
	http.HandleFunc("/", handleHome)
	http.HandleFunc("/move", handleMove)
	http.HandleFunc("/reset", handleReset)
	http.HandleFunc("/state", handleGameState)
	
	log.Println("Starting Tic-Tac-Toe server on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}