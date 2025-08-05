let gameState ={
    board: Array(9). fill (''),
    currentPlayer: 'X',
    gameMode: 'human', //'human'or 'computer'
    gameActive: true ,
    scores: { X: 0, O:0 , draws:0}
};

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

 // DOM Elements
const preloader = document.getElementById('preloader');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const themeToggle = document.getElementById('themeToggle');
const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const modeButtons = document.querySelectorAll('.mode-btn');
const newGameBtn = document.getElementById('newGameBtn');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {showPreloader();});

// Preloader functionality
function showPreloader() {
let progress = 0;
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
            
const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
if (progress > 100) progress = 100;
                
progressBar.style.width = progress + '%';
progressText.textContent = `Loading... ${Math.floor(progress)}%`;

 if (progress >= 100) {
    clearInterval(interval);
    setTimeout(() => {
    preloader.classList.add('hide');
    setTimeout(() => {gameScreen.classList.add('active');
    initializeGame();}, 500);}, 800);
}}, 100);
}
// Initialize game functionality
function initializeGame() {
    setupEventListeners();
    updateDisplay();
    createBackgroundDecorations();
}
 
// Setup event listeners
function setupEventListeners() {
// Theme toggle
themeToggle.addEventListener('click', toggleTheme);
            
// Mode selection
modeButtons.forEach(btn => {
btn.addEventListener('click', () => selectGameMode(btn.dataset.mode));});
// Game board
cells.forEach(cell => {cell.addEventListener('click', () => handleCellClick(cell));});
            
// Control buttons
newGameBtn.addEventListener('click', startNewGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', playAgain);
backToMenuBtn.addEventListener('click', backToMenu);
}

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const themeIcon = themeToggle.querySelector('.theme-icon');
            
    body.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
            
// Save theme preference
localStorage.setItem('theme', newTheme);
}
// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeIcon = themeToggle.querySelector('.theme-icon');
            
document.body.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

// Game mode selection
function selectGameMode(mode) {
gameState.gameMode = mode;
modeButtons.forEach(btn => btn.classList.remove('active'));
document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
            
resetGame();
updateDisplay();
}

 // Handle cell click
function handleCellClick(cell) {
    const index = parseInt(cell.dataset.index);
            
    if (gameState.board[index] !== '' || !gameState.gameActive) return;
            
makeMove(index, gameState.currentPlayer);
            
    if (gameState.gameMode === 'computer' && gameState.gameActive && gameState.currentPlayer === 'O') {
setTimeout(() => { makeComputerMove();}, 500);
  }
}

// Make a move
function makeMove(index, player) {
gameState.board[index] = player;
const cell = document.querySelector(`[data-index="${index}"]`);
            
    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'cell-enter');
            
    if (checkWinner()) {
    endGame(player);
    } else if (gameState.board.every(cell => cell !== '')) {
    endGame('draw');
    } else {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();
    }
}

// Computer AI move
function makeComputerMove() {
    if (!gameState.gameActive) return;
            
// Simple AI: Try to win, block player, or pick random
    let bestMove = findBestMove();
            
    if (bestMove !== -1) {
    makeMove(bestMove, 'O');
    }
}
// Find best move for computer
function findBestMove() {
// Check if computer can win
for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === '') {
    gameState.board[i] = 'O';
    if (checkWinnerForPlayer('O')) {
    gameState.board[i] = '';
    return i;
}
    gameState.board[i] = '';
    }
}
            
// Check if need to block player
for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === '') {
    gameState.board[i] = 'X';
    if (checkWinnerForPlayer('X')) {
    gameState.board[i] = '';
    return i;
    }
    gameState.board[i] = '';
}
}
            
// Take center if available
if (gameState.board[4] === '') return 4;
            
// Take corners
const corners = [0, 2, 6, 8];
const availableCorners = corners.filter(i => gameState.board[i] === '');
    if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
}
            
// Take any available space
const availableMoves = gameState.board
.map((cell, index) => cell === '' ? index : null)
.filter(index => index !== null);
            
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
}

// Check winner
function checkWinner() {
return checkWinnerForPlayer(gameState.currentPlayer);
}

function checkWinnerForPlayer(player) {
return winningCombinations.some(combination => {
return combination.every(index => gameState.board[index] === player);});
}

// End game
function endGame(winner) {
gameState.gameActive = false;
            
if (winner === 'draw') {
    gameState.scores.draws++;
    showResult('draw', 'It\'s a Draw!', 'Great game! Nobody wins this time.', '🤝');
} else {
    gameState.scores[winner]++;
    highlightWinningCells(winner);
                
if (gameState.gameMode === 'computer') {
    if (winner === 'X') {
    showResult('win', 'You Win!', 'Congratulations! You beat the computer!', '🎉');
    createWinDecorations();
} else {
    showResult('lose', 'You Lose!', 'Computer wins this time. Try again!', '😢');
    createLoseDecorations();
}
} else {
    showResult('win', `Player ${winner} Wins!`, `Congratulations Player ${winner}!`, '🎉');
    createWinDecorations();
        }
    }
}

// Highlight winning cells
function highlightWinningCells(winner) {
winningCombinations.forEach(combination => {
    if (combination.every(index => gameState.board[index] === winner)) {
    combination.forEach(index => {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.classList.add('winning');
          });
        }
    });
}

// Show result screen
function showResult(type, title, message, animation) {
const resultAnimation = document.getElementById('resultAnimation');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
            
    resultAnimation.textContent = animation;
    resultTitle.textContent = title;
    resultTitle.className = `result-title ${type}`;
    resultMessage.textContent = message;
            
setTimeout(() => {
resultScreen.classList.add('active');}, 1000);
}

// Create background decorations
function createBackgroundDecorations() {

// Remove existing decorations
document.querySelectorAll('.bg-decoration').forEach(el => el.remove());
}

function createWinDecorations() {
const decorations = ['🎉', '🏆', '⭐', '🎊', '✨'];
            
for (let i = 0; i < 15; i++) {
const decoration = document.createElement('div');
decoration.className = 'bg-decoration win-decoration';
decoration.textContent = decorations[Math.floor(Math.random() * decorations.length)];
decoration.style.left = Math.random() * 100 + '%';
decoration.style.top = Math.random() * 100 + '%';
decoration.style.animationDelay = Math.random() * 2 + 's';
decoration.style.animationDuration = (Math.random() * 3 + 3) + 's';
                
document.body.appendChild(decoration);
    }
}
function createLoseDecorations() {
const decorations = ['😢', '😞', '💔', '😔', '😿'];
            
    for (let i = 0; i < 10; i++) {
        const decoration = document.createElement('div');
        decoration.className = 'bg-decoration lose-decoration';
        decoration.textContent = decorations[Math.floor(Math.random() * decorations.length)];
        decoration.style.left = Math.random() * 100 + '%';
        decoration.style.top = Math.random() * 100 + '%';
        decoration.style.animationDelay = Math.random() * 2 + 's';
        decoration.style.animationDuration = (Math.random() * 2 + 4) + 's';
                
document.body.appendChild(decoration);
    }
}

// Game control functions
function startNewGame() {
    resetGame();
    gameState.gameActive = true;
    updateDisplay();
}
function resetGame() {
    gameState.board = Array(9).fill('');
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
            
cells.forEach(cell => {
cell.textContent = '';
cell.className = 'cell'; });
            
gameBoard.classList.remove('board-shake');
createBackgroundDecorations();
updateDisplay();
}

function playAgain() {
resultScreen.classList.remove('active');
createBackgroundDecorations();
setTimeout(() => { resetGame(); }, 300);
}

function backToMenu() {
resultScreen.classList.remove('active');
createBackgroundDecorations();
setTimeout(() => { resetGame(); gameState.scores = { X: 0, O: 0, draws: 0 }; }, 300);
}

// Update display
function updateDisplay() {
const playerText = gameState.gameMode === 'computer' 
? (gameState.currentPlayer === 'X' ? 'Your Turn' : 'Computer Turn'): `Player ${gameState.currentPlayer}`;
            
currentPlayerDisplay.textContent = playerText;
            
if (gameState.gameActive) {
    statusText.textContent = gameState.gameMode === 'computer'? (gameState.currentPlayer === 'X' ? 'Your move!' : 'Computer is thinking...'): `${gameState.currentPlayer}'s turn`;
} else {
    statusText.textContent = 'Game Over';}
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
if (e.key === 'r' || e.key === 'R') {
    if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetGame();
    }
}
            
            if (e.key === 'n' || e.key === 'N') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    startNewGame();
                }
            }
            
            if (e.key === 't' || e.key === 'T') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleTheme();
                }
            }
            
            // Number keys for cell selection
            if (e.key >= '1' && e.key <= '9' && gameState.gameActive) {
                const cellIndex = parseInt(e.key) - 1;
                const cell = document.querySelector(`[data-index="${cellIndex}"]`);
                if (cell && gameState.board[cellIndex] === '') {
                    handleCellClick(cell);
                }
            }
        });

        // Handle window focus for computer moves
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && gameState.gameMode === 'computer' 
                && gameState.gameActive && gameState.currentPlayer === 'O') {
                setTimeout(() => {
                    makeComputerMove();
                }, 500);
            }
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Initialize theme on load
        window.addEventListener('load', () => {
            loadTheme();
        });

        // Add smooth animations for better UX
        function addCellClickEffect(cell) {
            cell.style.transform = 'scale(0.95)';
            setTimeout(() => {
                cell.style.transform = 'scale(1)';
            }, 150);
        }

        // Enhanced cell click with visual feedback
        cells.forEach(cell => {
            cell.addEventListener('mousedown', () => {
                if (gameState.board[parseInt(cell.dataset.index)] === '' && gameState.gameActive) {
                    addCellClickEffect(cell);
                }
            });
        });

        // Sound effects (optional - using Web Audio API)
        function playSound(type) {
            if (!window.AudioContext && !window.webkitAudioContext) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            let frequency;
            let duration;
            
            switch(type) {
                case 'click':
                    frequency = 800;
                    duration = 0.1;
                    break;
                case 'win':
                    frequency = 1000;
                    duration = 0.3;
                    break;
                case 'lose':
                    frequency = 300;
                    duration = 0.5;
                    break;
                default:
                    return;
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }

        // Add sound to moves
        const originalMakeMove = makeMove;
        makeMove = function(index, player) {
            playSound('click');
            return originalMakeMove(index, player);
        };

        // Add sound to game end
        const originalEndGame = endGame;
        endGame = function(winner) {
            if (winner === 'draw') {
                playSound('lose');
            } else if (gameState.gameMode === 'computer') {
                playSound(winner === 'X' ? 'win' : 'lose');
            } else {
                playSound('win');
            }
            return originalEndGame(winner);
        };

        // Add particle effects for winning
        function createParticles() {
            if (!CSS.supports('(animation-timeline: scroll())')) return;
            
            const colors = ['#667eea', '#764ba2', '#00d4ff', '#4ade80'];
            
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    pointer-events: none;
                    z-index: 1000;
                    border-radius: 50%;
                    left: ${Math.random() * 100}vw;
                    top: ${Math.random() * 100}vh;
                    animation: particle-fall ${Math.random() * 3 + 2}s linear forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 5000);
            }
        }

        // Add particle animation CSS
        const particleStyle = document.createElement('style');
        particleStyle.textContent = `
            @keyframes particle-fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(particleStyle);

        // Enhanced winning effect
        const originalShowResult = showResult;
        showResult = function(type, title, message, animation) {
            if (type === 'win') {
                createParticles();
                
                // Screen flash effect
                const flash = document.createElement('div');
                flash.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(102, 126, 234, 0.3);
                    pointer-events: none;
                    z-index: 999;
                    animation: flash 0.5s ease-out;
                `;
                
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 500);
            }
            
            return originalShowResult(type, title, message, animation);
        };

        // Flash animation
        const flashStyle = document.createElement('style');
        flashStyle.textContent = `
            @keyframes flash {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(flashStyle);

        // Performance optimization - debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Handle responsive adjustments if needed
                updateDisplay();
            }, 250);
        });

        // Add accessibility features
        function addAccessibilityFeatures() {
            // Add ARIA labels
            cells.forEach((cell, index) => {
                cell.setAttribute('role', 'button');
                cell.setAttribute('aria-label', `Cell ${index + 1}`);
                cell.tabIndex = 0;
            });
            
            // Keyboard navigation for cells
            cells.forEach(cell => {
                cell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCellClick(cell);
                    }
                });
            });
            
            // Screen reader announcements
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.position = 'absolute';
            announcer.style.left = '-10000px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.style.overflow = 'hidden';
            document.body.appendChild(announcer);
            
            window.announceToScreenReader = (message) => {
                announcer.textContent = message;
            };
        }

        // Initialize accessibility features
        addAccessibilityFeatures();

        // Update announcements for moves
        const originalUpdateDisplay = updateDisplay;
        updateDisplay = function() {
            originalUpdateDisplay();
            
            if (window.announceToScreenReader) {
                const message = gameState.gameActive 
                    ? `${currentPlayerDisplay.textContent}'s turn`
                    : 'Game over';
                window.announceToScreenReader(message);
            }
        };

        // Persistence - save game state
        function saveGameState() {
            const stateToSave = {
                board: gameState.board,
                currentPlayer: gameState.currentPlayer,
                gameMode: gameState.gameMode,
                gameActive: gameState.gameActive,
                scores: gameState.scores
            };
            
            localStorage.setItem('ticTacToeState', JSON.stringify(stateToSave));
        }

        function loadGameState() {
            const savedState = localStorage.getItem('ticTacToeState');
            if (savedState) {
                try {
                    const parsedState = JSON.parse(savedState);
                    
                    // Only restore if game was in progress
                    if (parsedState.gameActive && parsedState.board.some(cell => cell !== '')) {
                        const shouldRestore = confirm('Found a saved game. Would you like to continue?');
                        if (shouldRestore) {
                            gameState = { ...gameState, ...parsedState };
                            
                            // Restore board visual state
                            cells.forEach((cell, index) => {
                                if (gameState.board[index]) {
                                    cell.textContent = gameState.board[index];
                                    cell.classList.add(gameState.board[index].toLowerCase());
                                }
                            });
                            
                            // Update mode selection
                            modeButtons.forEach(btn => btn.classList.remove('active'));
                            document.querySelector(`[data-mode="${gameState.gameMode}"]`).classList.add('active');
                            
                            updateDisplay();
                        }
                    }
                } catch (error) {
                    console.error('Error loading saved game:', error);
                }
            }
        }

        // Auto-save game state on moves
        const originalMakeMoveForSave = makeMove;
        makeMove = function(index, player) {
            const result = originalMakeMoveForSave(index, player);
            saveGameState();
            return result;
        };

        // Load saved game on initialization
        setTimeout(() => {
            loadGameState();
        }, 1000);

        // Clear saved state when game ends
        const originalEndGameForSave = endGame;
        endGame = function(winner) {
            localStorage.removeItem('ticTacToeState');
            return originalEndGameForSave(winner);
        };

        // Add help/tutorial functionality
        function showHelp() {
            const helpContent = `
                <div style="text-align: left; line-height: 1.6;">
                    <h3 style="margin-bottom: 15px; color: var(--primary-color);">How to Play:</h3>
                    <ul style="margin-bottom: 15px;">
                        <li>Click on any empty cell to place your mark</li>
                        <li>Get 3 in a row (horizontal, vertical, or diagonal) to win</li>
                        <li>Play against another human or the computer</li>
                    </ul>
                    
                    <h3 style="margin-bottom: 15px; color: var(--primary-color);">Keyboard Shortcuts:</h3>
                    <ul style="margin-bottom: 15px;">
                        <li><strong>1-9:</strong> Select cell by number</li>
                        <li><strong>Ctrl+R:</strong> Reset game</li>
                        <li><strong>Ctrl+N:</strong> New game</li>
                        <li><strong>Ctrl+T:</strong> Toggle theme</li>
                    </ul>
                    
                    <h3 style="margin-bottom: 15px; color: var(--primary-color);">Features:</h3>
                    <ul>
                        <li>Light/Dark theme toggle</li>
                        <li>Smart computer opponent</li>
                        <li>Auto-save game progress</li>
                        <li>Sound effects and animations</li>
                    </ul>
                </div>
            `;
            
// You could show this in a modal or alert
// For now, we'll use console.log for the help content
console.log('Tic-Tac-Toe Help:', helpContent);
}

// Add help button (optional)
const helpBtn = document.createElement('button');
helpBtn.textContent = '?';
helpBtn.className = 'theme-toggle';
helpBtn.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem; 
`;
helpBtn.addEventListener('click', showHelp);
document.querySelector('.game-container').appendChild(helpBtn);

// Final initialization
console.log('🎮 Tic-Tac-Toe Game Loaded Successfully!');
console.log('Features: Theme Toggle, AI Opponent, Auto-save, Sound Effects, Animations');
console.log('Use Ctrl+R to reset, Ctrl+N for new game, Ctrl+T to toggle theme');