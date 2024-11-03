document.addEventListener('DOMContentLoaded', () => {
    fetch('/page-structure')
        .then(response => response.json())
        .then(data => {
            renderStructure(data);
            webSocketHandler.initialize();
            displayHandler.initialize();
        })
        .catch(error => console.error('Error loading page structure:', error));
});



const gameConfig = {
    mid: { x: 29, y: 29 },
    blockSize: 500 / 59,
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
        "Ship 1": 'https://opengameart.org/sites/default/files/surt2.png',
        "Ship 2": 'https://opengameart.org/sites/default/files/1346943991.png',
        "Ship 3": 'https://opengameart.org/sites/default/files/planet_glass.png'
    },
    images: {
        backImage: new Image(),
        asteroidImg: new Image(),
        laserImg: new Image(),
        shipImg: new Image()
    },
    music: {
        audio: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
        isPlaying: false,
        toggleMusic() {
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
            } else {
                this.audio.play();
                this.isPlaying = true;
            }
        }
    },

    initializeImages() {
        this.images.backImage.src = 'https://opengameart.org/sites/default/files/back_2.png';
        this.images.asteroidImg.src = 'https://opengameart.org/sites/default/files/1346943991.png';
        this.images.laserImg.src = 'https://opengameart.org/sites/default/files/planet_glass.png';
        this.images.shipImg.src = this.shipImages["Ship 1"];
    }
};
gameConfig.initializeImages();
gameConfig.music.audio.loop = true;



const gameState = {
    xSh: gameConfig.mid.x,
    ySh: gameConfig.mid.y,
    rSh: 0,
    missiles: [],
    lasers: [],
    score: 0,
    speed: 1000,
    max_speed: 1000,
    counter: 0,
    max_score: 0,
    shipImgOption: "Ship 1",
    isRun: false
};



const gameActions = {
    openGame() {
        webSocketHandler.sendMessage('openGame');
        
    },

    // openGame() {
    //     fetch('/open-game', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ gameId: webSocketHandler.gameId, ws: webSocketHandler.ws })
    //     })
    //     .catch(error => {
    //         console.error('Error fetching users:', error);
    //     });
    // },

    observeGame(selectedGameId) {
        console.log("OBSERVER GAME")
        if (gameState.isRun) {
            alert("Warning! You can not observe while you are playing the game!");
        } else if (selectedGameId !== webSocketHandler.gameId && selectedGameId !== webSocketHandler.gameIdObserver) {
            webSocketHandler.sendMessage('observe', { gameIdObserver: selectedGameId });
            uiElements.setObserverMode(selectedGameId);
            document.getElementById("backBtn").style.display = "block"
        }
    },

    restartGame() {
        webSocketHandler.sendMessage('restart');
        uiElements.showMessage("Restarted", 1);
        gameState.isRun = true;
    },

    backToRoom() {
        webSocketHandler.ws.send(JSON.stringify({ type: 'player', gameId: webSocketHandler.gameId, gameIdObserver: webSocketHandler.gameIdObserver}));
        webSocketHandler.gameIdObserver = null
        document.getElementById("observerInfo").textContent = `You are in your room: ${webSocketHandler.gameId}`
        document.getElementById("restartBtn").style.display = 'block'
    },

    musicHandler() {
        gameConfig.music.toggleMusic();
        document.getElementById("musicBtn").textContent = gameConfig.music.isPlaying ? 'Pause Music' : 'Play Music';
    },

    debugHandler() {
        if (document.getElementById("debugBtn").textContent === 'Turn Debug Off'){
            document.getElementById("debugBtn").textContent = 'Turn Debug On'
            document.getElementById("debugDetailsList").style.display = 'none'
        }
        else{
            document.getElementById("debugBtn").textContent = 'Turn Debug Off'
            document.getElementById("debugDetailsList").style.display = 'block'
        }
    },

    getShipCenter(xShip, yShip) {
        return [
            [xShip - 1, yShip - 1], [xShip, yShip - 1], [xShip + 1, yShip - 1],
            [xShip - 1, yShip], [xShip, yShip], [xShip + 1, yShip],
            [xShip - 1, yShip + 1], [xShip, yShip + 1], [xShip + 1, yShip + 1]
        ];
    },

    getCoordinates(){
        laserCord = []
        missiesCord = []

        gameState.lasers.forEach(laser => {
            laserCord.push(`[${laser.x}, ${laser.y}]`)
        })
        gameState.missiles.forEach(missile => {
            missiesCord.push(`[${missile.x}, ${missile.y}]`)
        })

        return [laserCord, missiesCord]
    },

    async updateActiveGames() {
        try {
            const response = await fetch(`/get-active-games?gameId=${webSocketHandler.gameId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            renderGameList(data.activeGameList)
        } catch (error) {
            console.error('Request error:', error);
        }
    }
};



const webSocketHandler = {
    ws: null,
    gameId: localStorage.getItem('sessionId'),
    gameIdObserver: null,
    role: null,
    name: null,

    initialize() {
        this.ws  = new WebSocket('ws://localhost:8082');

        this.ws.onopen = () => {
            console.log("WebSocket connection established.");
            gameActions.openGame();
        };
        this.ws.onmessage = this.handleMessage.bind(this);
    },

    sendMessage(type, data = {}) {
        this.ws.send(JSON.stringify({ type, gameId: this.gameId, ...data }));
    },

    handleMessage(event) {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case 'role':
                this.role = message.role;
                if (this.role === 'observer') {
                    Object.assign(gameState, message.gameState);
                    this.gameIdObserver = message.gameId;
                } else {
                    if ((!this.gameId && message.gameId) || (this.gameId !== message.gameId)) {
                        sessionId = message.gameId;
                        localStorage.setItem('sessionId', sessionId);
                    }
                    this.gameId = message.gameId;
                    if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
                    if (gameState.isRun){
                        uiElements.invisibleRestartBtn()
                    }
                    if (message.name) this.name = message.name
                    if (this.name !== null) uiElements.hideRegistrationForm()
                    if (this.name !== 'admin') {uiElements.nonAdminDisplayUsers()}
                }
                break;

            case 'back game':
                this.role = message.role;
                if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
                document.getElementById("backBtn").style.display = "none"
                break;

            case 'update':
                if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
                break;

            case 'error':
                alert(message.message);
                break;

            case 'endgame':
                uiElements.showEndGameMessage(message.gameState.max_score === gameState.score);
                if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
                break;

            case 'success-restart':
                uiElements.showMessage("Start new game...", 1);
                document.getElementById("restartBtn").style.display = "none"
                break;
        }

        uiElements.updateShipImage();
    }
};





const uiElements = {
    
    csvDownloadHandler() {
        window.location.href = '/download-users-csv';
    },

    csvUploadHandler() {

        const file = document.getElementById('csvInput').files[0];


        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const csvContent = event.target.result;
    
                fetch('/upload-csv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: csvContent,
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('File successfully uploaded');
                    } else {
                        alert('Error during uploading a file');
                    }
                })
                .catch(error => {
                    console.error('Error during uploading a file:', error);
                    alert('Error during uploading a file');
                });
            };
            reader.readAsText(file);
        } else {
            alert('Select file for uploading');
        }
    },


    displayUsers() {
        fetch('/get-users')
        .then(response => response.json())
        .then(usersList => {
            renderUserList(usersList)
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
    },

    displayUsers() {
        fetch('/get-users')
        .then(response => response.json())
        .then(usersList => {
            renderUserList(usersList)
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
    },

    nonAdminDisplayUsers(){
        document.getElementById('adminDiv').style.display = 'none'
    },
    
    adminDisplayUsers(){
        document.getElementById('adminDiv').style.display = 'block'
    },


    deleteUser(name) {
        fetch('/delete-user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                uiElements.displayUsers();
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
        });
    },


    shipImageHandler(event) {
        const selectedValue = event.target.value;
        gameConfig.images.shipImg.src = gameConfig.shipImages[selectedValue];
        gameState.shipImgOption = selectedValue

        fetch('/change-ship-img', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: webSocketHandler.name, gameId: webSocketHandler.gameId, shipImgOption: gameState.shipImgOption })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
        });
    },


    hideRegistrationForm() {
        document.getElementById("registrationForm").style.display = 'none';
        document.getElementById("loginForm").style.display = 'none';
    },


    handleRegistration(email, name, password, confirmPassword) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // 3@3.2
        const nameRegex = /^[a-zA-Z]+$/; // [a-zA-Z]


        if (!email || !name || !password || !confirmPassword) {
            alert('All fields are required');
            return;
        }

        if (name === null) {
            alert('Name can not be "null"');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (!emailRegex.test(email)) {
            alert('Invalid email format');
            return;
        }

        if (!nameRegex.test(name)) {
            alert('Name should contain only letters');
            return;
        }

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password, gameId: webSocketHandler.gameId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.successAuth(name);
                alert(`${data.message}`);
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => console.error('Registration error:', error));
    },


    handleLogin(name, password) {

        if (!name || !password) {
            alert('Name and password are required');
            return;
        }

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password, gameId: webSocketHandler.gameId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Object.assign(gameState, data.gameState);
                gameConfig.images.shipImg.src = gameConfig.shipImages[gameState.shipImgOption];
                this.successAuth(name)
                alert(`${data.message}`);
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => console.error('Login error:', error));
    },


    successAuth(name){
        webSocketHandler.name = name;
        this.hideRegistrationForm();
        if (name === 'admin') uiElements.adminDisplayUsers();
    },


    invisibleRestartBtn() {
        document.getElementById('restartBtn').style.display = "none";
    },

    visibleRestartBtn() {
        document.getElementById('restartBtn').style.display = "block";
    },

    showEndGameMessage(newMaxScore) {
        this.showMessage(newMaxScore ? "Game Over! New Max Score" : "Game Over", 2);
        if (webSocketHandler.role === 'player') document.getElementById('restartBtn').style.display = 'block';
    },

    showMessage(message, mode) {
        document.getElementById('messageBlock').textContent = message;
        document.getElementById('messageBlock').style.display = 'block';

        if (mode === 1) {
            document.getElementById('messageBlock').style.backgroundColor = 'orange';
            document.getElementById('messageBlock').style.color = 'white';
            document.getElementById('messageBlock').style.border = '1px solid red';
            setTimeout(() => document.getElementById('messageBlock').style.display = 'none', 5000);
        } else if (mode === 2) {
            document.getElementById('messageBlock').style.backgroundColor = 'red';
            document.getElementById('messageBlock').style.color = 'white';
            document.getElementById('messageBlock').style.border = '1px solid orange';
        }
    },

    updateScoreInfo() {
        document.getElementById('maxScore').textContent = `Max Score: ${gameState.max_score}`;
        document.getElementById('scoreItem').textContent = `Score: ${gameState.score >= 10 ? gameState.score - 10 : gameState.score}`;
        document.getElementById('speedItem').textContent = `Speed: ${gameState.speed} mls`;
    },

    updateDebugInfo() {
        let debugInfo = gameActions.getCoordinates()
        document.getElementById('laserInfoItem').textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates: ${debugInfo[0].join(", ")}`
        document.getElementById('missileInfoItem').textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates: ${debugInfo[1].join(", ")}` 
    },

    updateShipImage() {
        gameConfig.images.shipImg.src = gameConfig.shipImages[gameState.shipImgOption];
    },

    setObserverMode(selectedGameId) {
        document.getElementById('observerInfo').textContent = `You are observing room ${selectedGameId}`;
        document.getElementById('restartBtn').style.display = 'none';
    }
};


const displayHandler = {
    canvas: null,
    ctx: null,

    initialize() {
        if (document.getElementById("gameCanvas")){
            this.canvas = document.getElementById("gameCanvas")
            this.ctx = this.canvas.getContext('2d');
            setInterval(gameActions.updateActiveGames, 1000);
            this.updateGame();
        }
    },

    updateGame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(gameConfig.images.backImage, 0, 0, this.canvas.width, this.canvas.height);

        if (gameState.lasers.length) this.displayLasers();
        if (gameState.xSh !== undefined && gameState.ySh !== undefined) this.displayShip();
        if (gameState.missiles.length) this.displayMissiles();

        uiElements.updateScoreInfo();
        uiElements.updateDebugInfo();


        requestAnimationFrame(() => this.updateGame());
    },

    displayShip() {
        const shipCenter = gameActions.getShipCenter(gameState.xSh, gameState.ySh);
        const rotation = gameConfig.shipRotations[gameState.rSh];

        rotation.points.forEach(point => {
            const [tmpX, tmpY] = shipCenter[point];
            this.ctx.drawImage(gameConfig.images.shipImg, tmpX * gameConfig.blockSize, tmpY * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
        });

        const [tmpX, tmpY] = shipCenter[rotation.rpg];
        this.ctx.drawImage(gameConfig.images.shipImg, tmpX * gameConfig.blockSize, tmpY * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
    },

    displayLasers() {
        gameState.lasers.forEach(laser => {
            this.ctx.drawImage(gameConfig.images.laserImg, laser.x * gameConfig.blockSize, laser.y * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
        });
    },

    displayMissiles() {
        gameState.missiles.forEach(missile => {
            this.ctx.drawImage(gameConfig.images.asteroidImg, missile.x * gameConfig.blockSize, missile.y * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
        });
    }
};


function renderStructure(structure, parentElement = document.body) {
    structure.forEach(element => {
        const el = document.createElement(element.tag);
        
        if (element.id) el.id = element.id;
        if (element.textContent) el.textContent = element.textContent;
        if (element.required) el.required = element.required;
        if (element.placeholder) el.placeholder = element.placeholder;
        if (element.name) el.name = element.name;
        if (element.type) {
            el.type = element.type;}
        if (element.accept) {
            el.accept = element.accept;}
        
        if (element.style) {
            Object.keys(element.style).forEach(styleProp => {
                el.style[styleProp] = element.style[styleProp];
            });
        }

        if (element.onclick) {
            console.log("CHECK ONCLICK:", element.onclick)
            const handlerFunction = gameActions[element.onclick] || uiElements[element.onclick];
            if (element.onclick !== "deleteUser" && element.onclick !== "observeGame") {
                el.addEventListener('click', () => {
                    const args = element.args
                        ? element.args.map(id => {
                            const element = document.getElementById(id);
                            if (element) {
                                return element.value;
                            } 
                        })
                        : [];
                
                    handlerFunction.apply(handlerFunction === gameActions[element.onclick] ? gameActions : uiElements, args);
                });
            } else {
                console.log("element.onclick:", element.onclick)
                el.addEventListener('click', () => {
                    const args = element.args ? element.args : [];
                    handlerFunction.apply(null, args);
                });
            }
        }
        

        if (element.id === 'shipSelect') {
            el.addEventListener('change', uiElements.shipImageHandler.bind(uiElements));
         }

        if (element.tag === 'canvas') {
            el.width = element.width;
            el.height = element.height;
            if (element.initialize && typeof displayHandler[element.initialize] === 'function') {
                displayHandler[element.initialize](el);
            }
        }

        if (element.innerTags) {
            renderStructure(element.innerTags, el);
        }

        parentElement.appendChild(el);
    });
}


function renderGameList(gameListStructure) {
    const gameListContainer = document.getElementById('gameListDiv');
    gameListContainer.innerHTML = '';
    renderStructure(gameListStructure, gameListContainer);
}


function renderUserList(userListStructure) {
    const userListContainer = document.getElementById('usersListDiv');
    userListContainer.innerHTML = '';
    renderStructure(userListStructure, userListContainer);
}


window.addEventListener('keydown', (event) => {
    if (webSocketHandler.role === 'player' && gameState.isRun) {
        const allowedKeys = ['KeyJ', 'KeyL', 'ArrowLeft', 'ArrowRight', 'Space'];
        
        if (allowedKeys.includes(event.code)) {
            fetch('http://localhost:8080/keys-pressed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: 'move',
                    gameId: webSocketHandler.gameId,
                    key: event.code
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.state) {
                    Object.assign(gameState, data.state);
                    uiElements.updateScoreInfo();
                }
            })
            .catch(error => {
                console.error("Error sending key press to server:", error);
            });
        }
    }
});