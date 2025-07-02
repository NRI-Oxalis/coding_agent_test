// Game state
let gameState = {
    board: ["", "", "", "", "", "", "", "", ""],
    currentTurn: "○",
    winner: "",
    gameOver: false
};

// Make a move
async function makeMove(position) {
    if (gameState.gameOver || gameState.board[position] !== "") {
        return;
    }
    
    try {
        const response = await fetch('/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `position=${position}`
        });
        
        if (response.ok) {
            gameState = await response.json();
            updateUI();
        } else {
            console.error('Failed to make move');
        }
    } catch (error) {
        console.error('Error making move:', error);
    }
}

// Reset the game
async function resetGame() {
    try {
        const response = await fetch('/reset', {
            method: 'POST'
        });
        
        if (response.ok) {
            gameState = await response.json();
            updateUI();
        } else {
            console.error('Failed to reset game');
        }
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

// Update the UI based on game state
function updateUI() {
    // Update board
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = gameState.board[index];
        
        // Add/remove disabled class
        if (gameState.gameOver || gameState.board[index] !== "") {
            cell.classList.add('disabled');
        } else {
            cell.classList.remove('disabled');
        }
    });
    
    // Update turn indicator
    const currentTurnElement = document.getElementById('current-turn');
    currentTurnElement.textContent = gameState.currentTurn;
    
    // Update game status
    const gameStatusElement = document.getElementById('game-status');
    const turnIndicatorElement = document.getElementById('turn-indicator');
    
    if (gameState.gameOver) {
        if (gameState.winner === "draw") {
            gameStatusElement.textContent = "引き分けです！";
            gameStatusElement.className = "draw";
            turnIndicatorElement.style.display = "none";
        } else {
            gameStatusElement.textContent = `${gameState.winner} の勝利です！`;
            gameStatusElement.className = "winner";
            turnIndicatorElement.style.display = "none";
        }
    } else {
        gameStatusElement.textContent = "";
        gameStatusElement.className = "";
        turnIndicatorElement.style.display = "block";
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/state');
        if (response.ok) {
            gameState = await response.json();
            updateUI();
        }
    } catch (error) {
        console.error('Error loading game state:', error);
    }
});