var xFields = 59;
var yFields = 59;
var fields = 59;

var mid = {
    x: (xFields-1)/2,
    y: (yFields-1)/2
};

// var mid = {
//     x: 500 / 10 / 2,
//     y: 500 / 10 / 2
// };





function rotateShip(rotation, rSh) {
    if(rotation > 0) rSh = (rSh+1)%8;
    else if(rotation < 0) {
        if(rSh===0) rSh = 7;
        else rSh = rSh - 1;
    }
    return rSh   
}


function random(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function addMissile(missiles) {
    var rand = random(0,7);
    // 7 0 1
    // 6   2
    // 5 4 3
    if(rand === 0) missiles.push({x: mid.x, y: 0});
    else if(rand === 1) missiles.push({x: xFields-1, y: 0});
    else if(rand === 2) missiles.push({x: xFields-1, y: mid.y});
    else if(rand === 3) missiles.push({x: xFields-1, y: yFields-1});
    else if(rand === 4) missiles.push({x: mid.x, y: yFields-1});
    else if(rand === 5) missiles.push({x: 0, y: yFields-1});
    else if(rand === 6) missiles.push({x: 0, y: mid.y});
    else if(rand === 7) missiles.push({x: 0, y: 0});
    return missiles
}


function endGame (game, users) {
    clearInterval(game.ival);

    let user = null
    const name = game.name
    console.log("--------END GAME--------")

    console.log("Users:", users)

    console.log("User:", user)
    console.log("Name:", name)

    if (users && name) {
        console.log("OK")
        user = users.find(u => u.name === name);
        console.log("USER2:", user)
    }

    if (game.gameState.score > game.gameState.max_score) {
        game.gameState.max_score = game.gameState.score
        if (user) user.maxScore = game.gameState.max_score
        console.log("NEW Max Score")
    }
    if (game.gameState.speed < game.gameState.max_speed) {
        game.gameState.max_speed = game.gameState.speed
        if (user) user.maxSpeed = game.gameState.max_speed
        console.log("NEW Max Speed")
    }
    if (user && user.shipImgOption !== game.gameState.shipImgOption){
        user.shipImgOption = game.gameState.shipImgOption
        console.log("NEW Ship Img")
    }

    console.log("User:", user)

    console.log("----------------------")

    game.gameState.isRun = false
    game.ws.send(JSON.stringify({
        type: 'endgame',
        gameState: game.gameState,
    }));
}

function moveMissiles(missiles, game, users) {
    for (let i = 0; i < missiles.length; i++) {
        const missile = missiles[i];
        const m = (missile.y - mid.y) / (missile.x - mid.x);
        const b = missile.y - (m * missile.x);

        if (missile.x === mid.x) {
            if (missile.y > mid.y) missiles[i] = { x: missile.x, y: missile.y - 1 };
            else missiles[i] = { x: missile.x, y: missile.y + 1 };
        } else if (missile.y === mid.y) {
            if (missile.x < mid.x) missiles[i] = { x: missile.x + 1, y: missile.y };
            else missiles[i] = { x: missile.x - 1, y: missile.y };
        } else {
            let retX = missile.x;
            let retY = missile.y;
            if (missile.y < mid.y) retY++;
            else retY--;
            if (missile.x < mid.x) retX++;
            else retX--;
            missiles[i] = { x: retX, y: retY };
        }
    }

    if (collision(missiles)) {
        endGame(game, users);
    }
}


function collision(missiles) {
    for(var i=0;i<missiles.length;i++){
        var missile = missiles[i];
        if(missile.x === mid.x+1 || missile.x === mid.x-1 || missile.y === mid.y+1 || missile.y === mid.y-1) {
            return true;
        }
    }
    return false;
}


function addLaser(lasers, rShip) {
    // 7 0 1
    // 6   2
    // 5 4 3
    let retObj = {x: mid.x, y: mid.y, r: rShip};
    
    if(rShip === 0)      { retObj.y = mid.y-2; }
    else if(rShip === 1) { retObj.x = mid.x+2; retObj.y = mid.y-2; }
    else if(rShip === 2) { retObj.x = mid.x+2; }
    else if(rShip === 3) { retObj.x = mid.x+2; retObj.y = mid.y+2; }
    else if(rShip === 4) { retObj.y = mid.y+2; }
    else if(rShip === 5) { retObj.x = mid.x-2; retObj.y = mid.y+2; }
    else if(rShip === 6) { retObj.x = mid.x-2; }
    else if(rShip === 7) { retObj.x = mid.x-2; retObj.y = mid.y-2; }
    
    lasers.push(retObj);
    return lasers
}


function moveLasers(lasers, missiles) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        
        if (laser.r === 0)       { laser.y--; }
        else if (laser.r === 1)  { laser.x++; laser.y--; }
        else if (laser.r === 2)  { laser.x++; }
        else if (laser.r === 3)  { laser.x++; laser.y++; }
        else if (laser.r === 4)  { laser.y++; }
        else if (laser.r === 5)  { laser.x--; laser.y++; }
        else if (laser.r === 6)  { laser.x--; }
        else if (laser.r === 7)  { laser.x--; laser.y--; }


        if (laser.x < 0 || laser.x >= fields || laser.y < 0 || laser.y >= fields) {
            lasers.splice(i, 1);
            continue;
        }


        for (let j = missiles.length - 1; j >= 0; j--) {
            const missile = missiles[j];
            
            if (
                (missile.x === laser.x || missile.x === laser.x + 1 || missile.x === laser.x - 1) &&
                (missile.y === laser.y || missile.y === laser.y + 1 || missile.y === laser.y - 1)
            ) {
                lasers.splice(i, 1);    
                missiles.splice(j, 1);  
                break;                  
            }
        }
    }
}



function startGame(game, users) {
    game.ival = setInterval(() => {
        game.gameState.isRun=true;
        moveMissiles(game.gameState.missiles, game, users);
        moveLasers(game.gameState.lasers, game.gameState.missiles);
        game.gameState.counter++;
        game.gameState.score += 10;

        if (game.gameState.counter % 5 === 0) addMissile(game.gameState.missiles);

        if (game.gameState.counter % 20 === 0) {
            clearInterval(game.ival);
            game.gameState.speed = Math.round(game.gameState.speed / 2);
            startGame(game, users);
        }

        broadcastGameState(game)

    }, game.gameState.speed);

}


function restartFunc(game, gameState, users){
    clearInterval(game.ival)
    gameState.missiles = []
    gameState.lasers = []
    gameState.speed = 1000
    gameState.score = 0
    gameState.counter = 0
    startGame(game, users)
}



function broadcastGameState(game) {
    const stateMessage = JSON.stringify({ type: 'update', gameState: game.gameState });
    game.ws.send(stateMessage)
    game?.observers.forEach((observer) => observer.send(stateMessage))
}






module.exports = {
    rotateShip,
    addLaser,
    startGame,
    restartFunc,
    broadcastGameState,
}