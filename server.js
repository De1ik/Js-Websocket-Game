const express = require('express');
const path = require('path');
const fs = require('fs');
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
app.use(express.text());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




function findUser(email, name) {
    return users.find(user => user.email === email) || users.find(user => user.name === name);
}



function initializeGameState(maxScore = 0) {
    return {
        xSh: 29,
        ySh: 29,
        rSh: 0,
        missiles: [],
        lasers: [],
        score: 0,
        speed: 1000,
        counter: 0,
        max_score: maxScore,
        max_speed: 1000,
        shipImgOption: "Ship 1",
        isRun: false,
    };
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
        }
    });

    ws.on('close', () => {
        // if (gameId) cleanupGame(ws, gameId);
    });
});

// app.post('/open-game', (req, res) => {
//     const { ws, gameId } = req.body;

//     openGame(ws, gameId)

//     res.json({ message: 'Key press processed successfully', state: room.gameState });
// });


// function changeImage(gameId, shipImgOption, name){
//     games[gameId].gameState.shipImgOption = shipImgOption
//     const user = users.find(u => u.name === name);
//     user.shipImgOption = shipImgOption
// }


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
    // broadcastGameList();
}


function startGame(gameId) {
    if (games[gameId]) {
        utils.startGame(games[gameId], users);
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


function restartGame(gameId) {
    if (games[gameId]) {
        utils.restartFunc(games[gameId], games[gameId].gameState, users);
        games[gameId].ws.send(JSON.stringify({ type: 'success-restart' }));
    }
}


// function cleanupGame(ws, gameId) {
//     if (games[gameId]) {
//         games[gameId].observers.delete(ws);
//         if (games[gameId].observers.size === 0 && games[gameId].ws === ws) {
//             delete games[gameId];
//             broadcastGameList();
//         }
//     }
// }


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

    users.push({ email: email, name: name, password: hashedPassword, maxScore: games[gameId].gameState.max_score,  maxSpeed: games[gameId].gameState.max_speed,  shipImgOption: games[gameId].gameState.shipImgOption  });
    games[gameId].name = name
    res.status(201).json({ success: true, message: 'Registration successful' });
});


app.post('/login', async (req, res) => {
    const { name, password, gameId } = req.body;

    const user = users.find(u => u.name === name);
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    games[gameId].name = name
    games[gameId].gameState.max_score = user.maxScore
    // games[gameId].gameState.maxSpeed = user.maxSpeed
    games[gameId].gameState.shipImgOption = user.shipImgOption 
    res.status(200).json({ success: true, gameState: games[gameId].gameState,  message: `Hello, ${user.name}!` });
});





app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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


app.post('/change-ship-img', (req, res) => {
    const { name, shipImgOption, gameId } = req.body;


    if (games[gameId]) {
        games[gameId].gameState.shipImgOption = shipImgOption;
        if (name !== null){
            const user = users.find(u => u.name === name);
            user.shipImgOption = shipImgOption;
        }
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Change Ship Image Error' });
    }
});


app.get('/get-users-data', (req, res) => {
    const data = users.map(user => ({
        name: user.name,
        email: user.email,
        password: user.password,
        maxScore: user.maxScore,
        maxSpeed: user.maxSpeed
    }));
    res.json(data); // Send JSON response
});


app.get('/get-users', (req, res) => {

    const usersList = [
        { "tag": "ul", "id": "usersList", "innerTags": [] }
    ];

    users.forEach(user => {
        usersList[0].innerTags.push(
            {
                "tag": "li",
                "textContent": `Name: ${user.name}, Email: ${user.email}`,
                "innerTags": [
                    {"tag": "button", "textContent": "Delete", "onclick": "deleteUser", "args": [`${user.name}`] }
                ]
            },
    );
    });


    res.json(usersList); 
});


app.get('/get-active-games', (req, res) => {

    const gameId = req.query.gameId;


    const transformedGames = utils.transformDict(games);
    const activeGameList = [
        { "tag": "ul", "id": "gameListUl", "innerTags": [] }
    ];

    let size = 0
    Object.entries(transformedGames).forEach(([id, game]) => {
        if (game.isRun){
            if (gameId === id) {
                activeGameList[0].innerTags.push({
                    "tag": "li",
                    "textContent": `Your own room - ${game.name} : ${id}`,
                    "style": { "color": "orange" }
                });
            }
            else {
                activeGameList[0].innerTags.push({
                    "tag": "li",
                    "textContent": `${game.name} : ${id}`,
                    "onclick": "observeGame",
                    "args": [`${id}`],
                    "style": { "cursor": "pointer", "color": "green", "textDecoration": "underline" }
                });
            }
            size++
        }
    });
    if (size < 1){
        activeGameList[0].innerTags.push({
            "tag": "li",
            "textContent": `no active games yet`,
        });
    }

    res.json({ success: true, activeGameList });
});


app.post('/upload-csv', (req, res) => {
    const csvContent = req.body;
    const parsedUsers = utils.parseCSV(csvContent, users);

    users.push(...parsedUsers);

    res.json({ success: true, message: 'Файл успешно обработан' });
});


app.get('/download-users-csv', (req, res) => {
    let csvContent = 'name,email,password,maxScore,maxSpeed\n';
    users.forEach(user => {
        csvContent += `${user.name},${user.email},${user.password},${user.maxScore},${user.maxSpeed}\n`;
    });


    const filePath = path.join(__dirname, 'users_data.csv');
    fs.writeFileSync(filePath, csvContent);

    res.download(filePath, 'users_data.csv', (err) => {
        if (err) {
            console.error("Error downloading file:", err);
        }
        fs.unlinkSync(filePath);
    });
});


app.get('/page-structure', (req, res) => {
    const pageStructure = [
        { "tag": "div", "id": "gameListDiv" },
        { "tag": "p", "id": "observerInfo" },
        { "tag": "button", "id": "restartBtn", "textContent": "Start Game", "onclick": "restartGame" },
        { "tag": "button", "id": "backBtn", "textContent": "Back to Your Room", "onclick": "backToRoom", "style": { "display": "none" } },
        { "tag": "button", "id": "musicBtn", "textContent": "Play Music", "onclick": "musicHandler" },
        { "tag": "button", "id": "debugBtn", "textContent": "Turn Debug On", "onclick": "debugHandler" },

        { "tag": "ul", "id": "debugDetailsList", "style": { "display": "none" }, "innerTags": [
            { "tag": "li", "id": "laserInfoItem", "textContent": "Amount of the active lasers" },
            { "tag": "li", "id": "missileInfoItem", "textContent": "Amount of the active missiles" }
        ]},
        { "tag": "p", "id": "messageBlock" },
        { "tag": "p", "id": "scoreItem" },
        { "tag": "p", "id": "speedItem" },
        { "tag": "p", "id": "maxScore" },



        { "tag": "select", "id": "shipSelect", "onchange": "shipImageHandler", "innerTags": [
            { "tag": "option", "textContent": "Ship 1", "value": "Ship 1"},
            { "tag": "option", "textContent": "Ship 2", "value": "Ship 2"},
            { "tag": "option", "textContent": "Ship 3", "value": "Ship 3"},
        ]
        },




        { "tag": "form", "id": "registrationForm", "innerTags": [
            { "tag": "h3", "id": "registrationTitle", "textContent": "Register" },
            { "tag": "input", "id": "emailInput", "type": "email", "placeholder": "Email", "name": "email", "required": true },
            { "tag": "input", "id": "nameInput", "type": "text", "placeholder": "Name", "name": "name", "required": true },
            { "tag": "input", "id": "passwordInput", "type": "password", "placeholder": "Password", "name": "password", "required": true },
            { "tag": "input", "id": "confirmPassword", "type": "password", "placeholder": "Confirm Password", "name": "confirmPassword", "required": true },
            { "tag": "button", "id": "registerButton", "textContent": "Register", "type": "button", "onclick": "handleRegistration",  "args": ["emailInput", "nameInput", "passwordInput", "confirmPassword"] },
        ] },
        { "tag": "form", "id": "loginForm", "innerTags": [
            { "tag": "h3", "id": "registrationTitle", "textContent": "Login" },
            { "tag": "input", "id": "nameLoginInput", "type": "text", "placeholder": "Name", "name": "name", "required": true },
            { "tag": "input", "id": "passwordLoginInput", "type": "password", "placeholder": "Password", "name": "password", "required": true },
            { "tag": "button", "id": "loginButton", "textContent": "Login", "type": "button", "onclick": "handleLogin",  "args": ["nameLoginInput", "passwordLoginInput"] },
        ] },
        { "tag": "div", "id": "adminDiv", "innerTags": [
            { "tag": "button", "id": "csvDownloadBtn", "textContent": "Download CSV", "onclick": "csvDownloadHandler" },
            { "tag": "input", "id": "csvInput", "type": "file", "accept": ".csv" },
            { "tag": "button", "id": "csvUploadBtn", "textContent": "Upload CSV", "onclick": "csvUploadHandler" },
            { "tag": "button", "id": "showUsersBtn", "textContent": "Show Registered Users", "onclick": "displayUsers" },
            { "tag": "div", "id": "usersListDiv" }
        ]},
        {
            "tag": "canvas",
            "id": "gameCanvas",
            "width": 500,
            "height": 500,
            "initialize": "displayHandler.initialize"
        },
    ]
    
    res.json(pageStructure);
});

app.get('/game-config', (req, res) => {

    const gameConfig = {
        fieldConfig: {
            xFields: 50,
            yFields: 50,
            fields: 50
        },
        gameConfig: {
            blockSize: 10,
            shipRotations: [
                { points: [3, 4, 5], rpg: 1 },
                { points: [0, 4, 8], rpg: 2 },
                { points: [1, 4, 7], rpg: 5 },
                { points: [2, 4, 6], rpg: 8 },
                { points: [3, 4, 5], rpg: 7 },
                { points: [0, 4, 8], rpg: 6 },
                { points: [1, 4, 7], rpg: 3 },
                { points: [2, 4, 6], rpg: 0 }
            ],
            shipImages: {
                "Ship 1": "https://opengameart.org/sites/default/files/surt2.png",
                "Ship 2": "https://opengameart.org/sites/default/files/1346943991.png",
                "Ship 3": "https://opengameart.org/sites/default/files/planet_glass.png"
            },
            images: {
                backImage: "https://opengameart.org/sites/default/files/back_2.png",
                asteroidImg: "https://opengameart.org/sites/default/files/1346943991.png",
                laserImg: "https://opengameart.org/sites/default/files/planet_glass.png"
            },
            music: {
                audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
            }
        }
    };
    res.json(gameConfig);
});


app.listen(httpPort, () => {
    console.log(`Server is running on: http://localhost:${httpPort}`);
});
