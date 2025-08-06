let board = Array(9).fill(null);
let currentPlayer = 'X';
let playerSymbol = '';
let aiSymbol = '';
let difficulty = 'easy';
let gameOver = false;

function selectDifficulty(level) {
  difficulty = level;
  document.getElementById("difficulty-selection").style.display = "none";
  document.getElementById("symbol-selection").style.display = "block";
}

function selectSymbol(symbol) {
  playerSymbol = symbol;
  aiSymbol = symbol === 'X' ? 'O' : 'X';
  currentPlayer = 'X';
  document.getElementById("symbol-selection").style.display = "none";
  document.getElementById("game-container").style.display = "block";

  createBoard();
  if (aiSymbol === 'X') {
    aiMove();
  }
}

function createBoard() {
  const boardDiv = document.getElementById("game-board");
  boardDiv.innerHTML = "";
  board = Array(9).fill(null);
  gameOver = false;
  document.getElementById("game-status").innerText = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handlePlayerMove);
    boardDiv.appendChild(cell);
  }
}

function handlePlayerMove(e) {
  const idx = e.target.dataset.index;
  if (gameOver || board[idx] !== null || currentPlayer !== playerSymbol) return;

  board[idx] = playerSymbol;
  e.target.innerText = playerSymbol;
  currentPlayer = aiSymbol;

  if (checkWinner(board, playerSymbol)) {
    endGame(`${playerSymbol} thắng!`);
    return;
  }

  if (board.every(cell => cell !== null)) {
    endGame("Hòa!");
    return;
  }

  setTimeout(aiMove, 300);
}

function aiMove() {
  if (gameOver) return;

  const idx = getAIMove();
  if (idx === -1) return;

  board[idx] = aiSymbol;
  document.querySelectorAll(".cell")[idx].innerText = aiSymbol;
  currentPlayer = playerSymbol;

  if (checkWinner(board, aiSymbol)) {
    endGame(`${aiSymbol} thắng!`);
    return;
  }

  if (board.every(cell => cell !== null)) {
    endGame("Hòa!");
    return;
  }
}

function getAIMove() {
  // 1. Thử thắng
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiSymbol;
      if (checkWinner(board, aiSymbol)) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 2. Chặn người chơi
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = playerSymbol;
      if (checkWinner(board, playerSymbol)) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 3. Chiến thuật theo độ khó
  if (difficulty === 'hard') {
    return minimax(board, aiSymbol).index;
  } else if (difficulty === 'medium') {
    if (Math.random() < 0.6) return minimax(board, aiSymbol).index;
  }

  // 4. Random
  const empty = board.map((val, i) => val === null ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(i => i !== null);

  if (checkWinner(newBoard, playerSymbol)) return { score: -10 };
  if (checkWinner(newBoard, aiSymbol)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    const result = minimax(newBoard, player === aiSymbol ? playerSymbol : aiSymbol);
    move.score = result.score;

    newBoard[availSpots[i]] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === aiSymbol) {
    let bestScore = -Infinity;
    for (let m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }

  return bestMove;
}

function checkWinner(b, symbol) {
  const winCombos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return winCombos.some(combo => combo.every(i => b[i] === symbol));
}

function endGame(msg) {
  gameOver = true;
  document.getElementById("game-status").innerText = msg;
}

function restartGame() {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("symbol-selection").style.display = "none";
  document.getElementById("difficulty-selection").style.display = "block";
}
