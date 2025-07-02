// Game state
let gameState = {
    board: ["", "", "", "", "", "", "", "", ""],
    currentTurn: "dog",
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
        const cellValue = gameState.board[index];
        
        // Clear existing classes
        cell.className = 'cell';
        cell.textContent = '';
        
        // Apply appropriate class and content based on cell value
        if (cellValue === 'dog') {
            cell.classList.add('dog');
        } else if (cellValue === 'cat') {
            cell.classList.add('cat');
        }
        
        // Add/remove disabled class
        if (gameState.gameOver || cellValue !== "") {
            cell.classList.add('disabled');
        }
    });
    
    // Update turn indicator
    const currentTurnElement = document.getElementById('current-turn');
    currentTurnElement.className = ''; // Clear existing classes
    if (gameState.currentTurn === 'dog') {
        currentTurnElement.textContent = '🐶';
        currentTurnElement.classList.add('turn-dog');
    } else {
        currentTurnElement.textContent = '🐱';
        currentTurnElement.classList.add('turn-cat');
    }
    
    // Update game status
    const gameStatusElement = document.getElementById('game-status');
    const turnIndicatorElement = document.getElementById('turn-indicator');
    
    if (gameState.gameOver) {
        if (gameState.winner === "draw") {
            gameStatusElement.textContent = "引き分けです！";
            gameStatusElement.className = "draw";
            turnIndicatorElement.style.display = "none";
        } else {
            const winnerText = gameState.winner === 'dog' ? '🐶' : '🐱';
            gameStatusElement.textContent = `${winnerText} の勝利です！`;
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