const socket = io();
const boardEl = document.getElementById('board');
const infoEl = document.getElementById('info');

let mySymbol = null;

socket.on('player-info', (players) => {
    for (let symbol in players) {
        if (players[symbol] === socket.id) {
            mySymbol = symbol;
            infoEl.textContent = `Bạn là người chơi ${mySymbol}`;
        }
    }
});

function render(board, currentPlayer, winner) {
    boardEl.innerHTML = '';
    board.forEach((val, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = val || '';
        cell.onclick = () => socket.emit('make-move', idx);
        boardEl.appendChild(cell);
    });

    if (winner) {
        if (winner === 'draw') infoEl.textContent = 'Hòa!';
        else infoEl.textContent = `Người chơi ${winner} thắng!`;
    } else {
        infoEl.textContent += ` | Đến lượt: ${currentPlayer}`;
    }
}

socket.on('game-state', ({ board, currentPlayer, winner }) => {
    render(board, currentPlayer, winner);
});
