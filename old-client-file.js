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