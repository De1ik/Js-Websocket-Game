const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const utils = require("./server-game-code");

const app = express();
const httpPort = 8080;
const wsPort = 8082;
const games = {};


const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ port: wsPort });

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const mid = { x: 29, y: 29 };


function initializeGameState() {
    return {
        xSh: mid.x,
        ySh: mid.y,
        rSh: 0,
        missiles: [],
        lasers: [],
        score: 0,
        speed: 1000,
        counter: 0,
        max_score: 0,
        shipImgOption: "Ship 1"
    };
}


function broadcastGameList() {
    const gameListMessage = JSON.stringify({
        type: 'gameList',
        games: Object.keys(games),
    });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(gameListMessage);
        }
    });
}


wss.on('connection', (ws) => {
    let gameId = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'firstGame':
                gameId = createNewGame(ws);
                break;
            case 'newGame':
                startGame(data.gameId);
                break;
            case 'observe':
                observeGame(ws, data.gameIdObserver);
                break;
            case 'player':
                returnToPlayer(ws, data.gameId, data.gameIdObserver);
                break;
            // case 'action':
            //     if (gameId) handleAction(gameId, data.action);
            //     break;
            case 'restart':
                if (gameId) restartGame(gameId);
                break;
            case 'image':
                if (gameId) changeImage(data.gameId, data.shipImgOption);
                break;
        }
    });

    ws.on('close', () => {
        if (gameId) cleanupGame(ws, gameId);
    });
});


function changeImage(gameId, shipImgOption){
    games[gameId].gameState.shipImgOption = shipImgOption
}


function createNewGame(ws) {
    const gameId = uuidv4();
    games[gameId] = {
        gameState: initializeGameState(),
        ws: ws,
        observers: new Set(),
    };
    ws.send(JSON.stringify({ type: 'role', role: 'player', gameId }));
    broadcastGameList();
    return gameId;
}


function startGame(gameId) {
    if (games[gameId]) {
        utils.startGame(games[gameId]);
    }
}


function observeGame(ws, gameIdObserver) {
    if (games[gameIdObserver]) {
        games[gameIdObserver].observers.add(ws);
        ws.send(JSON.stringify({
            type: 'role',
            role: 'observer',
            gameState: games[gameIdObserver].gameState,
            gameId: gameIdObserver,
        }));
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
    }
}


function returnToPlayer(ws, gameId, gameIdObserver) {
    if (games[gameIdObserver]) {
        games[gameIdObserver].observers.delete(ws);
        ws.send(JSON.stringify({ type: 'back game', gameState: games[gameId].gameState, role: "player" }));
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
    }
}


// function handleAction(gameId, action) {
//     if (games[gameId]) {
//         // utils.updateGameState(games[gameId].gameState, action);
//         utils.broadcastGameState(games[gameId]);
//     }
// }


function restartGame(gameId) {
    if (games[gameId]) {
        utils.restartFunc(games[gameId], games[gameId].gameState);
        games[gameId].ws.send(JSON.stringify({ type: 'success-restart' }));
    }
}


function cleanupGame(ws, gameId) {
    if (games[gameId]) {
        games[gameId].observers.delete(ws);
        if (games[gameId].observers.size === 0 && games[gameId].ws === ws) {
            delete games[gameId];
            broadcastGameList();
        }
    }
}


app.post('/keys-pressed', (req, res) => {
    const { type, gameId, key } = req.body;
    const room = games[gameId];

    if (room && room.gameState) {
        if (type === 'move') {
            if (key === 'KeyJ' || key === 'ArrowLeft') {
                room.gameState.rSh = utils.rotateShip(-1, room.gameState.rSh);
            } else if (key === 'KeyL' || key === 'ArrowRight') {
                room.gameState.rSh = utils.rotateShip(1, room.gameState.rSh);
            } else if (key === 'Space') {
                utils.addLaser(room.gameState.lasers, room.gameState.rSh);
            }
            utils.broadcastGameState(room);

            res.json({ message: 'Key press processed successfully', state: room.gameState });
        } else {
            res.status(400).json({ error: 'Invalid action type' });
        }
    } else {
        console.log("ERROR: Player not found");
        res.status(404).json({ error: 'Player not found' });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(httpPort, () => {
    console.log(`Server is running on: http://localhost:${httpPort}`);
});
