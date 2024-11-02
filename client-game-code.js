// // Конфигурации игры

// const fieldConfig = {
//     xFields: Math.round(500 / 10),
//     yFields: Math.round(500 / 10),
//     fields: Math.round(500 / 10),
// }


// const gameConfig = {
//     mid: { x: 29, y: 29 },
//     blockSize: 10,
//     shipRotations: [
//         { points: [3, 4, 5], rpg: 1 },
//         { points: [0, 4, 8], rpg: 2 },
//         { points: [1, 4, 7], rpg: 5 },
//         { points: [2, 4, 6], rpg: 8 },
//         { points: [3, 4, 5], rpg: 7 },
//         { points: [0, 4, 8], rpg: 6 },
//         { points: [1, 4, 7], rpg: 3 },
//         { points: [2, 4, 6], rpg: 0 }
//     ],
//     shipImages: {
//         "Ship 1": 'https://opengameart.org/sites/default/files/surt2.png',
//         "Ship 2": 'https://opengameart.org/sites/default/files/1346943991.png',
//         "Ship 3": 'https://opengameart.org/sites/default/files/planet_glass.png'
//     },
//     images: {
//         backImage: new Image(),
//         asteroidImg: new Image(),
//         laserImg: new Image(),
//         shipImg: new Image()
//     },
//     music: {
//         audio: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
//         isPlaying: false,
//         toggleMusic() {
//             if (this.isPlaying) {
//                 this.audio.pause();
//                 this.isPlaying = false;
//             } else {
//                 this.audio.play();
//                 this.isPlaying = true;
//             }
//         }
//     },

//     // calculateCenter(canvasWidth, canvasHeight, blockSize) {
//     //     this.mid.x = Math.floor(canvasWidth / blockSize / 2);
//     //     this.mid.y = Math.floor(canvasHeight / blockSize / 2);
//     // },

//     initializeImages() {
//         this.images.backImage.src = 'https://opengameart.org/sites/default/files/back_2.png';
//         this.images.asteroidImg.src = 'https://opengameart.org/sites/default/files/1346943991.png';
//         this.images.laserImg.src = 'https://opengameart.org/sites/default/files/planet_glass.png';
//         this.images.shipImg.src = this.shipImages["Ship 1"]; // По умолчанию первый корабль
//     }
// };
// gameConfig.initializeImages();
// gameConfig.music.audio.loop = true;


// // Объект состояния игры
// const gameState = {
//     xSh: gameConfig.mid.x,
//     ySh: gameConfig.mid.y,
//     rSh: 0,
//     missiles: [],
//     lasers: [],
//     score: 0,
//     speed: 1000,
//     max_speed: 1000,
//     counter: 0,
//     max_score: 0,
//     shipImgOption: "Ship 1",
//     isRun: false
// };


// // Функции для управления игрой
// const gameActions = {
//     openGame() {
//         webSocketHandler.sendMessage('openGame');
//     },

//     observeGame(selectedGameId) {
//         if (gameState.isRun) {
//             alert("Warning! You can not observe while you are playing the game!");
//         } else if (selectedGameId !== webSocketHandler.gameId && selectedGameId !== webSocketHandler.gameIdObserver) {
//             webSocketHandler.sendMessage('observe', { gameIdObserver: selectedGameId });
//             uiElements.setObserverMode(selectedGameId);
//             uiElements.backBtn.style.display = "block"
//         }
//     },

//     restartGame() {
//         if (webSocketHandler.gameId === null) {
//             this.createNewGame();
//         } else {
//             webSocketHandler.sendMessage('restart');
//             uiElements.showMessage("Restarted", 1);
//         }
//         gameState.isRun = true;
//     },

//     backToRoom() {
//         webSocketHandler.ws.send(JSON.stringify({ type: 'player', gameId: webSocketHandler.gameId, gameIdObserver: webSocketHandler.gameIdObserver}));
//         webSocketHandler.gameIdObserver = null
//         uiElements.observerInfo.textContent = `You are in your room: ${webSocketHandler.gameId}`
//         uiElements.restartBtn.style.display = 'block'
//     },

//     musicHandler() {
//         gameConfig.music.toggleMusic();
//         uiElements.musicBtn.textContent = gameConfig.music.isPlaying ? 'Pause Music' : 'Play Music';
//     },

//     debugHandler() {
//         if (uiElements.debugBtn.textContent === 'Turn Debug Off'){
//             uiElements.debugBtn.textContent = 'Turn Debug On'
//             uiElements.debugDetailsList.style.display = 'none'
//         }
//         else{
//             uiElements.debugBtn.textContent = 'Turn Debug Off'
//             uiElements.debugDetailsList.style.display = 'block'
//         }
//     },

//     shipImageHandler(event) {
//         const selectedValue = event.target.value;

//         gameConfig.images.shipImg.src = gameConfig.shipImages[selectedValue];
//         gameState.shipImgOption = selectedValue
//         webSocketHandler.ws.send(JSON.stringify({ type: 'image', gameId: webSocketHandler.gameId, shipImgOption: gameState.shipImgOption}));
//     },

//     getShipCenter(xShip, yShip) {
//         return [
//             [xShip - 1, yShip - 1], [xShip, yShip - 1], [xShip + 1, yShip - 1],
//             [xShip - 1, yShip], [xShip, yShip], [xShip + 1, yShip],
//             [xShip - 1, yShip + 1], [xShip, yShip + 1], [xShip + 1, yShip + 1]
//         ];
//     },

//     getCoordinates(){
//         laserCord = []
//         missiesCord = []

//         gameState.lasers.forEach(laser => {
//             laserCord.push(`[${laser.x}, ${laser.y}]`)
//         })
//         gameState.missiles.forEach(missile => {
//             missiesCord.push(`[${missile.x}, ${missile.y}]`)
//         })

//         return [laserCord, missiesCord]
//     },

//     async updateActiveGames() {
//         try {
//             const response = await fetch('/get-active-games', {
//                 method: 'GET',
//                 headers: { 'Content-Type': 'application/json' }
//             });
//             const data = await response.json();
//             uiElements.updateGameList(data.games);
//         } catch (error) {
//             console.error('Request error:', error);
//         }
//     }
// };


// // Элементы интерфейса
// const uiElements = {
//     gameListDiv: document.createElement('div'),
//     observerInfo: document.createElement('p'),
//     restartBtn: document.createElement('button'),
//     backBtn: document.createElement('button'),
//     musicBtn: document.createElement('button'),
    
//     debugBtn: document.createElement('button'),
//     debugDetailsList: document.createElement('ul'),
//     laserInfoItem: document.createElement('li'),
//     missileInfoItem: document.createElement('li'),
    
//     messageBlock: document.createElement('h3'),
//     scoreItem: document.createElement('p'),
//     speedItem: document.createElement('p'),
//     maxScore: document.createElement('p'),

//     shipSelect: document.createElement('select'),

//     registrationForm: document.createElement('form'),
//     loginForm: document.createElement('form'),
//     adminDiv: document.createElement('div'),
//     csvDownloadBtn: document.createElement('button'),
//     csvUploadBtn: document.createElement('button'),
//     csvInput: document.createElement('input'),
//     showUsersBtn: document.createElement('button'),
//     usersList: document.createElement('ul'),

//     initialize() {
//         document.body.appendChild(this.gameListDiv);
//         document.body.appendChild(this.observerInfo);
//         document.body.appendChild(this.messageBlock);

//         this.restartBtn.textContent = 'Start Game';
//         this.restartBtn.onclick = gameActions.restartGame;
//         this.restartBtn.style.display = "block"
//         document.body.appendChild(this.restartBtn);

//         this.backBtn.textContent = 'Back to Your Room';
//         this.backBtn.style.display = "none"
//         this.backBtn.onclick = gameActions.backToRoom;
//         document.body.appendChild(this.backBtn);

//         this.musicBtn.textContent = 'Play Music';
//         this.restartBtn.style.display = "block"
//         this.musicBtn.onclick = gameActions.musicHandler;
//         document.body.appendChild(this.musicBtn);

//         this.debugBtn.textContent = 'Turn Debug On';
//         this.debugBtn.style.display = "block"
//         this.debugBtn.onclick = gameActions.debugHandler;
//         this.debugDetailsList.style.display = 'none'
//         this.laserInfoItem.textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates:`
//         this.missileInfoItem.textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates:`
//         document.body.appendChild(this.debugBtn);
//         document.body.appendChild(this.debugDetailsList);
//         this.debugDetailsList.appendChild(this.laserInfoItem);
//         this.debugDetailsList.appendChild(this.missileInfoItem);

//         document.body.appendChild(this.scoreItem);
//         document.body.appendChild(this.speedItem);
//         document.body.appendChild(this.maxScore);

//         this.initShipOptions()
//         this.shipSelect.style.display = 'block'
//         this.shipSelect.onchange = gameActions.shipImageHandler.bind(this);
//         document.body.appendChild(this.shipSelect);

//         this.createRegistrationForm();
//         this.createLoginForm();

//         this.showUsersBtn.textContent = 'Show Registered Users';
//         this.showUsersBtn.onclick = this.displayUsers.bind(this);

//         this.csvDownloadBtn.textContent = "Download CSV"
//         this.csvDownloadBtn.onclick = this.csvDownloadHandler.bind(this)

//         this.csvInput.type = 'file';
//         this.csvInput.accept = '.csv';

//         this.csvUploadBtn.textContent = "Upload CSV"
//         this.csvUploadBtn.onclick = this.csvUploadHandler.bind(this)

//         document.body.appendChild(this.adminDiv);
//         this.adminDiv.appendChild(this.csvDownloadBtn);
//         this.adminDiv.appendChild(this.csvInput)
//         this.adminDiv.appendChild(this.csvUploadBtn)
//         this.adminDiv.appendChild(this.showUsersBtn);
//         this.adminDiv.appendChild(this.usersList);
//     },


//     csvDownloadHandler() {
//         window.location.href = '/download-users-csv';
//     },

//     csvUploadHandler() {

//         const file = this.csvInput.files[0];


//         if (file) {
//             const reader = new FileReader();
//             reader.onload = function(event) {
//                 const csvContent = event.target.result;
    
//                 fetch('/upload-csv', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'text/plain',
//                     },
//                     body: csvContent,
//                 })
//                 .then(response => response.json())
//                 .then(data => {
//                     if (data.success) {
//                         alert('File successfully uploaded');
//                         console.log(data.message);
//                     } else {
//                         alert('Error during uploading a file');
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Error during uploading a file:', error);
//                     alert('Error during uploading a file');
//                 });
//             };
//             reader.readAsText(file);
//         } else {
//             alert('Select file for uploading');
//         }
//     },


//     displayUsers() {
//         fetch('/get-users')
//         .then(response => response.json())
//         .then(users => {
//             this.usersList.innerHTML = '';

//             users.forEach(user => {
//                 const listItem = document.createElement('li');
//                 listItem.textContent = `Name: ${user.name}, Email: ${user.email}`;

//                 const deleteBtn = document.createElement('button');
//                 deleteBtn.textContent = 'Delete';
//                 deleteBtn.onclick = () => this.deleteUser(user.name);
//                 listItem.appendChild(deleteBtn);

//                 this.usersList.appendChild(listItem);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching users:', error);
//         });
//     },

//     nonAdminDisplayUsers(){
//         this.adminDiv.style.display = 'none'
//     },
    
//     adminDisplayUsers(){
//         this.adminDiv.style.display = 'block'
//     },


//     deleteUser(name) {
//         fetch('/delete-user', {
//             method: 'DELETE',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 alert(data.message);
//                 this.displayUsers();
//             } else {
//                 alert(`Error: ${data.message}`);
//             }
//         })
//         .catch(error => {
//             console.error('Error deleting user:', error);
//         });
//     },


//     initShipOptions() {
//         for (const [name, url] of Object.entries(gameConfig.shipImages)) {
//             const option = document.createElement('option');
//             option.value = name;
//             option.textContent = name;
//             this.shipSelect.appendChild(option);
//         }
//     },

//     createRegistrationForm() {
//         // Заголовок
//         const title = document.createElement('h3');
//         title.textContent = 'Register';
//         this.registrationForm.id = 'registrationForm';
//         this.registrationForm.appendChild(title);

//         // Поле Email
//         const emailInput = document.createElement('input');
//         emailInput.type = 'email';
//         emailInput.placeholder = 'Email';
//         emailInput.name = 'email';
//         emailInput.required = true;
//         this.registrationForm.appendChild(emailInput);
        
//         // Поле Name
//         const nameInput = document.createElement('input');
//         nameInput.type = 'text';
//         nameInput.placeholder = 'Name';
//         nameInput.name = 'name';
//         nameInput.required = true;
//         this.registrationForm.appendChild(nameInput);

//         // Поле Password
//         const passwordInput = document.createElement('input');
//         passwordInput.type = 'password';
//         passwordInput.placeholder = 'Password';
//         passwordInput.name = 'password'
//         passwordInput.required = true;
//         this.registrationForm.appendChild(passwordInput);

//         // Поле Confirm Password
//         const confirmPasswordInput = document.createElement('input');
//         confirmPasswordInput.type = 'password';
//         confirmPasswordInput.name = 'confirmPassword';
//         confirmPasswordInput.placeholder = 'Confirm Password';
//         confirmPasswordInput.required = true;
//         this.registrationForm.appendChild(confirmPasswordInput);

//         // Кнопка регистрации
//         const registerButton = document.createElement('button');
//         registerButton.type = 'button';
//         registerButton.textContent = 'Register';
//         registerButton.onclick = () => this.handleRegistration(emailInput.value, nameInput.value, passwordInput.value, confirmPasswordInput.value);
//         this.registrationForm.appendChild(registerButton);
        

//         document.body.appendChild(this.registrationForm);
//     },

//     hideRegistrationForm() {
//         this.registrationForm.style.display = 'none';
//         this.loginForm.style.display = 'none'
//     },

//     createLoginForm() {
//         // Заголовок
//         const title = document.createElement('h3');
//         title.textContent = 'Login';
//         this.loginForm.appendChild(title);

//         // Поле Email
//         const nameInput = document.createElement('input');
//         nameInput.type = 'name';
//         nameInput.placeholder = 'Name'
//         nameInput.name = 'name';
//         this.loginForm.appendChild(nameInput);

//         // Поле Password
//         const passwordInput = document.createElement('input');
//         passwordInput.type = 'password';
//         passwordInput.placeholder = 'Password'
//         passwordInput.name = 'password';
//         this.loginForm.appendChild(passwordInput);

//         // Кнопка входа
//         const loginButton = document.createElement('button');
//         loginButton.type = 'button';
//         loginButton.textContent = 'Login';
//         loginButton.onclick = () => this.handleLogin(nameInput.value, passwordInput.value);
//         this.loginForm.appendChild(loginButton);

//         document.body.appendChild(this.loginForm);
//     },

//     handleRegistration(email, name, password, confirmPassword) {

//         console.log("NAME: ", name)

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // 3@3.2
//         const nameRegex = /^[a-zA-Z]+$/; // [a-zA-Z]

//         if (!email || !name || !password || !confirmPassword) {
//             alert('All fields are required');
//             return;
//         }

//         if (name === null) {
//             alert('Name can not be "null"');
//             return;
//         }

//         if (password !== confirmPassword) {
//             alert('Passwords do not match');
//             return;
//         }

//         if (!emailRegex.test(email)) {
//             alert('Invalid email format');
//             return;
//         }

//         if (!nameRegex.test(name)) {
//             alert('Name should contain only letters');
//             return;
//         }

//         fetch('/register', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, name, password, gameId: webSocketHandler.gameId })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 this.successAuth(name)
//                 alert(`${data.message}`);
//             } else {
//                 alert(`Error: ${data.message}`);
//             }
//         })
//         .catch(error => console.error('Registration error:', error));
//     },


//     handleLogin(name, password) {

//         if (!name || !password) {
//             alert('Name and password are required');
//             return;
//         }

//         fetch('/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name, password, gameId: webSocketHandler.gameId })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 console.log("LOGIN - data.gameState:", data.gameState)
//                 Object.assign(gameState, data.gameState);
//                 gameConfig.images.shipImg.src = gameConfig.shipImages[gameState.shipImgOption];
//                 this.successAuth(name)
//                 alert(`${data.message}`);
//             } else {
//                 alert(`Error: ${data.message}`);
//             }
//         })
//         .catch(error => console.error('Login error:', error));
//     },


//     successAuth(name){
//         webSocketHandler.name = name
//         this.hideRegistrationForm()
//         if (name === 'admin') uiElements.adminDisplayUsers()
//     },


//     invisibleRestartBtn() {
//         this.restartBtn.style.display = "none"
//     },

//     visibleRestartBtn() {
//         this.restartBtn.style.display = "block"
//     },

//     updateGameList(games) {
//         this.gameListDiv.innerHTML = '';
//         let size = 0;

//         const header = document.createElement('h3');
//         header.textContent = "Active Games"
//         this.gameListDiv.appendChild(header)
//         const gameList = document.createElement('ul');
//         this.gameListDiv.appendChild(gameList)


//         Object.entries(games).forEach(([id, data]) => {
//             if (data.isRun){
//                 const listItem = document.createElement('li');
//                 listItem.textContent = id === webSocketHandler.gameId ? `Your own room - ${data.name} : ${id}` : `${data.name} : ${id}`;
//                 listItem.style.cursor = id === webSocketHandler.gameId ? 'cursor' : 'pointer';
//                 listItem.style.color = id === webSocketHandler.gameId ? 'orange' : 'green';
//                 listItem.style.textDecoration = id === webSocketHandler.gameId ? 'none' : 'underline';
//                 listItem.onclick = () => gameActions.observeGame(id);
//                 gameList.appendChild(listItem);
//                 size++;
//             }
//         });

//         if (size == 0){
//             const noGamesP = document.createElement('p');
//             noGamesP.textContent = "no active games yet"
//             this.gameListDiv.appendChild(noGamesP);
//         }
//     },

//     showEndGameMessage(newMaxScore) {
//         this.showMessage(newMaxScore ? "Game Over! New Max Score" : "Game Over", 2);
//         if (webSocketHandler.role === 'player') this.restartBtn.style.display = 'block';
//     },

//     showMessage(message, mode) {
//         this.messageBlock.textContent = message;
//         this.messageBlock.style.display = 'block';

//         if (mode === 1) {
//             this.messageBlock.style.backgroundColor = 'orange';
//             this.messageBlock.style.color = 'white';
//             this.messageBlock.style.border = '1px solid red';
//             setTimeout(() => this.messageBlock.style.display = 'none', 5000);
//         } else if (mode === 2) {
//             this.messageBlock.style.backgroundColor = 'red';
//             this.messageBlock.style.color = 'white';
//             this.messageBlock.style.border = '1px solid orange';
//         }
//     },

//     updateScoreInfo() {
//         this.maxScore.textContent = `Max Score: ${gameState.max_score}`;
//         this.scoreItem.textContent = `Score: ${gameState.score >= 10 ? gameState.score - 10 : gameState.score}`;
//         this.speedItem.textContent = `Speed: ${gameState.speed} mls`;
//     },

//     updateDebugInfo() {
//         let debugInfo = gameActions.getCoordinates()
//         this.laserInfoItem.textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates: ${debugInfo[0].join(", ")}`
//         this.missileInfoItem.textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates: ${debugInfo[1].join(", ")}` 
//     },

//     updateShipImage() {
//         gameConfig.images.shipImg.src = gameConfig.shipImages[gameState.shipImgOption];
//     },

//     setObserverMode(selectedGameId) {
//         this.observerInfo.textContent = `You are observing room ${selectedGameId}`;
//         this.restartBtn.style.display = 'none';
//     }
// };
// uiElements.initialize();


// // Функции для отрисовки
// const displayHandler = {
//     canvas: document.createElement('canvas'),
//     ctx: null,

//     initialize() {
//         this.canvas.width = 500;
//         this.canvas.height = 500;
//         document.body.appendChild(this.canvas);
//         this.ctx = this.canvas.getContext('2d');
//         // gameConfig.calculateCenter(this.canvas.width, this.canvas.height, 10);
//         setInterval(gameActions.updateActiveGames, 1000);
//         this.updateGame();
//     },

//     updateGame() {
//         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//         this.ctx.drawImage(gameConfig.images.backImage, 0, 0, this.canvas.width, this.canvas.height);

//         if (gameState.lasers.length) this.displayLasers();
//         if (gameState.xSh !== undefined && gameState.ySh !== undefined) this.displayShip();
//         if (gameState.missiles.length) this.displayMissiles();

//         uiElements.updateScoreInfo();
//         uiElements.updateDebugInfo();


//         requestAnimationFrame(() => this.updateGame());
//     },

//     displayShip() {
//         const shipCenter = gameActions.getShipCenter(gameState.xSh, gameState.ySh);
//         const rotation = gameConfig.shipRotations[gameState.rSh];

//         rotation.points.forEach(point => {
//             const [tmpX, tmpY] = shipCenter[point];
//             this.ctx.drawImage(gameConfig.images.shipImg, tmpX * gameConfig.blockSize, tmpY * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
//         });

//         const [tmpX, tmpY] = shipCenter[rotation.rpg];
//         this.ctx.drawImage(gameConfig.images.shipImg, tmpX * gameConfig.blockSize, tmpY * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
//     },

//     displayLasers() {
//         gameState.lasers.forEach(laser => {
//             this.ctx.drawImage(gameConfig.images.laserImg, laser.x * gameConfig.blockSize, laser.y * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
//         });
//     },

//     displayMissiles() {
//         gameState.missiles.forEach(missile => {
//             this.ctx.drawImage(gameConfig.images.asteroidImg, missile.x * gameConfig.blockSize, missile.y * gameConfig.blockSize, gameConfig.blockSize, gameConfig.blockSize);
//         });
//     }
// };
// displayHandler.initialize();

// // Объект для работы с WebSocket
// const webSocketHandler = {
//     ws: new WebSocket('ws://localhost:8082'),
//     gameId: localStorage.getItem('sessionId'),
//     gameIdObserver: null,
//     role: null,
//     name: null,

//     initialize() {
//         this.ws.onopen = () => {
//             console.log("WebSocket connection established.");
//             gameActions.openGame();
//         };
//         this.ws.onmessage = this.handleMessage.bind(this);
//     },

//     sendMessage(type, data = {}) {
//         this.ws.send(JSON.stringify({ type, gameId: this.gameId, ...data }));
//     },

//     handleMessage(event) {
//         const message = JSON.parse(event.data);

//         switch (message.type) {
//             case 'role':
//                 this.role = message.role;
//                 if (this.role === 'observer') {
//                     Object.assign(gameState, message.gameState);
//                     this.gameIdObserver = message.gameId;
//                 } else {
//                     if ((!this.gameId && message.gameId) || (this.gameId !== message.gameId)) {
//                         sessionId = message.gameId;
//                         localStorage.setItem('sessionId', sessionId);
//                     }
//                     this.gameId = message.gameId;
//                     if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
//                     if (gameState.isRun){
//                         uiElements.invisibleRestartBtn()
//                     }
//                     if (message.name) this.name = message.name
//                     if (this.name !== null) uiElements.hideRegistrationForm()
//                     if (this.name !== 'admin') {uiElements.nonAdminDisplayUsers()}
//                 }
//                 break;

//             case 'back game':
//                 this.role = message.role;
//                 if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
//                 uiElements.backBtn.style.display = "none"
//                 break;

//             case 'update':
//                 if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
//                 break;

//             // case 'gameList':
//             //     uiElements.updateGameList(message.games);
//             //     break;

//             case 'error':
//                 alert(message.message);
//                 break;

//             case 'endgame':
//                 uiElements.showEndGameMessage(message.gameState.max_score === gameState.score);
//                 if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
//                 break;

//             case 'success-restart':
//                 uiElements.showMessage("Start new game...", 1);
//                 uiElements.restartBtn.style.display = "none"
//                 break;
//         }

//         uiElements.updateShipImage();
//     }
// };
// webSocketHandler.initialize();

// // Обработчик нажатия клавиш
// // Обработчик нажатий кнопок с использованием HTTP-запросов
// window.addEventListener('keydown', (event) => {
//     if (webSocketHandler.role === 'player' && gameState.isRun) { // Проверяем, что текущий пользователь — игрок
//         const allowedKeys = ['KeyJ', 'KeyL', 'ArrowLeft', 'ArrowRight', 'Space'];
        
//         if (allowedKeys.includes(event.code)) {
//             fetch('http://localhost:8080/keys-pressed', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ 
//                     type: 'move',
//                     gameId: webSocketHandler.gameId,
//                     key: event.code
//                 })
//             })
//             .then(response => response.json())
//             .then(data => {

//                 // Локально обновляем игру в зависимости от ответа сервера
//                 if (data.state) {
//                     Object.assign(gameState, data.state); // Обновляем состояние игры
//                     uiElements.updateScoreInfo(); // Обновляем информацию о счете
//                 }
//             })
//             .catch(error => {
//                 console.error("Error sending key press to server:", error);
//             });
//         }
//     }
// });



document.addEventListener('DOMContentLoaded', () => {
    fetch('/page-structure')
        .then(response => response.json())
        .then(data => {
            renderStructure(data);
            webSocketHandler.initialize();
            console.log("webSocketHandler.initialize()")
            uiElements.initialize();
            displayHandler.initialize();
        })
        .catch(error => console.error('Error loading page structure:', error));
});

const gameConfig = {
    mid: { x: 29, y: 29 },
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

    // calculateCenter(canvasWidth, canvasHeight, blockSize) {
    //     this.mid.x = Math.floor(canvasWidth / blockSize / 2);
    //     this.mid.y = Math.floor(canvasHeight / blockSize / 2);
    // },

    initializeImages() {
        this.images.backImage.src = 'https://opengameart.org/sites/default/files/back_2.png';
        this.images.asteroidImg.src = 'https://opengameart.org/sites/default/files/1346943991.png';
        this.images.laserImg.src = 'https://opengameart.org/sites/default/files/planet_glass.png';
        this.images.shipImg.src = this.shipImages["Ship 1"]; // По умолчанию первый корабль
    }
};
gameConfig.initializeImages();
gameConfig.music.audio.loop = true;


// Объект состояния игры
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


// Функции для управления игрой
const gameActions = {
    openGame() {
        webSocketHandler.sendMessage('openGame');
        console.log("OPENGAME")
    },

    observeGame(selectedGameId) {
        if (gameState.isRun) {
            alert("Warning! You can not observe while you are playing the game!");
        } else if (selectedGameId !== webSocketHandler.gameId && selectedGameId !== webSocketHandler.gameIdObserver) {
            webSocketHandler.sendMessage('observe', { gameIdObserver: selectedGameId });
            uiElements.setObserverMode(selectedGameId);
            document.getElementById("backBtn").style.display = "block"
        }
    },

    restartGame() {
        console.log("RESTART")
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

    shipImageHandler(event) {
        const selectedValue = event.target.value;

        gameConfig.images.shipImg.src = gameConfig.shipImages[selectedValue];
        gameState.shipImgOption = selectedValue
        webSocketHandler.ws.send(JSON.stringify({ type: 'image', gameId: webSocketHandler.gameId, shipImgOption: gameState.shipImgOption}));
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
            const response = await fetch('/get-active-games', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            uiElements.updateGameList(data.games);
        } catch (error) {
            console.error('Request error:', error);
        }
    }
};


// Объект для работы с WebSocket
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
        console.log("RESTARTED SEND")
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
                    console.log("PLAYER WAS RECEIVED")
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

            // case 'gameList':
            //     uiElements.updateGameList(message.games);
            //     break;

            case 'error':
                alert(message.message);
                break;

            case 'endgame':
                uiElements.showEndGameMessage(message.gameState.max_score === gameState.score);
                if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
                break;

            case 'success-restart':
                console.log("SUCCESS-RESTART")
                uiElements.showMessage("Start new game...", 1);
                document.getElementById("restartBtn").style.display = "none"
                break;
        }

        uiElements.updateShipImage();
    }
};




// Элементы интерфейса
const uiElements = {
    initialize() {
        // gameListDiv = document.getElementById('gameListDiv')
        // observerInfo = document.getElementById('observerInfo')
        // restartBtn = document.getElementById('restartBtn')
        // backBtn = document.getElementById('backBtn')
        // musicBtn = document.getElementById('musicBtn')
    
        // canvas = document.getElementById('gameCanvas')
        
        // debugBtn = document.getElementById('debugBtn')
        // debugDetailsList = document.getElementById('debugDetailsList')
        // laserInfoItem = document.getElementById('laserInfoItem')
        // missileInfoItem = document.getElementById('missileInfoItem')
        
        // messageBlock = document.getElementById('messageBlock')
        // scoreItem = document.getElementById('scoreItem')
        // speedItem = document.getElementById('speedItem')
        // maxScore = document.getElementById('maxScore')
    
        // shipSelect = document.getElementById('shipSelect')
    
        // // registrationForm: document.getElementById('registrationForm'),
        // // loginForm: document.getElementById('form'),
    
        // adminDiv = document.getElementById('adminDiv')
        // csvDownloadBtn = document.getElementById('csvDownloadBtn')
        // csvUploadBtn = document.getElementById('csvUploadBtn')
        // csvInput = document.getElementById('csvInput')
        // showUsersBtn = document.getElementById('showUsersBtn')
        // usersList = document.getElementById('usersList')
    },
 

// ----------------------------------------------------

        // document.body.appendChild(this.gameListDiv);
        // document.body.appendChild(this.observerInfo);
        // document.body.appendChild(this.messageBlock);

        // if (document.getElementById('restartBtn')) {
        //     // Выполнить действия, если элемент существует
        //     console.log("Button was created")

        //     restart = document.getElementById('restartBtn')
        //     restart.textContent = "HAHAAHAHAHA"
        // } else {
        //     console.log("no element of button");
        // }

        // this.restartBtn.textContent = 'Start Game';
        // this.restartBtn.onclick = gameActions.restartGame;
        // this.restartBtn.style.display = "block"
        // document.body.appendChild(this.restartBtn);

        // this.backBtn.textContent = 'Back to Your Room';
        // this.backBtn.style.display = "none"
        // this.backBtn.onclick = gameActions.backToRoom;
        // document.body.appendChild(this.backBtn);

        // this.musicBtn.textContent = 'Play Music';
        // this.restartBtn.style.display = "block"
        // this.musicBtn.onclick = gameActions.musicHandler;
        // document.body.appendChild(this.musicBtn);

        // this.debugBtn.textContent = 'Turn Debug On';
        // this.debugBtn.style.display = "block"
        // this.debugBtn.onclick = gameActions.debugHandler;
        // this.debugDetailsList.style.display = 'none'
        // this.laserInfoItem.textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates:`
        // this.missileInfoItem.textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates:`
        // document.body.appendChild(this.debugBtn);
        // document.body.appendChild(this.debugDetailsList);
        // this.debugDetailsList.appendChild(this.laserInfoItem);
        // this.debugDetailsList.appendChild(this.missileInfoItem);

        // document.body.appendChild(this.scoreItem);
        // document.body.appendChild(this.speedItem);
        // document.body.appendChild(this.maxScore);

        // this.initShipOptions()
        // this.shipSelect.style.display = 'block'
        // this.shipSelect.onchange = gameActions.shipImageHandler.bind(this);
        // document.body.appendChild(this.shipSelect);

        // this.createRegistrationForm();
        // this.createLoginForm();

        // this.showUsersBtn.textContent = 'Show Registered Users';
        // this.showUsersBtn.onclick = this.displayUsers.bind(this);

        // this.csvDownloadBtn.textContent = "Download CSV"
        // this.csvDownloadBtn.onclick = this.csvDownloadHandler.bind(this)

        // this.csvInput.type = 'file';
        // this.csvInput.accept = '.csv';

        // this.csvUploadBtn.textContent = "Upload CSV"
        // this.csvUploadBtn.onclick = this.csvUploadHandler.bind(this)

        // document.body.appendChild(this.adminDiv);
        // this.adminDiv.appendChild(this.csvDownloadBtn);
        // this.adminDiv.appendChild(this.csvInput)
        // this.adminDiv.appendChild(this.csvUploadBtn)
        // this.adminDiv.appendChild(this.showUsersBtn);
        // this.adminDiv.appendChild(this.usersList);
    


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
        .then(users => {
            document.getElementById('usersList').innerHTML = '';

            users.forEach(user => {
                const listItem = document.createElement('li');
                listItem.textContent = `Name: ${user.name}, Email: ${user.email}`;

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => this.deleteUser(user.name);
                listItem.appendChild(deleteBtn);

                document.getElementById('usersList').appendChild(listItem);
            });
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
                this.displayUsers();
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
        });
    },


    initShipOptions() {
        for (const [name, url] of Object.entries(gameConfig.shipImages)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            document.getElementById('shipSelect').appendChild(option);
        }
    },

    createRegistrationForm() {
        // Заголовок
        const title = document.createElement('h3');
        title.textContent = 'Register';
        this.registrationForm.id = 'registrationForm';
        this.registrationForm.appendChild(title);

        // Поле Email
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email';
        emailInput.name = 'email';
        emailInput.required = true;
        this.registrationForm.appendChild(emailInput);
        
        // Поле Name
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Name';
        nameInput.name = 'name';
        nameInput.required = true;
        this.registrationForm.appendChild(nameInput);

        // Поле Password
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.name = 'password'
        passwordInput.required = true;
        this.registrationForm.appendChild(passwordInput);

        // Поле Confirm Password
        const confirmPasswordInput = document.createElement('input');
        confirmPasswordInput.type = 'password';
        confirmPasswordInput.name = 'confirmPassword';
        confirmPasswordInput.placeholder = 'Confirm Password';
        confirmPasswordInput.required = true;
        this.registrationForm.appendChild(confirmPasswordInput);

        // Кнопка регистрации
        const registerButton = document.createElement('button');
        registerButton.type = 'button';
        registerButton.textContent = 'Register';
        registerButton.onclick = () => this.handleRegistration(emailInput.value, nameInput.value, passwordInput.value, confirmPasswordInput.value);
        this.registrationForm.appendChild(registerButton);
        

        document.body.appendChild(this.registrationForm);
    },

    hideRegistrationForm() {
        this.registrationForm.style.display = 'none';
        this.loginForm.style.display = 'none'
    },

    createLoginForm() {
        // Заголовок
        const title = document.createElement('h3');
        title.textContent = 'Login';
        this.loginForm.appendChild(title);

        // Поле Email
        const nameInput = document.createElement('input');
        nameInput.type = 'name';
        nameInput.placeholder = 'Name'
        nameInput.name = 'name';
        this.loginForm.appendChild(nameInput);

        // Поле Password
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password'
        passwordInput.name = 'password';
        this.loginForm.appendChild(passwordInput);

        // Кнопка входа
        const loginButton = document.createElement('button');
        loginButton.type = 'button';
        loginButton.textContent = 'Login';
        loginButton.onclick = () => this.handleLogin(nameInput.value, passwordInput.value);
        this.loginForm.appendChild(loginButton);

        document.body.appendChild(this.loginForm);
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
                this.successAuth(name)
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
        webSocketHandler.name = name
        this.hideRegistrationForm()
        if (name === 'admin') uiElements.adminDisplayUsers()
    },


    invisibleRestartBtn() {
        document.getElementById('restartBtn').style.display = "none"
    },

    visibleRestartBtn() {
        document.getElementById('restartBtn').style.display = "block"
    },

    updateGameList(games) {
        document.getElementById('gameListDiv').innerHTML = '';
        let size = 0;

        const header = document.createElement('h3');
        header.textContent = "Active Games"
        document.getElementById('gameListDiv').appendChild(header)
        const gameList = document.createElement('ul');
        document.getElementById('gameListDiv').appendChild(gameList)


        Object.entries(games).forEach(([id, data]) => {
            if (data.isRun){
                const listItem = document.createElement('li');
                listItem.textContent = id === webSocketHandler.gameId ? `Your own room - ${data.name} : ${id}` : `${data.name} : ${id}`;
                listItem.style.cursor = id === webSocketHandler.gameId ? 'cursor' : 'pointer';
                listItem.style.color = id === webSocketHandler.gameId ? 'orange' : 'green';
                listItem.style.textDecoration = id === webSocketHandler.gameId ? 'none' : 'underline';
                listItem.onclick = () => gameActions.observeGame(id);
                gameList.appendChild(listItem);
                size++;
            }
        });

        if (size == 0){
            const noGamesP = document.createElement('p');
            noGamesP.textContent = "no active games yet"
            document.getElementById('gameListDiv').appendChild(noGamesP);
        }
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


function renderStructure(structure, parentElement = document.body) {
    structure.forEach(element => {
        const el = document.createElement(element.tag);
        
        // Присвоение ID, текста, стилей, обработчиков событий и других свойств
        if (element.id) el.id = element.id;
        if (element.textContent) el.textContent = element.textContent;
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
            if (typeof gameActions[element.onclick] === 'function'){
                el.addEventListener('click', gameActions[element.onclick].bind(gameActions));
            }
            if (typeof uiElements[element.onclick] === 'function'){
                el.addEventListener('click', uiElements[element.onclick].bind(uiElements));
            }
        }

        if (element.onchange) {
            if (typeof gameActions[element.onchange] === 'function'){
                el.addEventListener('onchange', gameActions[element.onchange].bind(gameActions));
            }
            if (typeof uiElements[element.onchange] === 'function'){
                el.addEventListener('onchange', uiElements[element.onchange].bind(uiElements));
            }
        }

        // Если элемент - canvas, присвоить размеры и вызвать инициализацию
        if (element.tag === 'canvas') {
            el.width = element.width;
            el.height = element.height;
            if (element.initialize && typeof displayHandler[element.initialize] === 'function') {
                displayHandler[element.initialize](el); // Передаем canvas в функцию инициализации
            }
        }

        if (element.innerTags) {
            renderStructure(element.innerTags, el); // Рекурсивная отрисовка вложенных элементов
        }

        parentElement.appendChild(el);
    });
}


// Функции для отрисовки
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







// Обработчик нажатия клавиш
// Обработчик нажатий кнопок с использованием HTTP-запросов
window.addEventListener('keydown', (event) => {
    // console.log("KEY:",event.code)
    // console.log("webSocketHandler.role:", webSocketHandler.role)
    // console.log("gameState.isRun:", gameState.isRun)
    if (webSocketHandler.role === 'player' && gameState.isRun) { // Проверяем, что текущий пользователь — игрок
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

                // Локально обновляем игру в зависимости от ответа сервера
                if (data.state) {
                    Object.assign(gameState, data.state); // Обновляем состояние игры
                    uiElements.updateScoreInfo(); // Обновляем информацию о счете
                }
            })
            .catch(error => {
                console.error("Error sending key press to server:", error);
            });
        }
    }
});



// document.addEventListener('DOMContentLoaded', () => {
//     fetch('/page-structure')
//         .then(response => response.json())
//         .then(data => {
//             renderStructure(data);
//             webSocketHandler.initialize();
//             uiElements.initialize();

//         })
//         .catch(error => console.error('Error loading page structure:', error));
// });

