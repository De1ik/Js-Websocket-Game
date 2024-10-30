// var xFields = 59;
// var yFields = 59;
// var fields = 59;

// var mid = {
//     x: (xFields-1)/2,
//     y: (yFields-1)/2
// };


// var xShip = mid.x;
// var yShip = mid.y;
// var rShip = 0;
// var shipCenter = [
//     [xShip-1,yShip-1],[xShip,yShip-1],[xShip+1,yShip-1],
//     [xShip-1,yShip],[xShip,yShip],[xShip+1,yShip],
//     [xShip-1,yShip+1],[xShip,yShip+1],[xShip+1,yShip+1]
// ];



// function random(min,max) {
//     return Math.floor(Math.random() * (max - min + 1) + min);
// }

// var missiles = [];
// function addMissile() {
//     var rand = random(0,7);
//     // 7 0 1
//     // 6   2
//     // 5 4 3
//     if(rand === 0) missiles.push({x: mid.x, y: 0});
//     else if(rand === 1) missiles.push({x: xFields-1, y: 0});
//     else if(rand === 2) missiles.push({x: xFields-1, y: mid.y});
//     else if(rand === 3) missiles.push({x: xFields-1, y: yFields-1});
//     else if(rand === 4) missiles.push({x: mid.x, y: yFields-1});
//     else if(rand === 5) missiles.push({x: 0, y: yFields-1});
//     else if(rand === 6) missiles.push({x: 0, y: mid.y});
//     else if(rand === 7) missiles.push({x: 0, y: 0});
// }



// function moveMissiles() {
//     // calculate new possitions
//     missiles = missiles.map(missile => {
//         var m = (missile.y - mid.y) / (missile.x - mid.x);
//         var b = missile.y - (m * missile.x);

//         if(missile.x === mid.x) {
//             if(missile.y > mid.y) return {x: missile.x, y: missile.y-1};
//             else return {x: missile.x, y: missile.y+1};
//         }
//         else if(missile.y === mid.y) {
//             if(missile.x < mid.x) return {x: missile.x+1, y: missile.y};
//             else return {x: missile.x-1, y: missile.y};
//         }
//         else {
//             let retX = missile.x;
//             let retY = missile.y;
//             if(missile.y < mid.y) retY++;
//             else retY--;
//             if(missile.x < mid.x) retX++;
//             else retX--;
//             return {x: retX, y: retY};
//         }
//     });

//     if(collision()){
//         endGame();
//     }
// }


// function collision() {
//     for(var i=0;i<missiles.length;i++){
//         var missile = missiles[i];
//         if(missile.x === mid.x+1 || missile.x === mid.x-1 || missile.y === mid.y+1 || missile.y === mid.y-1) {
//             return true;
//         }
//     }
//     return false;
// }

// let lasers = []
// function addLaser() {
//     // 7 0 1
//     // 6   2
//     // 5 4 3
//     let retObj = {x: mid.x, y: mid.y, r: rShip};
    
//     if(rShip === 0)      { retObj.y = mid.y-2; }
//     else if(rShip === 1) { retObj.x = mid.x+2; retObj.y = mid.y-2; }
//     else if(rShip === 2) { retObj.x = mid.x+2; }
//     else if(rShip === 3) { retObj.x = mid.x+2; retObj.y = mid.y+2; }
//     else if(rShip === 4) { retObj.y = mid.y+2; }
//     else if(rShip === 5) { retObj.x = mid.x-2; retObj.y = mid.y+2; }
//     else if(rShip === 6) { retObj.x = mid.x-2; }
//     else if(rShip === 7) { retObj.x = mid.x-2; retObj.y = mid.y-2; }
    
//     lasers.push(retObj);
// }


// function moveLasers() {
//     // move lasers
//     lasers = lasers.map(laser => {
//         if(laser.r === 0)      { laser.y--; }
//         else if(laser.r === 1) { laser.x++; laser.y--; }
//         else if(laser.r === 2) { laser.x++; }
//         else if(laser.r === 3) { laser.x++; laser.y++; }
//         else if(laser.r === 4) { laser.y++; }
//         else if(laser.r === 5) { laser.x--; laser.y++; }
//         else if(laser.r === 6) { laser.x--; }
//         else if(laser.r === 7) { laser.x--; laser.y--; }
//         return laser;
//     });

//     lasers = lasers.filter(laser => {
//         if(laser.x < 0) return false;
//         else if(laser.x > fields-1) return false;
//         else if(laser.y < 0) return false;
//         else if(laser.y > fields-1) return false;
        
//         let laserXMissile = false;
//         let removes = [];
//         for(var i=0;i<missiles.length;i++) {
//             var missile = missiles[i];
//             if(
//                 (missile.x === laser.x || missile.x === (laser.x + 1) || missile.x === (laser.x - 1)) &&
//                 (missile.y === laser.y || missile.y === (laser.y + 1) || missile.y === (laser.y - 1))
//             ) {
//                 laserXMissile = true;
//                 removes.push(i);
//                 break;
//             }
//         }

//         if(removes.length > 0) {
//             removes.forEach(remove => {
//                 missiles.splice(remove,1);
//             });
//         }

//         return !laserXMissile;
//     });
// }

// var counter = 0;
// var ival = null;
// var speed = 1000;
// var score = 0;
// var incrementScore = (hm) => {
//     score = score + hm;
// };

// var startGame = () => {
//     score = 0;
//     mainLoop();
// };

// var mainLoop = () => {
//     ival = setInterval(()=>{
//         moveMissiles();
//         moveLasers();
//         counter++;
//         incrementScore(10);
//         if(counter%5===0) addMissile();
//         if(counter%20===0) {
//             clearInterval(ival);
//             speed = Math.round(speed / 2);
//             mainLoop();
//         }
//     },speed);
// };

// window.addEventListener('start',startGame);
// let preGame = () => {
//     var countdown = 5;
//     for(var i=0;i<countdown;i++) {
//         ((i)=>{
//             setTimeout(()=>{
// //                 console.log(countdown-i);
//             },i*1000);
//         })(i);
//     }
//     setTimeout(()=>{
//         startGame();
//     },(countdown+1)*1000);
// };
// preGame();

// var endGame = function() {
//     clearInterval(ival);
// }





