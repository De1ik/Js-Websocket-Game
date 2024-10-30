/**
 * u1 - Artem Delikatnyi
 */


const socket = new WebSocket('ws://localhost:8080');




const modeDiv = document.createElement('div')
modeDiv.style.cssText = `
width: 500px;
flex-direction: column; 
display: flex;
justify-content: center;
align-items: center;
`
document.body.appendChild(modeDiv)


const divDetailsInfo = document.createElement('div')
const messageBlock = document.createElement('h3')
// messageBlock.visibility = 'hidden'
// messageBlock.display = 'none'
const divAllButtons = document.createElement('div')
const divAllLinks = document.createElement('div')
divAllButtons.style.cssText = 
`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 200px;
    margin-bottom: 10px;
`


modeDiv.appendChild(divDetailsInfo)
modeDiv.appendChild(messageBlock)
modeDiv.appendChild(divAllButtons)
modeDiv.appendChild(divAllLinks)
// ---------------------------------New Keys-----------------------------------------------
window.addEventListener('keydown',(ev)=>{
    fetch('http://localhost:8080/keys-pressed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: ev.code }),
    })
        .then(response => response.json())
          .then(data => {
            if (data === 'left') rotateShip(-1)
            else if(data === 'right') rotateShip(1)
            console.log('new_move: ', data); 
          })
          .catch(error => console.error('Error:', error));    
})
// --------------------------------------------------------------------------------

function deleteLasers() {
}

// // ----------------------------------- restart ------------------------------------
function restartFunc(){
    restartBtn.disabled = true
    restartBtn.style.visibility = 'hidden'
    clearInterval(ival)
    deleteMissiles()
    missiles = []
    lasers = []
    speed = 1000
    score = 0
    counter = 0
    preGame()
    showMessage(messageBlock, "Restarted", 1)
    displayShip()
}

const restartBtn = document.createElement('button')
restartBtn.textContent = 'Restart'
restartBtn.style.cssText = `background-color: red;`
restartBtn.disabled = true
restartBtn.style.visibility = 'hidden'
divAllButtons.appendChild(restartBtn)
restartBtn.addEventListener('click', restartFunc)
// -------------------------------------------------------------------------------------

// --------------------------------------- Music -----------------------------------------
const musicSound = document.createElement('audio')
musicSound.src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
musicSound.loop = true
document.body.appendChild(musicSound)


let isMusic = false
const musicButton = document.createElement('button')
musicButton.textContent = 'Turn Music On'
musicButton.style.cssText =`background-color: purple;`
divAllButtons.appendChild(musicButton)

musicButton.addEventListener('click', () => {
    if (isMusic){
       musicSound.pause() 
       musicButton.textContent = 'Turn Music On'
    }
    else {
        musicSound.play() 
        musicButton.textContent = 'Turn Music Off'
    }
    isMusic = !isMusic
})
// ------------------------------------------------------------------------------------------

// ----------------------------------- Message ------------------------------------------------
messageBlock.style.cssText = `
padding: 20px;
border-radius: 10px;
width: 400px;
text-align: center;
font-size: 16px;
`
messageBlock.style.display = 'none'


function showMessage(block, message, mode){
    block.textContent = message
    block.style.display = 'block';

    if (mode == 1){
        block.style.cssText += `
            background-color: orange;
            color: white;
            border: 1px solid red;
        `

        setTimeout(() => {
            block.style.display = 'none';
        }, 5000);
    }
    else if (mode == 2){
        block.style.cssText += `
        background-color: red;
        color: white;
        border: 1px solid orange;
        `
    }
}
// -----------------------------------------------------------------------------------------

//------------------------------------- debug section ------------------------------------
function getCoordinates(){
    laserCord = []
    missiesCord = []

    lasers.forEach(laser => {
        laserCord.push(`[${laser.x}, ${laser.y}]`)
    })
    missiles.forEach(missile => {
        missiesCord.push(`[${missile.x}, ${missile.y}]`)
    })

    return [laserCord, missiesCord]
}
let isDebug = false
const debugButton = document.createElement('button')
debugButton.textContent = 'Turn Debug On'
debugButton.style.cssText = 
`
background-color: orange;
border: 1px solid red;
margin-top: 30px;
`
divAllButtons.appendChild(debugButton)


const debugDetails = document.createElement('ul')
const laserInfo = document.createElement('li')
const missileInfo = document.createElement('li')

laserInfo.textContent = `Amount of the active lasers ${lasers.length} ~ Coordinates:`
missileInfo.textContent = `Amount of the active missiles ${missiles.length} ~ Coordinates:`

debugDetails.style.display = 'none'
modeDiv.appendChild(debugDetails)
debugDetails.appendChild(laserInfo)
debugDetails.appendChild(missileInfo)


debugButton.addEventListener('click', () => {
    if (isDebug){
        debugButton.textContent = 'Turn Debug On'
        debugDetails.style.display = 'none'
    }
    else{
        debugButton.textContent = 'Turn Debug Off'
        debugDetails.style.display = 'block'
    }
    isDebug = !isDebug
})
// -------------------------------------------------------------------------------


// ----------------------------------- details info ----------------------------------------
const scoreItem = document.createElement('p')
const speedItem = document.createElement('p')

scoreItem.style.cssText = `
        display: flex;
        flex-direction: row;
        gap: 20px;
        align-items: center;
    `;

scoreItem.textContent = `Score: ${score}`
speedItem.textContent = `Speed: ${speed}`

divDetailsInfo.appendChild(scoreItem)
divDetailsInfo.appendChild(speedItem)


function monitorDetailsChange() {
    setInterval(() => {
        scoreItem.textContent = `Score: ${score}`
        speedItem.textContent = `Speed: ${speed} mls`
        let debugInfo = getCoordinates()
        laserInfo.textContent = `Amount of the active lasers ${lasers.length} ~ Coordinates: ${debugInfo[0].join(", ")}`
        missileInfo.textContent = `Amount of the active missiles ${missiles.length} ~ Coordinates: ${debugInfo[1].join(", ")}`
    }, speed)
}
// ---------------------------------------------------------------------------------------



// -----------------------------------------EndGame---------------------------------------
var endGame = function() {
    clearInterval(ival);
    showMessage(messageBlock, "Game Over", 2)
    restartBtn.disabled = false;
    restartBtn.style.visibility = 'visible';
}
// ---------------------------------------------------------------------------------------

// -------------------------------------- canvas ----------------------------------

const gameBlock = document.getElementById('game');
gameBlock.style.cssText =`        
    float: left;
    width: 500px;
    gap: 20px;
    align-items: center;
    margin: 0 40px
    `
const tableBlock = gameBlock.querySelector('table');
gameBlock.removeChild(tableBlock)
const canvas = document.createElement('canvas');
canvas.width = 500
canvas.height = 500
gameBlock.appendChild(canvas);
const ctx = canvas.getContext('2d');

numberOfBlocks = 59
const blockSize = canvas.width / numberOfBlocks

const backImage = new Image();
backImage.src = 'https://opengameart.org/sites/default/files/back_2.png'

const asteroidImg = new Image();
asteroidImg.src='https://opengameart.org/sites/default/files/1346943991.png'

const laserImg = new Image();
laserImg.src='https://opengameart.org/sites/default/files/planet_glass.png'

const shipImg = new Image();
shipImg.src='https://opengameart.org/sites/default/files/surt2.png'


function displayShip() {
    shipRotations[rShip].points.forEach(point => {
        var tmpX = shipCenter[point][0];
        var tmpY = shipCenter[point][1];
        ctx.drawImage(shipImg, tmpX * blockSize, tmpY * blockSize, blockSize, blockSize);
    });
    var point = shipRotations[rShip].rpg;
    var tmpX = shipCenter[point][0];
    var tmpY = shipCenter[point][1];
    ctx.drawImage(shipImg, tmpX * blockSize, tmpY * blockSize, blockSize, blockSize);
}


function displayMissiles() {
    missiles.forEach(missile => {
        // displayPoint(missile.x,missile.y,'green');
        ctx.drawImage(asteroidImg, missile.x * blockSize, missile.y * blockSize, blockSize, blockSize);
    });
}


function displayPoint(image, x, y) {
    // ctx.drawImage(image, x * blockSize, y * blockSize, blockSize, blockSize);
}

function deletePoint(x,y) {
    // ctx.clearRect(x * blockSize, y * blockSize, blockSize, blockSize);
}


function displayLasers() {
    lasers.forEach(laser => {
        // displayPoint(laser.x, laser.y, 'blue');
        ctx.drawImage(laserImg, laser.x * blockSize, laser.y * blockSize, blockSize, blockSize);
    });
}


function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backImage, 0, 0, canvas.width, canvas.height);
    displayLasers()
    displayShip()
    displayMissiles()

    deleteLasers();
    
    requestAnimationFrame(updateGame);
}

backImage.onload = function() {
    updateGame();
};


// --------------------------------------------------------------------------------

// ---------------------------------Add Links-----------------------------------------------
const backImageP = document.createElement('p')
backImageP.textContent = "Background image link: "
const backImageLink = document.createElement('a')
backImageLink.href = 'https://opengameart.org/content/space-background-1'
backImageLink.textContent = '(CC0 License)'
backImageLink.target = '_blank'
backImageP.appendChild(backImageLink)


const asteroidImgP = document.createElement('p')
asteroidImgP.textContent = "Asteroid image link: "
const asteroidImgLink = document.createElement('a')
asteroidImgLink.href = 'https://opengameart.org/content/asteroid-generator-and-a-set-of-generated-asteroids'
asteroidImgLink.textContent = '(CC0 License)'
asteroidImgLink.target = '_blank'
asteroidImgP.appendChild(asteroidImgLink)


const laserImgP = document.createElement('p')
laserImgP.textContent = "Laser image link: "
const laserImgLink = document.createElement('a')
laserImgLink.href = 'https://opengameart.org/content/two-planet-pictures'
laserImgLink.textContent = '(CC0 License)'
laserImgLink.target = '_blank'
laserImgP.appendChild(laserImgLink)


const shipImgP = document.createElement('p')
shipImgP.textContent = "Ship image link: "
const shipImgLink = document.createElement('a')
shipImgLink.href = 'https://opengameart.org/content/cc0-ships-surt-part2artcom'
shipImgLink.textContent = '(CC0 License)'
shipImgLink.target = '_blank'
shipImgP.appendChild(shipImgLink)


const musicP = document.createElement('p')
musicP.textContent = "Music link: "
const musicLink = document.createElement('a')
musicLink.href = 'https://www.soundhelix.com'
musicLink.textContent = 'Music from SoundHelix (CC0 License)'
musicLink.target = '_blank'
musicP.appendChild(musicLink)



divAllLinks.appendChild(backImageP)
divAllLinks.appendChild(asteroidImgP)
divAllLinks.appendChild(laserImgP)
divAllLinks.appendChild(shipImgP)
divAllLinks.appendChild(musicP)
// --------------------------------------------------------------------------------


// ---------------------------------------------Styles-----------------------------------
const allButtons = document.querySelectorAll('button');

allButtons.forEach(btn => {
    btn.style.cssText+=
    `
    cursor: pointer;
    font-size: 12px;
    color: white;
    border: none;
    border-radius: 15px;
    padding: 15px 20px;
    
    `
})

const detailsParagraph = document.querySelectorAll('p');

detailsParagraph.forEach(p => {
    p.style.cssText+=
    `
    background-color: green;
    font-size: 12px;
    color: white;
    padding: 10px 15px;
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    width: 500px;
    text-align: center;
    border: 1px solid black;
    `
})


const allListBlocks = document.querySelectorAll('li');
allListBlocks.forEach(el => {
    el.style.cssText += `
    background-color: orange;
    margin:  5px;
    font-size: 12px;
    color: white;
    padding: 10px 15px;
    display: flex;
    // gap: 20px;
    width: 500px;
    border: 1px solid red;
`
}) 
// ----------------------------------------------------------------------------------------

monitorDetailsChange()