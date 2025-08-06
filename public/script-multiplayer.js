const socket = io();
const boardEl = document.getElementById('board');
const infoEl = document.getElementById('info');

let mySymbol = null;
let isMyTurn = false;

socket.on('player-info', (players) => {
    for (let symbol in players) {
        if (players[symbol] === socket.id) {
            mySymbol = symbol;
            updateInfo(`Bạn là người chơi ${mySymbol}`);
        }
    }
});

socket.on('game-state', ({ board, currentPlayer, winner }) => {
    render(board);
    isMyTurn = currentPlayer === mySymbol;

    if (winner) {
        if (winner === 'draw') updateInfo('Hòa!');
        else updateInfo(`Người chơi ${winner} thắng!`);
    } else {
        if (mySymbol) {
            updateInfo(`Bạn là ${mySymbol}. ${isMyTurn ? 'Đến lượt bạn.' : 'Chờ đối thủ...'}`);
        } else {
            updateInfo('Đang chờ đối thủ tham gia...');
        }
    }
});

function render(board) {
    boardEl.innerHTML = '';
    board.forEach((val, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = val || '';
        cell.onclick = () => {
            if (!val && isMyTurn) {
                socket.emit('make-move', idx);
            }
        };
        boardEl.appendChild(cell);
    });
}

function updateInfo(msg) {
    infoEl.textContent = msg;
}
