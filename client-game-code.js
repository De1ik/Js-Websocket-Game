// // var xFields = 59;
// // var yFields = 59;
// // var fields = 59;

// // var mid = {
// //     x: (xFields-1)/2,
// //     y: (yFields-1)/2
// // };

// var mid = {
//     x: 29,
//     y: 29
// };

// function getShipCenter(xShip, yShip) {
//     let shipCenter = [
//         [xShip-1,yShip-1],[xShip,yShip-1],[xShip+1,yShip-1],
//         [xShip-1,yShip],[xShip,yShip],[xShip+1,yShip],
//         [xShip-1,yShip+1],[xShip,yShip+1],[xShip+1,yShip+1]
//     ];
//     return shipCenter
// }

// function displayShip() {  

//     let rShip = gameState.rSh
//     let xShip = gameState.xSh
//     let yShip = gameState.ySh

//     let shipCenter = getShipCenter(xShip, yShip)

//     shipRotations[rShip].points.forEach(point => {
//         var tmpX = shipCenter[point][0];
//         var tmpY = shipCenter[point][1];
//         ctx.drawImage(shipImg, tmpX * blockSize, tmpY * blockSize, blockSize, blockSize);
//     });
//     var point = shipRotations[rShip].rpg;
//     var tmpX = shipCenter[point][0];
//     var tmpY = shipCenter[point][1];
//     ctx.drawImage(shipImg, tmpX * blockSize, tmpY * blockSize, blockSize, blockSize);
// }


// function displayLasers() {
//     gameState.lasers.forEach(laser => {
//         ctx.drawImage(laserImg, laser.x * blockSize, laser.y * blockSize, blockSize, blockSize);
//     });
// }


// function displayMissiles() {
//     gameState.missiles.forEach(missile => {
//         ctx.drawImage(asteroidImg, missile.x * blockSize, missile.y * blockSize, blockSize, blockSize);
//     });
// }


// function updateGame() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(backImage, 0, 0, canvas.width, canvas.height);

//     if (gameState.lasers !== undefined ) displayLasers()
//     if (gameState.xSh !== undefined && gameState.ySh !== undefined) {
//         displayShip();
//     } 
//     if (gameState.missiles !== undefined ) displayMissiles()


//     // deleteLasers();
//     maxScore.textContent = `Max Score: ${gameState.max_score}`
//     scoreItem.textContent = `Score: ${gameState.score}`
//     speedItem.textContent = `Speed: ${gameState.speed} mls`

//     if (gameState.missiles !== undefined && gameState.lasers !== undefined){
//         let debugInfo = getCoordinates()
//         laserInfo.textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates: ${debugInfo[0].join(", ")}`
//         missileInfo.textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates: ${debugInfo[1].join(", ")}`   
//     }
//     requestAnimationFrame(updateGame);
// }



// // -----------------------------------------------------------------------------------------
// const ws = new WebSocket('ws://localhost:8082');

// ws.onopen = () => {
//     console.log("WebSocket connection established.");
//     createNewGame();
// };

// let gameId = null;
// let gameIdObserver = null;
// let role = null;
// let isRun = false;
// let gameState = {
//                 xSh: mid.x,
//                 ySh: mid.y, 
//                 rSh: 0,
//                 missiles: [],
//                 lasers: [],
//                 score: 0,
//                 speed: 1000,
//                 counter: 0,
//                 max_score: 0,
//                 ws: null,
//                 shipImgOption: "Ship 1", 
//             }


// function createNewGame() {
//     ws.send(JSON.stringify({ type: 'firstGame' }));
// }

// function observeGame(selectedGameId) {
//     if (isRun){
//         alert("Warning! You can not observe while you are playing the game!")
//     }
//     else{
//         if (selectedGameId != gameId) {
//             ws.send(JSON.stringify({ type: 'observe', gameIdObserver: selectedGameId }));
//             buttonBackWs.style.visibility = 'visible'
//             gameIdObserver = selectedGameId
//             buttonBackWs.textContent = `Back to ${gameId}`
//             restartBtn.style.visibility = 'hidden'
//             observerInfo.textContent = `You are observing for the ${selectedGameId} room`
//         }
//     }
// }

// function updateGameList(games) {
//     gameList.innerHTML = '';
//     games.forEach((game) => {
//       const listItem = document.createElement('li');
//       if (game == gameId ){
//         listItem.textContent = `Your own room: ${game}`;
//         listItem.style.color = 'orange';
//       }
//       else{
//         listItem.textContent = game;
//         listItem.style.cursor = 'pointer';
//         listItem.style.color = 'green';
//         listItem.style.textDecoration = 'underline';
//       }
//       listItem.onclick = () => observeGame(game);
//       gameList.appendChild(listItem);
//     });
// }




// ws.onmessage = (event) => {
//     const message = JSON.parse(event.data);
//     if (message.type === 'role') {  
//         role = message.role;
//         if (role === 'observer') {
//             gameState = message.gameState
//             gameIdObserver = message.gameId;
//         } else {
//             gameId = message.gameId;
//         }
//     }
//     if (message.type === 'back game') {
//             role = message.role
//             if (message.gameState !== undefined) gameState = message.gameState
//     }

//     if (message.type === 'update') {
//         if (message.gameState !== undefined) gameState = message.gameState
//     } 
    
//     if (message.type === 'gameList') {
//       updateGameList(message.games);
//     } 
//     if (message.type === 'error') {
//       alert(message.message);
//     }
    
//     if (message.type === 'endgame') {
//         if (message.max_score == gameState.score) {
//             showMessage(messageBlock, `Game Over! New Max Score`, 2)
//         }
//         else{
//             showMessage(messageBlock, "Game Over", 2)
//         }
//         restartBtn.disabled = false;
//         isRun = false
//         if (role === 'player') restartBtn.style.visibility = 'visible';
//     } else if (message.type === 'success-restart') {
//         showMessage(messageBlock, "Start new game...", 1)
//     }
//     shipImg.src = shipImages[gameState.shipImgOption];
// };



// async function loadActiveRooms() {
//     try {
//         const response = await fetch(`http://localhost:8080/active-rooms?id=${playerId}`);
//         const activeRooms = await response.json();


//         roomListDiv.innerHTML = '';

//         activeRooms.forEach(room => {
//             const roomLink = document.createElement('a');
//             roomLink.href = `http://localhost:8080/game-room?roomId=${room.roomId}`;
//             roomLink.target = '_blank';
//             roomLink.innerText = `Room ID: ${room.roomId} (Players: ${room.playersCount}, Spectators: ${room.spectatorsCount})`;
//             roomLink.style.display = 'block';
            
//             roomListDiv.appendChild(roomLink);
//         });
//     } catch (error) {
//         console.error('Error fetching active rooms:', error);
//     }
// }

// function showMessage(block, message, mode){
//     block.textContent = message
//     block.style.display = 'block';

//     if (mode == 1){
//         block.style.cssText += `
//             background-color: orange;
//             color: white;
//             border: 1px solid red;
//         `

//         setTimeout(() => {
//             block.style.display = 'none';
//         }, 5000);
//     }
//     else if (mode == 2){
//         block.style.cssText += `
//         background-color: red;
//         color: white;
//         border: 1px solid orange;
//         `
//     }
// }

// function getCoordinates(){
//     laserCord = []
//     missiesCord = []

//     gameState.lasers.forEach(laser => {
//         laserCord.push(`[${laser.x}, ${laser.y}]`)
//     })
//     gameState.missiles.forEach(missile => {
//         missiesCord.push(`[${missile.x}, ${missile.y}]`)
//     })

//     return [laserCord, missiesCord]
// }

// function restartFunc(){
//     if (gameId === null) {createNewGame()}
//     else{
//         ws.send(JSON.stringify({ 
//             type: 'restart', 
//             gameId: gameId,
//         }));
//         showMessage(messageBlock, "Restarted", 1)
//     }
//     restartBtn.disabled = true
//     restartBtn.style.visibility = 'hidden'
//     isRun = true
// }



// // -----------------------------------------------------------------------------------------


// var shipRotations = [
//     {points: [3,4,5], rpg: 1}, // 0 north
//     {points: [0,4,8], rpg: 2}, // 1 north-east
//     {points: [1,4,7], rpg: 5}, // 2 east
//     {points: [2,4,6], rpg: 8}, // 3 south-east
//     {points: [3,4,5], rpg: 7}, // 4 south
//     {points: [0,4,8], rpg: 6}, // 5 south-west
//     {points: [1,4,7], rpg: 3}, // 6 west
//     {points: [2,4,6], rpg: 0}, // 7 north-west
// ];

// const backImage = new Image();
// backImage.src = 'https://opengameart.org/sites/default/files/back_2.png'

// const asteroidImg = new Image();
// asteroidImg.src='https://opengameart.org/sites/default/files/1346943991.png'

// const laserImg = new Image();
// laserImg.src='https://opengameart.org/sites/default/files/planet_glass.png'

// const shipImg = new Image();
// shipImg.src='https://opengameart.org/sites/default/files/surt2.png'


// const modeDiv = document.createElement('div')
// modeDiv.style.cssText = `
// width: 500px;
// flex-direction: column; 
// display: flex;
// justify-content: center;
// align-items: center;
// `
// document.body.appendChild(modeDiv)

// const gameList = document.createElement('ul');
// const observerInfo = document.createElement('p');
// observerInfo.textContent = `You are in your own room`
// modeDiv.appendChild(gameList)
// modeDiv.appendChild(observerInfo)

// const buttonBackWs = document.createElement('button'); 
// modeDiv.appendChild(buttonBackWs)
// buttonBackWs.textContent = `Back To Your Game`
// buttonBackWs.style.cssText =`background-color: purple;`
// buttonBackWs.style.visibility = 'hidden'

// buttonBackWs.addEventListener('click', () => {
//     ws.send(JSON.stringify({ type: 'player', gameId: gameId, gameIdObserver: gameIdObserver}));
//     gameIdObserver = null
//     buttonBackWs.style.visibility = 'hidden'
//     observerInfo.textContent = `You are in your own room`
//     restartBtn.style.visibility = 'visible'
// })

// const roomListDiv = document.createElement('div')
// modeDiv.appendChild(roomListDiv)

// const divDetailsInfo = document.createElement('div')
// const messageBlock = document.createElement('h3')
// const divAllButtons = document.createElement('div')
// const divAllLinks = document.createElement('div')
// divAllButtons.style.cssText = 
// `
//     display: flex;
//     flex-direction: column;
//     gap: 10px;
//     width: 200px;
//     margin-bottom: 10px;
// `


// modeDiv.appendChild(divDetailsInfo)
// modeDiv.appendChild(messageBlock)
// modeDiv.appendChild(divAllButtons)
// modeDiv.appendChild(divAllLinks)

// // --------------------------------------- Music -----------------------------------------
// const musicSound = document.createElement('audio')
// musicSound.src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
// musicSound.loop = true
// document.body.appendChild(musicSound)


// let isMusic = false
// const musicButton = document.createElement('button')
// musicButton.textContent = 'Turn Music On'
// musicButton.style.cssText =`background-color: purple;`
// divAllButtons.appendChild(musicButton)

// musicButton.addEventListener('click', () => {
//     if (isMusic){
//        musicSound.pause() 
//        musicButton.textContent = 'Turn Music On'
//     }
//     else {
//         musicSound.play() 
//         musicButton.textContent = 'Turn Music Off'
//     }
//     isMusic = !isMusic
// })

// // ---------------------------------------

// messageBlock.style.cssText = `
// padding: 20px;
// border-radius: 10px;
// width: 400px;
// text-align: center;
// font-size: 16px;
// `
// messageBlock.style.display = 'none'

// let isDebug = false
// const debugButton = document.createElement('button')
// debugButton.textContent = 'Turn Debug On'
// debugButton.style.cssText = 
// `
// background-color: orange;
// border: 1px solid red;
// margin-top: 30px;
// `
// divAllButtons.appendChild(debugButton)


// const debugDetails = document.createElement('ul')
// const laserInfo = document.createElement('li')
// const missileInfo = document.createElement('li')

// laserInfo.textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates:`
// missileInfo.textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates:`

// debugDetails.style.display = 'none'
// modeDiv.appendChild(debugDetails)
// debugDetails.appendChild(laserInfo)
// debugDetails.appendChild(missileInfo)



// debugButton.addEventListener('click', () => {
//     if (isDebug){
//         debugButton.textContent = 'Turn Debug On'
//         debugDetails.style.display = 'none'
//     }
//     else{
//         debugButton.textContent = 'Turn Debug Off'
//         debugDetails.style.display = 'block'
//     }
//     isDebug = !isDebug
// })


// const scoreItem = document.createElement('p')
// const speedItem = document.createElement('p')
// const maxScore = document.createElement('p')

// scoreItem.style.cssText = `
//         display: flex;
//         flex-direction: row;
//         gap: 20px;
//         align-items: center;
//     `;

// divDetailsInfo.appendChild(maxScore)
// divDetailsInfo.appendChild(scoreItem)
// divDetailsInfo.appendChild(speedItem)

// const restartBtn = document.createElement('button')
// restartBtn.textContent = 'Start Game'
// restartBtn.style.cssText = `background-color: red;`
// divAllButtons.appendChild(restartBtn)
// restartBtn.addEventListener('click', restartFunc)


// const gameBlock = document.getElementById('game');
// gameBlock.style.cssText =`        
//     float: left;
//     width: 500px;
//     gap: 20px;
//     align-items: center;
//     margin: 0 40px
//     `
// const canvas = document.createElement('canvas');
// canvas.width = 500
// canvas.height = 500
// gameBlock.appendChild(canvas);
// const ctx = canvas.getContext('2d');

// numberOfBlocks = 59
// const blockSize = canvas.width / numberOfBlocks

// // ---------------------------------Add Links-----------------------------------------------
// const backImageP = document.createElement('p')
// backImageP.textContent = "Background image link: "
// const backImageLink = document.createElement('a')
// backImageLink.href = 'https://opengameart.org/content/space-background-1'
// backImageLink.textContent = '(CC0 License)'
// backImageLink.target = '_blank'
// backImageP.appendChild(backImageLink)


// const asteroidImgP = document.createElement('p')
// asteroidImgP.textContent = "Asteroid image link: "
// const asteroidImgLink = document.createElement('a')
// asteroidImgLink.href = 'https://opengameart.org/content/asteroid-generator-and-a-set-of-generated-asteroids'
// asteroidImgLink.textContent = '(CC0 License)'
// asteroidImgLink.target = '_blank'
// asteroidImgP.appendChild(asteroidImgLink)


// const laserImgP = document.createElement('p')
// laserImgP.textContent = "Laser image link: "
// const laserImgLink = document.createElement('a')
// laserImgLink.href = 'https://opengameart.org/content/two-planet-pictures'
// laserImgLink.textContent = '(CC0 License)'
// laserImgLink.target = '_blank'
// laserImgP.appendChild(laserImgLink)

// // ---------------------------------------------------------------
// const shipImgP = document.createElement('p');
// shipImgP.textContent = "Ship image link: ";
// const shipImgLink = document.createElement('a');
// shipImgLink.href = 'https://opengameart.org/content/cc0-ships-surt-part2artcom';
// shipImgLink.textContent = '(CC0 License)';
// shipImgLink.target = '_blank';
// shipImgP.appendChild(shipImgLink);


// const selectElement = document.createElement('select'); 
// modeDiv.appendChild(shipImgP);
// modeDiv.appendChild(selectElement);


// const shipImages = {
//     "Ship 1": 'https://opengameart.org/sites/default/files/surt2.png',
//     "Ship 2": 'https://opengameart.org/sites/default/files/1346943991.png',
//     "Ship 3": 'https://opengameart.org/sites/default/files/planet_glass.png'
// };


// for (const [name, url] of Object.entries(shipImages)) {
//     const option = document.createElement('option');
//     option.value = name;
//     option.textContent = name;
//     selectElement.appendChild(option);
// }

// selectElement.addEventListener('change', (event) => {
//     const selectedValue = event.target.value;

//     shipImg.src = shipImages[selectedValue];
//     gameState.shipImgOption = selectedValue
//     ws.send(JSON.stringify({ type: 'image', gameId: gameId, shipImgOption: gameState.shipImgOption}));
// });

// // ----------------------------------------------------------



// const musicP = document.createElement('p')
// musicP.textContent = "Music link: "
// const musicLink = document.createElement('a')
// musicLink.href = 'https://www.soundhelix.com'
// musicLink.textContent = 'Music from SoundHelix (CC0 License)'
// musicLink.target = '_blank'
// musicP.appendChild(musicLink)



// divAllLinks.appendChild(backImageP)
// divAllLinks.appendChild(asteroidImgP)
// divAllLinks.appendChild(laserImgP)
// divAllLinks.appendChild(shipImgP)
// divAllLinks.appendChild(musicP)
// // --------------------------------------------------------------------------------

// // ---------------------------------------------Styles-----------------------------------
// const allButtons = document.querySelectorAll('button');

// allButtons.forEach(btn => {
//     btn.style.cssText+=
//     `
//     cursor: pointer;
//     font-size: 12px;
//     color: white;
//     border: none;
//     border-radius: 15px;
//     padding: 15px 20px;
    
//     `
// })

// const detailsParagraph = document.querySelectorAll('p');

// detailsParagraph.forEach(p => {
//     p.style.cssText+=
//     `
//     background-color: green;
//     font-size: 12px;
//     color: white;
//     padding: 10px 15px;
//     display: flex;
//     flex-direction: row;
//     gap: 20px;
//     align-items: center;
//     width: 500px;
//     text-align: center;
//     border: 1px solid black;
//     `
// })


// const allListBlocks = document.querySelectorAll('li');
// allListBlocks.forEach(el => {
//     el.style.cssText += `
//     background-color: orange;
//     margin:  5px;
//     font-size: 12px;
//     color: white;
//     padding: 10px 15px;
//     display: flex;
//     // gap: 20px;
//     width: 500px;
//     border: 1px solid red;
// `
// }) 



// window.addEventListener('keydown',(ev)=>{   
//     if (role === 'player'){
//         if (
//             ev.code === 'KeyJ' || ev.code === 'KeyL' || 
//             ev.code === 'ArrowLeft' || ev.code === 'ArrowRight' || 
//             ev.code === 'Space' 
//         ) {
//             fetch('http://localhost:8080/keys-pressed', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ 
//                     type: 'move',
//                     gameId: gameId,
//                     key: ev.code  
//                 })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log("Server response:", data);
//             })
//             .catch(error => {
//                 console.error("Error sending key press to server:", error);
//             });
//         }
//     }
// })


// backImage.onload = function() {
//     updateGame();
// };


// // ---------------------------------------------------------------------

// Конфигурации игры

const fieldConfig = {
    xFields: Math.round(500 / 10),
    yFields: Math.round(500 / 10),
    fields: Math.round(500 / 10),
}


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
    counter: 0,
    max_score: 0,
    shipImgOption: "Ship 1",
    isRun: false
};


// Функции для управления игрой
const gameActions = {
    openGame() {
        webSocketHandler.sendMessage('openGame');
    },

    observeGame(selectedGameId) {
        if (gameState.isRun) {
            alert("Warning! You can not observe while you are playing the game!");
        } else if (selectedGameId !== webSocketHandler.gameId && selectedGameId !== webSocketHandler.gameIdObserver) {
            webSocketHandler.sendMessage('observe', { gameIdObserver: selectedGameId });
            uiElements.setObserverMode(selectedGameId);
            uiElements.backBtn.style.display = "block"
        }
    },

    restartGame() {
        if (webSocketHandler.gameId === null) {
            this.createNewGame();
        } else {
            webSocketHandler.sendMessage('restart');
            uiElements.showMessage("Restarted", 1);
        }
        gameState.isRun = true;
    },

    backToRoom() {
        webSocketHandler.ws.send(JSON.stringify({ type: 'player', gameId: webSocketHandler.gameId, gameIdObserver: webSocketHandler.gameIdObserver}));
        webSocketHandler.gameIdObserver = null
        uiElements.observerInfo.textContent = `You are in your room: ${webSocketHandler.gameId}`
        uiElements.restartBtn.style.display = 'block'
    },

    musicHandler() {
        gameConfig.music.toggleMusic();
        uiElements.musicBtn.textContent = gameConfig.music.isPlaying ? 'Pause Music' : 'Play Music';
    },

    debugHandler() {
        if (uiElements.debugBtn.textContent === 'Turn Debug Off'){
            uiElements.debugBtn.textContent = 'Turn Debug On'
            uiElements.debugDetailsList.style.display = 'none'
        }
        else{
            uiElements.debugBtn.textContent = 'Turn Debug Off'
            uiElements.debugDetailsList.style.display = 'block'
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
    }
};


// Элементы интерфейса
const uiElements = {
    gameList: document.createElement('ul'),
    observerInfo: document.createElement('p'),
    restartBtn: document.createElement('button'),
    backBtn: document.createElement('button'),
    musicBtn: document.createElement('button'),
    
    debugBtn: document.createElement('button'),
    debugDetailsList: document.createElement('ul'),
    laserInfoItem: document.createElement('li'),
    missileInfoItem: document.createElement('li'),
    
    messageBlock: document.createElement('h3'),
    scoreItem: document.createElement('p'),
    speedItem: document.createElement('p'),
    maxScore: document.createElement('p'),

    shipSelect: document.createElement('select'),

    registrationForm: document.createElement('form'),
    loginForm: document.createElement('form'),
    showUsersBtn: document.createElement('button'),
    usersList: document.createElement('ul'),

    initialize() {
        document.body.appendChild(this.gameList);
        document.body.appendChild(this.observerInfo);
        document.body.appendChild(this.messageBlock);

        this.restartBtn.textContent = 'Start Game';
        this.restartBtn.onclick = gameActions.restartGame;
        this.restartBtn.style.display = "block"
        document.body.appendChild(this.restartBtn);

        this.backBtn.textContent = 'Back to Your Room';
        this.backBtn.style.display = "none"
        this.backBtn.onclick = gameActions.backToRoom;
        document.body.appendChild(this.backBtn);

        this.musicBtn.textContent = 'Play Music';
        this.restartBtn.style.display = "block"
        this.musicBtn.onclick = gameActions.musicHandler;
        document.body.appendChild(this.musicBtn);

        this.debugBtn.textContent = 'Turn Debug On';
        this.debugBtn.style.display = "block"
        this.debugBtn.onclick = gameActions.debugHandler;
        this.debugDetailsList.style.display = 'none'
        this.laserInfoItem.textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates:`
        this.missileInfoItem.textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates:`
        document.body.appendChild(this.debugBtn);
        document.body.appendChild(this.debugDetailsList);
        this.debugDetailsList.appendChild(this.laserInfoItem);
        this.debugDetailsList.appendChild(this.missileInfoItem);

        document.body.appendChild(this.scoreItem);
        document.body.appendChild(this.speedItem);
        document.body.appendChild(this.maxScore);

        this.initShipOptions()
        this.shipSelect.style.display = 'block'
        this.shipSelect.onchange = gameActions.shipImageHandler.bind(this);
        document.body.appendChild(this.shipSelect);

        this.createRegistrationForm();
        this.createLoginForm();

        this.showUsersBtn.textContent = 'Show Registered Users';
        this.showUsersBtn.onclick = this.displayUsers.bind(this);
        document.body.appendChild(this.showUsersBtn);
        document.body.appendChild(this.usersList);
    },

    displayUsers() {
        fetch('/get-users')
        .then(response => response.json())
        .then(users => {
            this.usersList.innerHTML = '';

            users.forEach(user => {
                const listItem = document.createElement('li');
                listItem.textContent = `Name: ${user.name}, Email: ${user.email}`;

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => this.deleteUser(user.name);
                listItem.appendChild(deleteBtn);

                this.usersList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
    },

    nonAdminDisplayUsers(){
        this.showUsersBtn.style.display = 'none'
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
            this.shipSelect.appendChild(option);
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
        

        // this.registrationForm.append(emailInput, nameInput, passwordInput, confirmPasswordInput, registerButton);
        // this.registrationForm.addEventListener("submit", this.handleRegistration.bind(this));
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

        console.log("NAME: ", name)

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
                webSocketHandler.name = name
                this.hideRegistrationForm()
                alert(`${data.message}`);
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => console.error('Registration error:', error));
    },


    handleLogin(name, password) {
        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password, gameId: webSocketHandler.gameId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                webSocketHandler.name = name
                this.hideRegistrationForm()
                alert(`${data.message}`);
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => console.error('Login error:', error));
    },


    invisibleRestartBtn() {
        this.restartBtn.style.display = "none"
    },

    visibleRestartBtn() {
        this.restartBtn.style.display = "block"
    },

    updateGameList(games) {
        this.gameList.innerHTML = '';
        games.forEach(game => {
            const listItem = document.createElement('li');
            listItem.textContent = game === webSocketHandler.gameId ? `Your own room: ${game}` : game;
            listItem.style.cursor = game === webSocketHandler.gameId ? 'cursor' : 'pointer';;
            listItem.style.color = game === webSocketHandler.gameId ? 'orange' : 'green';
            listItem.style.textDecoration = game === webSocketHandler.gameId ? 'none' : 'underline';
            listItem.onclick = () => gameActions.observeGame(game);
            this.gameList.appendChild(listItem);
        });
    },

    showEndGameMessage(newMaxScore) {
        this.showMessage(newMaxScore ? "Game Over! New Max Score" : "Game Over", 2);
        if (webSocketHandler.role === 'player') this.restartBtn.style.display = 'block';
    },

    showMessage(message, mode) {
        this.messageBlock.textContent = message;
        this.messageBlock.style.display = 'block';

        if (mode === 1) {
            this.messageBlock.style.backgroundColor = 'orange';
            this.messageBlock.style.color = 'white';
            this.messageBlock.style.border = '1px solid red';
            setTimeout(() => this.messageBlock.style.display = 'none', 5000);
        } else if (mode === 2) {
            this.messageBlock.style.backgroundColor = 'red';
            this.messageBlock.style.color = 'white';
            this.messageBlock.style.border = '1px solid orange';
        }
    },

    updateScoreInfo() {
        this.maxScore.textContent = `Max Score: ${gameState.max_score}`;
        this.scoreItem.textContent = `Score: ${gameState.score >= 10 ? gameState.score - 10 : gameState.score}`;
        this.speedItem.textContent = `Speed: ${gameState.speed} mls`;
    },

    updateDebugInfo() {
        let debugInfo = gameActions.getCoordinates()
        this.laserInfoItem.textContent = `Amount of the active lasers ${gameState.lasers.length} ~ Coordinates: ${debugInfo[0].join(", ")}`
        this.missileInfoItem.textContent = `Amount of the active missiles ${gameState.missiles.length} ~ Coordinates: ${debugInfo[1].join(", ")}` 
    },

    updateShipImage() {
        gameConfig.images.shipImg.src = gameConfig.shipImages[gameState.shipImgOption];
    },

    setObserverMode(selectedGameId) {
        this.observerInfo.textContent = `You are observing room ${selectedGameId}`;
        this.restartBtn.style.display = 'none';
    }
};
uiElements.initialize();


// Функции для отрисовки
const displayHandler = {
    canvas: document.createElement('canvas'),
    ctx: null,

    initialize() {
        this.canvas.width = 500;
        this.canvas.height = 500;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        // gameConfig.calculateCenter(this.canvas.width, this.canvas.height, 10);
        this.updateGame();
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
displayHandler.initialize();

// Объект для работы с WebSocket
const webSocketHandler = {
    ws: new WebSocket('ws://localhost:8082'),
    gameId: localStorage.getItem('sessionId'),
    gameIdObserver: null,
    role: null,
    name: null,

    initialize() {
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
                    console.log("name: ", this.name)
                    if (this.name !== null) uiElements.hideRegistrationForm()
                    console.log("NAMEANE:", this.name )
                    if (this.name !== 'admin') uiElements.nonAdminDisplayUsers()
                }
                break;

            case 'back game':
                this.role = message.role;
                if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
                uiElements.backBtn.style.display = "none"
                break;

            case 'update':
                if (message.gameState !== undefined) Object.assign(gameState, message.gameState);
                break;

            case 'gameList':
                uiElements.updateGameList(message.games);
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
                uiElements.restartBtn.style.display = "none"
                break;
        }

        uiElements.updateShipImage();
    }
};
webSocketHandler.initialize();

// Обработчик нажатия клавиш
// Обработчик нажатий кнопок с использованием HTTP-запросов
window.addEventListener('keydown', (event) => {
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


