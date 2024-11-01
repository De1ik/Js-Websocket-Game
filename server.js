const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const utils = require("./server-game-code");

const app = express();
const httpPort = 8080;
const wsPort = 8082;
const games = {};
const users = [];


const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ port: wsPort });

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // 3@3.2
const nameRegex = /^[a-zA-Z]+$/; // [a-zA-Z]

const mid = { x: 29, y: 29 };


function findUser(email, name) {
    return users.find(user => user.email === email) || users.find(user => user.name === name);
}



function initializeGameState(maxScore = 0) {
    return {
        xSh: mid.x,
        ySh: mid.y,
        rSh: 0,
        missiles: [],
        lasers: [],
        score: 0,
        speed: 1000,
        counter: 0,
        max_score: maxScore,
        shipImgOption: "Ship 1",
        isRun: false,
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

            case 'openGame':
                gameId = data.gameId || uuidv4()
                openGame(ws, gameId)
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
            case 'restart':
                if (gameId) restartGame(gameId);
                break;
            case 'image':
                if (gameId) changeImage(data.gameId, data.shipImgOption);
                break;
        }
    });

    ws.on('close', () => {
        // if (gameId) cleanupGame(ws, gameId);
    });
});


function changeImage(gameId, shipImgOption){
    games[gameId].gameState.shipImgOption = shipImgOption
}


function openGame(ws, gameId) {
    if (games[gameId]) {
        games[gameId].ws = ws
        ws.send(JSON.stringify({
            type: 'role',
            role: 'player',
            name: games[gameId].name,
            gameId: gameId,
            gameState: games[gameId].gameState,
            }));
    } else {
        const newGameState = initializeGameState();
        games[gameId] = {
            gameState: newGameState,
            ws: ws,
            observers: new Set(),
            name: null,
        };
        ws.send(JSON.stringify({ type: 'role', role: 'player', gameId, gameState: newGameState, name: games[gameId].name }));
    }
    broadcastGameList();
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


app.post('/register', async (req, res) => {
    const { email, name, password, gameId } = req.body;

    if (findUser(email, name)) {
        return res.status(400).json({ message: 'Email or name is already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ email: email, name: name, password: hashedPassword });
    games[gameId].name = name
    res.status(201).json({ success: true, message: 'Registration successful' });
});


app.post('/login', async (req, res) => {
    const { name, password, gameId } = req.body;

    if (!name || !password) {
        return res.status(400).json({ message: 'Name and password are required' });
    }

    const user = users.find(u => u.name === name);
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    games[gameId].name = name
    res.status(200).json({ success: true,  message: `Hello, ${user.name}!` });
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/get-users', (req, res) => {
    if (users) res.json(users.map(user => ({ email: user.email, name: user.name }))); 
});


app.delete('/delete-user', (req, res) => {
    const { name } = req.body;

    const userIndex = users.findIndex(user => user.name === name);

    if (userIndex !== -1) {
        users.splice(userIndex, 1); 
        res.json({ success: true, message: 'User deleted successfully' });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});


app.listen(httpPort, () => {
    console.log(`Server is running on: http://localhost:${httpPort}`);
});
