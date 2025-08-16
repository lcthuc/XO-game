const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Giao diện public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/multiplayer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/multiplayer.html'));
});

app.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai.html'));
});

// Game logic
let players = {};
let board = Array(9).fill(null);
let currentPlayer = 'X';
let winner = null;

function checkWinner(b) {
    const win = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of win) {
        if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
    }
    return board.includes(null) ? null : 'draw';
}

io.on('connection', (socket) => {
    console.log(`Người chơi ${socket.id} đã kết nối`);

    // Gán X/O
    if (!players['X']) players['X'] = socket.id;
    else if (!players['O']) players['O'] = socket.id;

    // Gửi info cho cả 2
    io.emit('player-info', players);

    // Gửi trạng thái game
    io.emit('game-state', { board, currentPlayer, winner });

    socket.on('make-move', (index) => {
        if (winner || board[index] || players[currentPlayer] !== socket.id) return;

        board[index] = currentPlayer;
        winner = checkWinner(board);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        io.emit('game-state', { board, currentPlayer, winner });
    });

    socket.on('disconnect', () => {
        console.log(`Người chơi ${socket.id} đã thoát`);
        // Reset toàn bộ game
        players = {};
        board = Array(9).fill(null);
        currentPlayer = 'X';
        winner = null;
        io.emit('player-info', players);
        io.emit('game-state', { board, currentPlayer, winner });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
