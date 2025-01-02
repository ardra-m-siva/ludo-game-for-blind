let playerNo = 0; // (red = 1, green = 2, yellow = 3, blue = 4)
let playerName = null; // store default playerName
let diceBoxId = null; // store id value of dice box
let preDiceBoxId = null; // store id value of previous diceBoxId
let rndmNo = null; // generate rndmNo after dice is roll
let countSix = 0;
let cut = false;
let pass = false;
let flag = false;
let noOfPlayer = 4; // by default 4 player
let winningOrder = [];
let sound = true;// by default sound is on
let audioPlayed=false;//used to play music at the beginning of the game 

//      ALL Audio Variables

let rollAudio = new Audio("music/diceRollingSound.mp3");
let openAudio = new Audio("music/openingOfPawn.mp3");//not goood
let safeAudio = new Audio("music/star.mp3");
let jumpAudio = new Audio("music/pawn.mp3");//not much good but better
let cutAudio = new Audio("music/lose.wav");
let passAudio = new Audio("music/pass-sound.mp3");
let winAudio = new Audio("music/win-sound.mp3");
let startAudio=new Audio("music/open-sound.wav");

/* ************      Variable Declaration End *************** */

/* ************    Object Declaration Start  *************** */

function Position(length) {
  for (let i = 1; i <= length; i++) {
    this[i] = [];
  }
}

function Player(startPoint, endPoint) {
  this.inArea = [];
  this.outArea = [];
  this.privateArea = [];
  this.winArea = [];
  this.startPoint = startPoint;
  this.endPoint = endPoint;
  this.privateAreaPos = new Position(5);
}

//setting the start point and end point of each player
let players = {
  rPlayer: new Player("out1", "out51"),
  gPlayer: new Player("out14", "out12"),
  yPlayer: new Player("out27", "out25"),
  bPlayer: new Player("out40", "out38"),
};

let outAreaPos = new Position(52); //Create Array for indiviual Posititon of size 52(number of boxes in outarea[white])

/* **************** Fuction Declartion Start *************** */

/* Switch Function */

function switchDiceBoxId() {
  let color;
  // switch the value of diceBoxId variable
  if (playerNo == 1) {
      diceBoxId = "#redDice";
      color = "red";
  } else if (playerNo == 2) {
      diceBoxId = "#greenDice";
      color = "green";
  } else if (playerNo == 3) {
      diceBoxId = "#yellowDice";
      color = "yellow";
  } else {//if(playerNo == 4) 
      diceBoxId = "#blueDice";
      color = "blue";
  }
  // Announce the color using text-to-speech
  announceColor(color);
}

function announceColor(color) {
  if ('speechSynthesis' in window) {
      const announcement = new SpeechSynthesisUtterance(` ${color} player's turn`);
      //let voices=window.speechSynthesis.getVoices();
      //announcement.voice=voices[2];
      announcement.rate=1.55;
      speechSynthesis.cancel();
      speechSynthesis.speak(announcement);
  } else {
      console.log(`It's ${color} player's turn.`);
  }
}

function switchPlayerName() {
  // switch the value of playerName variable
    (playerNo == 1 && (playerName = "rPlayer")) ||
    (playerNo == 2 && (playerName = "gPlayer")) ||
    (playerNo == 3 && (playerName = "yPlayer")) ||
    (playerNo == 4 && (playerName = "bPlayer"));
}

/* Get Function */

/*This function takes a string as input,and extracts a number from it. if value is "r3", it will return 3.*/
function getNoFromValue(value) {
  return +value.match(/\d+/);
}

/* This function takes a value as input and returns the first character of the input string.value is "r3",it will return "r"*/
function getColorFromValue(value) {
  return value.charAt(0);
}

function getRotateValue(color) {
  let rotate = null;
    (color == "g" && (rotate = "-45deg")) ||
    (color == "y" && (rotate = "-135deg")) ||
    (color == "b" && (rotate = "-225deg")) ||
    (color == "r" && (rotate = "-315deg"));

  return rotate;
}

function getUpdatedWHoutAreaPos(noInId) {
  let posLength = outAreaPos[noInId].length;
  let wh = [];
  if (posLength > 0) {
    wh[0] = 100 / posLength;
    wh[1] = 100 / posLength;
    for (const cValue of outAreaPos[noInId]) {
      $("." + cValue).css({
        width: wh[0] + "%",
        height: wh[1] + "%",
        display: "inline-block",
      });

    }
  }
  return wh;
}

function getUpdatedWHprivateAreaPos(noInId) {
  let wh = [];
  let privateAreaLength = players[playerName].privateAreaPos[noInId].length;

  if (privateAreaLength > 0) {
    wh[0] = 100 / players[playerName].privateAreaPos[noInId].length;
    wh[1] = 100 / players[playerName].privateAreaPos[noInId].length;
    for (const cValue of players[playerName].privateAreaPos[noInId]) {
      $("." + cValue).css({
        width: wh[0] + "%",
        height: wh[1] + "%",
        display: "inline-block",
      });
    }
  }
  return wh;
}

function reUpdateOutAreaWH(...classArr) {
  for (const classV of classArr) {
    let theId = $("." + classV)
      .parent().attr("id");
    let noInId = getNoFromValue(theId);
    getUpdatedWHoutAreaPos(noInId);
  }
}

function reUpdatePrivateAreaWH(...classArr) {
  for (const classV of classArr) {
    let theId = $("." + classV)
      .parent()
      .attr("id");
    let noInId = getNoFromValue(theId);
    getUpdatedWHprivateAreaPos(noInId);
  }
}

/* Check Function  */

//check if the id equates to 52 or not
function check52(id) {
  if (getNoFromValue(id) == 52) return true; 

  return false;
}

//this function determines given id represents the endpoint of the out area for the current player.
function checkOutAreaEnd(id) {
  if (getNoFromValue(id) == getNoFromValue(players[playerName].endPoint)) {//getNoFromValue(id) represents current position of player
    return true;
  }
  return false;
}

//function is used to determine whether a given id represents the endpoint of the private area for a player.
function checkprivateAreaEnd(id) {
  if (getNoFromValue(id) == 5) {//number of private area for each player is 5
    return true;
  }
  return false;
}

/* Add and Remove funtion */

/*ensures that any glowing effect applied to elements within the specified areas for current player is removed 
by removing the "glow" class from those elements.*/
function removeAllGlow(...area) {
  for (const areaValue of area) {
    for (const classValue of players[playerName][areaValue]) {
      $("." + classValue).removeClass("glow");
    }
  }
}

// removes all event handlers attached to elements within the specified areas for the current player.
function removeAllEvent(...area) {
  for (const areaValue of area) {
    for (const classValue of players[playerName][areaValue]) {
      $("." + classValue).off();
    }
  }
}

//adds a new value (addValue) to the specified area (areaName) for the specified player (pName).
function addToArea(addValue, pName, areaName) {
  players[pName][areaName].push(addValue);
}

//removes a specific value from the specified areafor the specified player (pName).
function removeFromArea(removeValue, pName, areaName) {
  let newArr = [];
  for (const classValue of players[pName][areaName]) {
    if (classValue != removeValue) {
      newArr.push(classValue);
    }
  }
  players[pName][areaName] = newArr;
}

/*removes a specific classValue from the private area position (privateAreaPos) of a player (pName) at a given position (posValue)*/
function removeFromPrivateAreaPos(posValue, classValue, pName) {
  let newPrivateAreaPosArr = [];
  for (const cValue of players[pName].privateAreaPos[posValue]) {
    if (cValue != classValue) {
      newPrivateAreaPosArr.push(cValue);
    }
  }
  players[pName].privateAreaPos[posValue] = newPrivateAreaPosArr;
}

/*adds a classValue to the private area position (privateAreaPos) of a player (pName) at a given position (posValue). */
function addToPrivateAreaPos(posValue, classValue, pName) {
  players[pName].privateAreaPos[posValue].push(classValue);
}

//adds a classValue to the out area position (outAreaPos) at a given position (posValue).
function addToOutAreaPos(posValue, classValue) {
  outAreaPos[posValue].push(classValue);
}

//designed to remove a specific game piece (classValue) from a particular position (posValue) in the outer area 
function removeFromOutAreaPos(posValue, classValue) {
  let newPosArr = [];
  for (const cValue of outAreaPos[posValue]) {
    if (cValue != classValue) {
      newPosArr.push(cValue);
    }
  }
  outAreaPos[posValue] = newPosArr;
}

/* Main Funtion */

function  nextPlayer() {
  if(!audioPlayed){
    // Play the audio when the page loads
    startAudio.play();
    audioPlayed=true;
  }

  // It checks if the game has reached its end by comparing the length of the winningOrder array with the total number of players minus one
  if (winningOrder.length == noOfPlayer - 1) {
    setTimeout(function () {//if true, it schedules a restart of the game after 1 second 
      restartGame();
    }, 1000);
    return;
  }

  //If playerNo reaches 4 (players are numbered from 0 to 3), it resets to 0, looping back to the first player.
  if (playerNo == 4) playerNo = 0;

  /*If the dice roll was not a 5 and neither cut nor pass actions were performed, "why 5?  '.'  random number is generate from 0-5 ,
  5 represent a six on the dice "
  or if the same player has rolled a six three times in a row, it increments the player number and resets some variables */
  if ((rndmNo != 5 && cut != true && pass != true) || countSix == 3) {
    playerNo++;
    countSix = 0;
    preDiceBoxId = null;
  }

  /*The next if statement checks if the player performed a cut or a pass action.the count of consecutive sixes is reset to 0,
   and the preDiceBoxId is set to null.pass&cut set as false*/
  if (cut == true || pass == true) {
    countSix = 0;
    preDiceBoxId = null;
    pass = false;
    cut = false;
  }

//a dice box was active during the player's turn. the "showDice" class is removed from the respective dice box, hiding the dice.
  if (diceBoxId != null) $(diceBoxId).removeClass("showDice");
  switchDiceBoxId();
  switchPlayerName();
  //areaLengthAnnounce();----------------------------------------------------------------------------------------------------------------note

  /*If the player has all their pieces in the win area, the turn ends.
  If the player has no pieces in any of the game areas (inArea, outArea, privateArea), the turn ends.*/
  if (
    players[playerName].winArea.length == 4 ||
    (players[playerName].inArea.length == 0 &&
      players[playerName].outArea.length == 0 &&  
      players[playerName].privateArea.length == 0)
  ) {
    if (rndmNo == 5) {
      rndmNo = null;
    }
    nextPlayer();
  } else if (
    players[playerName].inArea.length == 0 &&
    players[playerName].winArea.length == 0 &&
    players[playerName].outArea.length == 0 &&
    players[playerName].privateArea.length == 0
  ) {
    if (rndmNo == 5) {
      rndmNo = null;
    }
    nextPlayer();
  } else {
    $(diceBoxId).addClass("startDiceRoll");
    $(document).one("keydown.rollDice", handleKeyDown);

    function handleKeyDown(event){
      if(event.code==="Space"){ //Call the rollDice function on space bar key press
        rollDice(diceBoxId);
      }else{
        $(document).one("keydown.rollDice",handleKeyDown)
      }
    }
  } 
}

// rollDice(idvalue) receives idvalue as parameter which is a diceBoxId
function rollDice(idValue) {
  // variables represent position of the background image in the dice animation.
  let pX = 0;
  let pY = 0;

  $(idValue).removeClass("startDiceRoll").addClass("rollDice");//Add or remove classes to show the rolling animation of the dice.
  if (sound == true) {
    rollAudio.play();
    rollAudio.playbackRate = 3.2;
  }

   /*Increment pX to move the background position of the dice horizontally. If pX reaches 100,
    reset it to 0 and increment pY to move the background position vertically.
   Update the CSS properties of the dice element to change its background position based on pX and pY.*/

  let timerId = setInterval(() => { // setinterval() create a timer that repeatedly executes the code.
    (pX == 100 && ((pX = 0), (pY = pY + 25))) || (pX = pX + 20);
    $(idValue).css({
      "background-position-x": pX + "%",
      "background-position-y": pY + "%",
    });

    //Check if the animation is complete (when pX and pY both reach 100).
    if (pY == 100 && pX == 100) {
      clearInterval(timerId); //Stop the animation timer.
      showDice(idValue); //Call to display the final dice face.
      
      if (rndmNo == 5 && countSix != 3) { 
        if (players[playerName].outArea.length == 0 && players[playerName].inArea.length > 0) { //check if the player has pieces in the inArea and move them out if necessary.
          openPawn();  // autoOpen 
        } else if(players[playerName].inArea.length==0){
          //openPawn(); // manuallyOpen
          movePawnOnOutArea();
          updatePlayer();
        }else{ // move pieces on the outArea and privateArea
          callFunctionsSequentially();
          updatePlayer() // update the player's status.
        }
      } else if (rndmNo < 5) {
        //movePawnOnOutArea(); //move pieces on out area 
        //movePawnOnPrivateArea(); // move pieces on private area 
        if(players[playerName].outArea.length==0){
          movePawnOnPrivateArea();
        }else{
          selectionInPrivateArea();
        }
        updatePlayer(); //update player status
      } else {
        setTimeout(function () {
          nextPlayer();
        }, 500);
      }
    }
  }, 20);
}


function showDice(idValue) {

  let pX = null;
  let pY = null;

  /* 2D array containing the x and y coordinates for each face of the dice in a sprite sheet.
   Each inner array represents the coordinates for one face of the dice. */
  const pXpYarr = [
    [0, 0],
    [100, 0],
    [0, 50],
    [100, 50],
    [0, 100],
    [100, 100],
  ];
  // const myArray = [5,4,2,0]
  // var randomIndex = Math.floor(Math.random() * myArray.length);
  // var randomItem = myArray[randomIndex];
  // rndmNo = randomItem

  rndmNo = Math.floor(Math.random() * 6);//randum number generation, generates a random integer between 0 and 5, both inclusive.
  announceNumber(rndmNo+1);

  if ((preDiceBoxId == null || preDiceBoxId == idValue) && rndmNo == 5) {
    countSix++; //counts number of six
  }

  pX = pXpYarr[rndmNo][0];
  pY = pXpYarr[rndmNo][1];

  $(idValue).removeClass("rollDice");
  $(idValue).addClass("showDice");
  $(idValue).css({
    "background-position-x": pX + "%",
    "background-position-y": pY + "%",
  });
  preDiceBoxId = idValue; //preDiceBoxId is updated to the current dice box (idValue), indicating the box that was rolled in the previous roll.
}

function announceNumber(number) {
  // Speak the number
  var utterance = new SpeechSynthesisUtterance(number.toString());
  utterance.rate=1.5;
  window.speechSynthesis.speak(utterance);
}

/*   Open Pawn */

function openPawn() {
  let inAreaLength = players[playerName].inArea.length;
  let outAreaLength = players[playerName].outArea.length;
  if (inAreaLength === 0) {
    return;
  } else {
    if (outAreaLength == 0) {
      setTimeout(()=>autoOpen(inAreaLength),500);
    } else {
      manuallyOpen();
    }
  }
} 

/*
function manuallyOpen(){//should be modified for navigation
  for (const classValue of players[playerName].inArea) {
    $("." + classValue).addClass("glow");
    $("." + classValue).one("click", function () {
      reUpdateOutAreaWH(...players[playerName].outArea);
      reUpdatePrivateAreaWH(...players[playerName].privateArea);
      open(classValue, 0);
    });
  }
}
*/

function manuallyOpen() {
  // Remove any existing glow classes from pawns
  let selectedPawnIndex = 0;
  let actionPerformed = false; // Flag to track if an action has been performed

  
  //announce that we area in base area
  const announcement = new SpeechSynthesisUtterance(`Inside Base Area`);
  announcement.rate=1.55;
  speechSynthesis.speak(announcement);

  updatedPawnIndex();
  function updatedPawnIndex(){
    removeAllGlow("inArea");
    $("." + players[playerName].inArea[selectedPawnIndex]).addClass("glow");
    announcePosition(getNoFromValue(players[playerName].inArea[selectedPawnIndex]));

  }

  let tabPressed = false;
  $(document).keydown(function(event) {
    if (event.key==="a"||event.key==='A') {
      tabPressed = !tabPressed;
      if(tabPressed){
        $(document).off("keydown");
        removeAllGlow("inArea");
        event.preventDefault();
      }
    }
  });

/*

 //manually open
let tabPressed = false;
console.log("tabPressed1:"+tabPressed);
$(document).off("keydown.handlePrivate keydown.moveOnOut keydown.manuallyOpen");
$(document).on("keydown.manuallyOpen",(function(event) {
  if (event.key==="a"||event.key==='A') {
    tabPressed = !tabPressed;
    console.log("tabPressed2: "+tabPressed);
    if(tabPressed){
      $(document).off("keydown"); 
      removeAllGlow("inArea");
    }
    event.preventDefault();
  }
}));
 */ 


    if(tabPressed===false){
      $(document).keydown(function(event) {
      if (!actionPerformed) {
        switch(event.key) {
          case "ArrowRight":
            // Move to the next pawn
            selectedPawnIndex = (selectedPawnIndex + 1) % players[playerName].inArea.length;
            speechSynthesis.cancel();
            updatedPawnIndex();
            break;
          case "ArrowLeft":
            // Move to the previous pawn
            selectedPawnIndex = (selectedPawnIndex - 1 + players[playerName].inArea.length) % players[playerName].inArea.length;
            speechSynthesis.cancel();
            updatedPawnIndex();
            break;
          case "Enter":
            const selectedPawn = players[playerName].inArea[selectedPawnIndex];
            reUpdateOutAreaWH(...players[playerName].outArea);
            reUpdatePrivateAreaWH(...players[playerName].privateArea);
            open(selectedPawn, 0);
            actionPerformed = true;
            break;
        }
      }
    }
  )}
}

//the autoOpen function simplifies the process of randomly selecting and opening a piece from the inArea of a player.
function autoOpen(inAreaLength) {
  let openClassValue =
    players[playerName].inArea[Math.floor(Math.random() * inAreaLength)];
    announceAutoOpenPawn(openClassValue);
    setTimeout(function () {
      open(openClassValue);
    }, 2000);

}


function open(openClassValue) {
  let startPoint = players[playerName].startPoint;
  let audioDuration = 500;

    removeAllGlow("inArea", "outArea");
    removeAllEvent("inArea", "outArea");
    removeFromArea(openClassValue, playerName, "inArea");
    addToArea(openClassValue, playerName, "outArea");
    addToOutAreaPos(getNoFromValue(startPoint), openClassValue);
    $("." + openClassValue).remove();

    let noInId = getNoFromValue(startPoint);

    let w = getUpdatedWHoutAreaPos(noInId)[0];
    let h = getUpdatedWHoutAreaPos(noInId)[1];
    if (sound == true) {
      audioDuration = Math.floor(openAudio.duration) * 1000;
      openAudio.play();
    }
    $("#" + startPoint).append(
      `<div class="${openClassValue}" style="width:${w}%; height:${h}%;"></div>`
    );
  setTimeout(function () {
    nextPlayer();
  }, audioDuration);
}

/* move pawn  on out area*/

//The movePawnOnOutArea function is responsible for determining how to move pawns from the "outArea" for the current player.
function movePawnOnOutArea() {
  let outAreaLength = players[playerName].outArea.length;
  if (outAreaLength == 0) {//If there are no pawns in the "outArea", it returns.
    return;
  } else {
    if (
      outAreaLength == 1 &&
      rndmNo != 5 &&
      players[playerName].privateArea.length == 0
    ) {
      autoMoveOnOutArea();
    } else {
      manuallyMoveOnOutArea();//    manuallyMoveOnOutArea() is only called here
    }
  }
}

/*
function manuallyMoveOnOutArea() {
  let idArr = [];//contain id of pawns
  for (const classValue of players[playerName].outArea) {
    let idValue = $("." + classValue).parent().attr("id");
    if (idArr.includes(idValue)) {
      continue;
    } else {
      for (const cValue of outAreaPos[getNoFromValue(idValue)]) {
        if (cValue != classValue) {
          $("." + cValue).css("display", "none");
        }
      }
      $("." + classValue).css( {
        width: 100 + "%",
        height: 100 + "%",
        display: "inline-block",
      });
      idArr.push(idValue);
      $("." + classValue).addClass("glow");
      $("." + classValue).one("click", function() {
        reUpdateOutAreaWH(...players[playerName].outArea);
        reUpdatePrivateAreaWH(...players[playerName].privateArea);
        moveOnOutArea(classValue);
      });
    }
  }
}
*/


function manuallyMoveOnOutArea() {
  console.log("inside manually move on out area");
  let idArr = []; // Contains IDs of pawns
  let classArray = []
  let selectedIndex = 0; 
  let actionPerformed = false; // Flag to track if an action has been performed

  const announcement = new SpeechSynthesisUtterance(`Inside Out Area`);
  announcement.rate=1.55;
  speechSynthesis.speak(announcement);

  for (const classValue of players[playerName].outArea) {
    classArray.push(classValue);
    let idValue = $("." + classValue).parent().attr("id");
    idArr.push(idValue)
  }

  for (const id of idArr) {
  $(`#${id} div`).css("display", "none");
    for (const classitem of classArray) {
      $(`#${id} .${classitem}`).css("display", "inline-block");
    }
  }
  updateSelectedPawn();
  // Function to update the glow for the selected pawn
  function updateSelectedPawn() {
    const classValue = players[playerName].outArea[selectedIndex];
    players[playerName].outArea.forEach((name) => {
      $("." + name).removeClass("glow").css({
        position:"inherit",
        zIndex:0 // Reset z-index for all pawns
      });
    })

    $("." + classValue).addClass("glow").css({
      width: "100%" ,
      height: "100%", 
      display: "inline-block",
      position: "absolute",
      top:0,
      left:0,
      zIndex: 1,
    });
    announcePosition(getNoFromValue(classValue));
    checkForPawns(selectedIndex);
  }




  let tabClicked=false;
  console.log("tabclicked1: "+tabClicked);
  $(document).keydown(function(event) {
    if (event.key==="a"||event.key==='A') {
      tabClicked = !tabClicked;
      console.log("tabclicked2: "+tabClicked);
      if(tabClicked){
        $(document).off("keydown");
        removeAllGlow("outArea");
        event.preventDefault();
      }
    }
  });


  /*

//moveOnOut
  let tabClicked=false;
  console.log("tabclicked1: "+tabClicked);
  $(document).off("keydown.handlePrivate keydown.moveOnOut keydown.manuallyOpen");
  $(document).on("keydown.moveOnOut",(function(event) {
    if (event.key==="a"||event.key==='A') {
      tabClicked = !tabClicked;
      console.log("tabclicked2: "+tabClicked);
      if(tabClicked){
        $(document).off("keydown");
        removeAllGlow("outArea");
        event.preventDefault();
      }
    }
  })
  );
  */



  if(tabClicked==false){
    $(document).on("keydown", function(e) {
      if(!actionPerformed) {
        switch(e.key) {
          case "ArrowRight": 
            selectedIndex =  (selectedIndex === 0) ? players[playerName].outArea.length - 1 : selectedIndex - 1;
            speechSynthesis.cancel();
            updateSelectedPawn();
          break;
          case "ArrowLeft":
            selectedIndex = (selectedIndex === players[playerName].outArea.length - 1) ? 0 : selectedIndex + 1;
            speechSynthesis.cancel();
            updateSelectedPawn();
          break;
          case "Enter":
            speechSynthesis.cancel();
            const classValue = players[playerName].outArea[selectedIndex];
            reUpdateOutAreaWH(...players[playerName].outArea);
            reUpdatePrivateAreaWH(...players[playerName].privateArea);
            moveOnOutArea(classValue);
            actionPerformed = true;
          break;
        }
      }
    });
  }
}

function announcePosition(indexSelected){
  let announcement=new SpeechSynthesisUtterance(`selected pawn ${indexSelected}`);
  announcement.rate=1.55;
  window.speechSynthesis.speak(announcement);
}


function callFunctionsSequentially() {
  let toggle = false;
  openPawn();
  $(document).on("keydown",handleKey); 
  function handleKey(e){
    if (e.key==="a"||e.key==='A') {
      toggle = !toggle;
      if (toggle) {
        movePawnOnOutArea();
      } else {
        openPawn();
      }
    }
    e.preventDefault();
  }
}


function selectionInPrivateArea(){
  let privateToggle=false;
  movePawnOnOutArea();
  $(document).on("keydown",keyHandle);
  function keyHandle(e){
    if (e.key==="a"||e.key==='A') {
      privateToggle =! privateToggle;
      if (privateToggle) {
        speechSynthesis.cancel();
        movePawnOnPrivateArea()
      }else{
        movePawnOnOutArea();
      }
      e.preventDefault();
    }
  }
}

/*
//callSequential
function callFunctionsSequentially() {
  let toggle = false;
  openPawn();
  console.log("toggle1: "+toggle);

  $(document).off("keydown.handlePrivate keydown.moveOnOut keydown.callSequential");
  $(document).on("keydown.callSequential",handleKey);
  function handleKey(e){
    if (e.key==="a"||e.key==='A') {
      toggle = !toggle;
      if (toggle) {
        speechSynthesis.cancel();
        movePawnOnOutArea();
      } else {
        openPawn();
      }
    }
    e.preventDefault();
  }
}
*/

/*
//handlePrivate
function selectionInPrivateArea(){
  let privateToggle=false;
  console.log("privateToggle1: "+privateToggle);

  $(document).off("keydown.handlePrivate keydown.callSequential keydown.manuallyOpen");
  $(document).on("keydown.handlePrivate",keyHandle);
  function keyHandle(e){
    if (e.key==="a"||e.key==='A') {
      if(rndmNo===5)return;
      console.log("tabPressed");
      privateToggle =! privateToggle;
      if (privateToggle) {
        speechSynthesis.cancel();
        let flag=movablePawn(rndmNo);
        (flag)?movePawnOnPrivateArea():moveOnOutArea();
      }else{
        movePawnOnOutArea();
      }
      e.preventDefault();
    }
  }
  movePawnOnOutArea();
}
*/

function movablePawn(rndNo){
  let flag=false
  console.log("random number:"+rndNo);
  currentPawnsInPrivateArea=players[playerName].privateArea;
  console.log("current Pawns in private area:  "+currentPawnsInPrivateArea);
  if(rndNo===5)
    return 0;
  else{
    for(let item of currentPawnsInPrivateArea){
      console.log("item"+item);
      let idName =$("."+item).parent().attr("id");
      let steps=5-getNoFromValue(idName);
      if(steps<=rndNo){
        if(flag)
          continue;
        else{
          flag=true;
        }
      }
    }
  }
}















//pllay safe zone sound
function safeZone(idvalue) {
  let noInId = getNoFromValue(idvalue);
  if ([1, 48, 9, 22, 35, 14, 27, 40].includes(noInId)) {
    safeAudio.play(); 
  }
}

 // to reannounce the random number
$(document).on("keydown.random",function(event){
  if(event.key==="r"||event.key==='R'){
    if(rndmNo==null)
      return;
    else{
      announceNumber(rndmNo+1);
    }
  }
});


/*

function areaLengthAnnounce(){//not called anywhere
  if(players[playerName].inArea.length!=0){
    noOfPlayersin=players[playerName].inArea.length;
    console.log("player in in area is announcing: "+noOfPlayersin)
    let text="base area"
    announcePlayerStatus(noOfPlayersin,text);
    let classValue=players[playerName].inArea;
    for(let pawnName of classValue){
      console.log(pawnName);
      announcePlayer(pawnName);
    }
  }
  if(players[playerName].outArea.length!=0){
    noOfPlayersOut=players[playerName].outArea.length;
    let classValue=players[playerName].outArea;
    console.log("player in out area is announcing: "+noOfPlayersOut)
    let text ="out area"
    announcePlayerStatus(noOfPlayersOut,text);
    for(let pawnName of classValue){
      announcePlayer(pawnName)
    }
  }
  if(players[playerName].privateArea.length!=0){
    noOfPlayersPrivate=players[playerName].privateArea.length;
    let classValue=players[playerName].privateArea;
    console.log("player in private area is announcing: "+noOfPlayersPrivate)
    announcePlayerStatus(noOfPlayersPrivate,"home column");
    for(let pawnName of classValue){
      announcePlayer(pawnName)
    }
  }
  function announcePlayerStatus(data,text){
    if ('speechSynthesis' in window) {
      const announcement = new SpeechSynthesisUtterance(`Number of player in ${text} is ${data} and the players are `);
      announcement.rate=1.5;
      speechSynthesis.speak(announcement);
    }
  }
  function announcePlayer(item){
    let pawnNumber=getNoFromValue(item)
    const announcement = new SpeechSynthesisUtterance(`pawn ${pawnNumber} `);
    announcement.rate=1.5;
    speechSynthesis.speak(announcement);
  }
}

*/

//announce pawn status in out area
function checkForPawns(currentPawn){//  speechSynthesis.cancel();
  let currentPawnValue=players[playerName].outArea[currentPawn];
  let currentClassValue=$("."+currentPawnValue).parent().attr("id");
  const areaNumber = getNoFromValue(currentClassValue)
  let currentArea=players[playerName].outArea;
  //check for safezone,player standing with you
  if ([1, 48, 9, 22, 35, 14, 27, 40].includes(areaNumber)) {
    let areaStart=getNoFromValue(players[playerName].startPoint)
    if(areaNumber==areaStart){
      const announcement = new SpeechSynthesisUtterance(`You are in starting position`);
      announcement.rate=1.55;
      speechSynthesis.speak(announcement);
    }else{
      const announcement = new SpeechSynthesisUtterance(`You are in safe zone`);
      announcement.rate=1.55;
      speechSynthesis.speak(announcement);  
    }
    for(const cValue of outAreaPos[areaNumber]){
      if(!currentArea.includes(cValue)){
      let playerNum=getNoFromValue(cValue)
      let playerColor=findPlayer(cValue)
      const announcement = new SpeechSynthesisUtterance(`${playerColor} player ${playerNum} with you `);
      announcement.rate=1.5;
      speechSynthesis.speak(announcement);
      }
    }
  }
  //check if  there are players behind
  let count=0;
  end=areaNumber-7;
  for(let i=areaNumber-1;i<52;i--){
    if(i==end){break;}
    let val;
    if(i>0){
      val=i % 52;
    }else if(i==0){
      val=52;
    }else{
      let temp=i*-1;
      val=52-temp;
    }
    ++count;
    for(const cValue of outAreaPos[val]){
      if(!currentArea.includes(cValue)){
        let playerNum=getNoFromValue(cValue)
        let playerColor=findPlayer(cValue)
        const announcement = new SpeechSynthesisUtterance(`${count} position behind ${playerColor} player ${playerNum}`);
        announcement.rate=1.5;
        speechSynthesis.speak(announcement);
      }
    }
  } 
  const areaEnd=getNoFromValue(players[playerName].endPoint);
  //if player is in the areaEnd
  if(areaEnd==areaNumber){
    const announcement = new SpeechSynthesisUtterance(`1 position ahead home column`);
    announcement.rate=1.55;
    speechSynthesis.speak(announcement);
    return;
  }
  //check if there are players ahead 
  let limit;
  count=0;
  let difference=areaEnd-areaNumber;
  if(difference<6 && difference>0){
    limit=areaNumber+difference;
  }else{
    limit=areaNumber+6;
  }
  for(let i=areaNumber;i<limit;i++){
    let val=(i % 52) + 1;
    ++count;
    for(const cValue of outAreaPos[val]){
      if(!currentArea.includes(cValue)){
        let playerNum=getNoFromValue(cValue);
        let playerColor=findPlayer(cValue);
        const announcement = new SpeechSynthesisUtterance(`${count} position ahead ${playerColor} player ${playerNum}`);
        announcement.rate=1.55;
        speechSynthesis.speak(announcement);
      }
    } 
    if ([1, 48, 9, 22, 35, 14, 27, 40].includes(val)) {
      const announcement = new SpeechSynthesisUtterance(`${count} position ahead safe zone`);
      announcement.rate=1.55;
      speechSynthesis.speak(announcement);
    }
    if(val==areaEnd){
      const announcement = new SpeechSynthesisUtterance(`${count+1} position ahead home column`);
      announcement.rate=1.55;
      speechSynthesis.speak(announcement);
    }
  }
  
}
function findPlayer(cValue){
  let playerColor=getColorFromValue(cValue)
  switch (playerColor) {
    case 'y': return "yellow";
      break;
    case 'r':return "red";
      break;
    case 'b':return "blue";
      break;
    case 'g':return "green";
      break;
  }
}

//announce name of pawn automatically move out
function announceAutoOpenPawn(openClassValue){
  let num=getNoFromValue(openClassValue)
  let announcement= new SpeechSynthesisUtterance(`pawn ${num} out`)
  SpeechSynthesis.rate=1.55;
  speechSynthesis.speak(announcement);
}

//announce pawn status in private area
function checkPrivatePawn(currentPawnClass){
  let pawnId=$("."+currentPawnClass).parent().attr("id");
  const areaNum = getNoFromValue(pawnId)
  let aheadNo=6-areaNum;

  let announcement= new SpeechSynthesisUtterance(` ${aheadNo} position ahead winning triangle`)
  SpeechSynthesis.rate=1.58;
  speechSynthesis.speak(announcement);
}





















function autoMoveOnOutArea() {
  moveOnOutArea(players[playerName].outArea[0]);
}

function moveOnOutArea(cValue) {
  let count = -1;
  let idValue = $("." + cValue)
    .parent()
    .attr("id");
  let noInId = getNoFromValue(idValue);
  let newId = "out" + noInId;
  let oldId = newId;
  let wh = [];
  let moveingClassValue = cValue;
  let color = getColorFromValue(moveingClassValue);
  let winAudioPlay = false;
  let passAudioPlay = false;

  removeAllGlow("inArea", "outArea", "privateArea");
  removeAllEvent("inArea", "outArea", "privateArea");

  let timerId = setInterval(function () {
    if (checkOutAreaEnd(newId)) {//if in outArea end
      count++;
      removeFromOutAreaPos(noInId, moveingClassValue);
      removeFromArea(moveingClassValue, playerName, "outArea");
      $("." + moveingClassValue).remove();
      wh = getUpdatedWHoutAreaPos(noInId);
      noInId = 1;
      newId = color + "-out-" + noInId;
      oldId = newId;

      addToArea(moveingClassValue, playerName, "privateArea");
      addToPrivateAreaPos(noInId, moveingClassValue, playerName);

      wh = getUpdatedWHprivateAreaPos(noInId);
      if (sound == true) {
        jumpAudio.play();
      }
      $("#" + newId).append(
        `<div class="${moveingClassValue}" style="width:${wh[0]}%; height:${wh[1]}%;"></div>`
      );
      
    } else if (players[playerName].privateArea.includes(moveingClassValue)) {//if in privateArea
      count++;
      $("." + moveingClassValue).remove();
      removeFromPrivateAreaPos(noInId, moveingClassValue, playerName);
      wh = getUpdatedWHprivateAreaPos(noInId);
      if (checkprivateAreaEnd(oldId)) {
        pass = true;
        removeFromArea(moveingClassValue, playerName, "privateArea");
        addToArea(moveingClassValue, playerName, "winArea");
        sendToWinArea(moveingClassValue, playerName, color);
        if (players[playerName].winArea.length == 4) {
          if (sound == true) {
            winAudioPlay = true;
            winAudio.play();
          }
          updateWinningOrder(playerName);
          showWinningBadge();
        }
        if (sound == true && winAudioPlay == false) {
          passAudio.play();
          passAudioPlay = true;
        }
      } else {
        noInId++;
        newId = color + "-out-" + noInId;
        oldId = newId;
        addToPrivateAreaPos(noInId, moveingClassValue, playerName);
        wh = getUpdatedWHprivateAreaPos(noInId);
        if (sound == true) {
          jumpAudio.play();
          
        }
        $("#" + newId).append(
          `<div class="${moveingClassValue}" style="width:${wh[0]}%; height:${wh[1]}%;"></div>`
        );
      }
    } else {//not in outArea end/privateArea
      count++;
      $("." + moveingClassValue).remove();
      removeFromOutAreaPos(noInId, moveingClassValue);
      wh = getUpdatedWHoutAreaPos(noInId);
      if (check52(oldId)) {
        noInId = 1;
        newId = "out" + noInId;
        oldId = newId;
      } else {
        noInId++;
        newId = "out" + noInId;
        oldId = newId;
      }

      addToOutAreaPos(noInId, moveingClassValue);
      wh = getUpdatedWHoutAreaPos(noInId);
      if (sound == true) {
        jumpAudio.play();
      }

      $("#" + newId).append(
        `<div class="${moveingClassValue}" style="width:${wh[0]}%; height:${wh[1]}%;"></div>`
      );
      
    }

    if (count == rndmNo) {
      clearInterval(timerId);
      cutPawn(noInId, moveingClassValue);
      if (sound == true && winAudioPlay == true) {
        winAudio.onended = () => {
          nextPlayer();
        };
      } else if (sound == true && passAudioPlay == true) {
        passAudio.onended = () => {
          nextPlayer();
        };
      } else {
        setTimeout(() => nextPlayer(), 500);
      }
      let idValue = $("." + moveingClassValue).parent().attr("id");
      arr=["out-1","out-2","out-3","out-4","out-5"]
      if(!(arr.some(item=>idValue.endsWith(item)))){
        safeZone(idValue);
      }
    }
  }, 500);
}

/*  Move on Private Area */

function movePawnOnPrivateArea() {
  let privateAreaLength = players[playerName].privateArea.length;
  let outAreaLength = players[playerName].outArea.length;
  if (privateAreaLength == 0 || rndmNo == 5) {
    return;
  } else {
    let moveingClassArr = [];
    for (const cValue of players[playerName].privateArea) {
      let idValue = $("." + cValue).parent().attr("id");
      let noInId = getNoFromValue(idValue);
      if (rndmNo <= 5 - noInId) {
        moveingClassArr.push(cValue);
      }
    }
    if (moveingClassArr.length == 0) {
      flag = false;
      return;
    } else if (outAreaLength == 0 && moveingClassArr.length == 1) {
      flag = true;
      autoMoveOnPrivateArea(moveingClassArr);
    } else {
      flag = true;
      manuallyMoveOnPrivateArea(moveingClassArr);
    }
  }
}

/*
function manuallyMoveOnPrivateArea(moveingClassArr) {
  let idArr = [];
  for (const classValue of moveingClassArr) {
    let idValue = $("." + classValue).parent().attr("id");
    if (idArr.includes(idValue)) {
      continue;
    } else {
      for (const cValue of players[playerName].privateAreaPos[getNoFromValue(idValue)]) {
        if (cValue != classValue) {
          $("." + cValue).css("display", "none");
        }
      }
      $("." + classValue).css({
        width: 100 + "%",
        height: 100 + "%",
        display: "inline-block",
      });
      idArr.push(idValue);
      $("." + classValue).addClass("glow");
      $("." + classValue).one("click", function () {
        reUpdateOutAreaWH(...players[playerName].outArea);
        reUpdatePrivateAreaWH(...players[playerName].privateArea);
        moveOnPrivateArea(classValue);
      });
    }
  }
}
*/


function manuallyMoveOnPrivateArea(moveingClassArr) {
  let idArr = [];
  let privateIndex = 0;
  let actionPerformed = false; // Flag to track if an action has been performed

  let announcement=new SpeechSynthesisUtterance(`Inside Home Column`)
  announcement.rate=1.5;
  speechSynthesis.cancel();
  speechSynthesis.speak(announcement);
  

  for (const classValue of moveingClassArr) {
    let idValue = $("." + classValue).parent().attr("id");
    if (!idArr.includes(idValue)) {
      for (const cValue of players[playerName].privateAreaPos[getNoFromValue(idValue)]) {
        if (cValue !== classValue) {
          $("." + cValue).css("display", "none");
        }
      }
      idArr.push(idValue);
    }
  }

  function updatePawnOnPrivateArea(classValue) {
    removeAllGlow("privateArea");
    $("." + classValue).addClass("glow").css({
      width: "100%",
      height: "100%",
      display: "inline-block"
    });
    console.log("classvalue: "+ classValue);
    checkPrivatePawn(classValue);
  }

  updatePawnOnPrivateArea(moveingClassArr[0]);
 
  $(document).on("keydown", function(e) {
    if (!actionPerformed) {
      switch(e.key) {
        case "ArrowRight": 
          privateIndex = (privateIndex === 0) ? moveingClassArr.length - 1 : privateIndex - 1;
          updatePawnOnPrivateArea(moveingClassArr[privateIndex]);
        break;
        case "ArrowLeft":
          privateIndex = (privateIndex === moveingClassArr.length - 1) ? 0 : privateIndex + 1; 
          updatePawnOnPrivateArea(moveingClassArr[privateIndex]);
        break;
        case "Enter":
          const classValue = moveingClassArr[privateIndex];
          reUpdateOutAreaWH(...players[playerName].outArea);
          reUpdatePrivateAreaWH(...players[playerName].privateArea);
          moveOnPrivateArea(classValue);
          actionPerformed = true;
        break;
      }
    }
  });
}


function autoMoveOnPrivateArea(moveingClassArr) {
  moveOnPrivateArea(moveingClassArr[0]);
}


function moveOnPrivateArea(cValue) {
  let idValue = $("." + cValue)
    .parent()
    .attr("id");
  let moveingClassValue = cValue;
  let noInId = getNoFromValue(idValue);
  let color = getColorFromValue(moveingClassValue);
  let count = -1;
  let newId = color + "-out-" + noInId;
  let oldId = newId;
  let wh = [];
  let winAudioPlay = false;
  let passAudioPlay = false;

  removeAllGlow("inArea", "outArea", "privateArea");
  removeAllEvent("inArea", "outArea", "privateArea");

  let timerId = setInterval(function () {
    count++;
    $("." + moveingClassValue).remove();
    removeFromPrivateAreaPos(noInId, moveingClassValue, playerName);

    wh = getUpdatedWHprivateAreaPos(noInId);

    if (checkprivateAreaEnd(oldId)) {
      pass = true;
      removeFromArea(moveingClassValue, playerName, "privateArea");
      addToArea(moveingClassValue, playerName, "winArea");
      sendToWinArea(moveingClassValue, playerName, color);
      if (players[playerName].winArea.length == 4) {
        if (sound == true) {
          winAudioPlay = true;
          winAudio.play();
        }
        updateWinningOrder(playerName);
        showWinningBadge();
      }
      if (sound == true && winAudioPlay == false) {
        passAudio.play();
        passAudioPlay = true;
      }
    } else {
      noInId++;
      newId = color + "-out-" + noInId;
      oldId = newId;
      addToPrivateAreaPos(noInId, moveingClassValue, playerName);
      wh = getUpdatedWHprivateAreaPos(noInId);
      if (sound == true) {
        jumpAudio.play();
      }
      $("#" + newId).append(
        `<div class="${moveingClassValue}" style="width:${wh[0]}%; height:${wh[1]}%;"></div>`
      );
    }

    if (count == rndmNo) {
      clearInterval(timerId);
      if (sound == true && winAudioPlay == true) {
        winAudio.onended = () => {
          nextPlayer();
        };
      } else if (sound == true && passAudioPlay == true) {
        passAudio.onended = () => {
          nextPlayer();
        };
      } else {
        setTimeout(() => nextPlayer(), 500);
      }
    }
  }, 500);
}

/* update player */

function updatePlayer() {
  if (players[playerName].inArea.length == 4 && rndmNo < 5) {
    setTimeout(() => nextPlayer(), 500);
    return;
  }
  if (players[playerName].winArea.length < 4) {
    if (flag == true) {
      flag = false;
      return;
    } else if (
      rndmNo == 5 &&
      players[playerName].outArea.length == 0 &&
      players[playerName].inArea.length == 0
    ) {
      setTimeout(() => nextPlayer(), 500);
      return;
    } else if (players[playerName].outArea.length > 0) {
      return;
    } else if (
      players[playerName].inArea.length > 0 &&
      flag == false &&
      rndmNo < 5
    ) {
      setTimeout(() => nextPlayer(), 500);
      return;
    } else if (
      players[playerName].inArea.length > 0 &&
      flag == false &&
      rndmNo == 5
    ) {
      return;
    } else {
      setTimeout(() => nextPlayer(), 500);
      return;
    }
  } else {
    setTimeout(() => nextPlayer(), 500);
    return;
  }
   
}

/* Move to Win Area*/

function sendToWinArea(cValue, pName, color) {
  $("#" + color + "-win-pawn-box").append(`<div class="${cValue}"></div>`);
  updateWinAreaCss(pName, color);
}

function updateWinAreaCss(pName, color) {
  let x = null;
  let y = null;
  const winAreaPxPY = [
    [[380, 380]],
    [
      [380, 380],
      [305, 305],
    ],
    [
      [380, 380],
      [230, 380],
      [380, 230],
    ],
    [
      [380, 380],
      [230, 380],
      [305, 305],
      [380, 230],
    ],
  ];
  let i = 0;
  let rotateValue = getRotateValue(color);
  let winAreaLength = players[pName].winArea.length;
  for (const classValue of players[pName].winArea) {
    x = winAreaPxPY[winAreaLength - 1][i][0];
    y = winAreaPxPY[winAreaLength - 1][i][1];
    i++;
    $("." + classValue).css( {
      transform: `translate(${x}%, ${y}%) rotate(${rotateValue})`,
    });
  }
}

/* Winning Badge load*/

function updateWinningOrder(pName) {
  if (players[pName].winArea.length == 4) {
    winningOrder.push(pName);
  }
}

function showWinningBadge() {
  if (winningOrder.length > 0) {
    let idValue = winningOrder[winningOrder.length - 1];
    let plyr=findPlayer(idValue)
    announceWinner(plyr,winningOrder.length);
    let url = getBadgeImage(winningOrder.length - 1);
    $("#" + idValue).append(
      `<div class="badge-box" style="background-image: ${url};"></div>`
    );
  }

}


function getBadgeImage(winNo) {
  let imageName = null;

    (winNo == 0 && (imageName = "win1")) ||
    (winNo == 1 && (imageName = "win2")) ||
    (winNo == 2 && (imageName = "win3"));

  return `url(images/${imageName}.png)`;
}


function announceWinner(plyr, winNum){//                                     announce
  let announcement=new SpeechSynthesisUtterance(`${plyr} player wins, position ${winNum+1}`);
  announcement.rate=1.55;
  speechSynthesis.speak(announcement);
}

/* cut the pawn */

function cutPawn(noInId, moveingClassValue) {
  if (players[playerName].outArea.includes(moveingClassValue)) {
    if ([1, 48, 9, 22, 35, 14, 27, 40].includes(noInId)) {
      return;
    } else {
      let colorInClass = getColorFromValue(moveingClassValue);
      let targetClass = null;
      for (const cValve of outAreaPos[noInId]) {
        if (colorInClass != getColorFromValue(cValve)) {
          targetClass = cValve;
        }
      }
      if (targetClass != null) {
        $("." + targetClass).remove();
        if (sound == true) {
          cutAudio.play();
        }
        colorInClass = getColorFromValue(targetClass);
        let pName = colorInClass + "Player";
        removeFromArea(targetClass, pName, "outArea");
        addToArea(targetClass, pName, "inArea");
        removeFromOutAreaPos(noInId, targetClass);
        let noInClass = getNoFromValue(targetClass);
        $(`#in-${colorInClass}-${noInClass}`).append(
          `<div class='${colorInClass}-pawn${noInClass}'></div>`
        );
        cut = true;
        getUpdatedWHoutAreaPos(noInId);
      }
    }
  } else {
    return;
  }
}

/* start game */

function startGame() {
  if (noOfPlayer == 2) {
    setPawn("r", "y");
  } else if (noOfPlayer == 3) {
    setPawn("r", "g", "y");
  } else {
    setPawn("r", "g", "y", "b");
  }

  $("main").css("display", "block");
  nextPlayer();
}

function setPawn(...color) {
  for (const colorName of color) {
    players[colorName + "Player"].inArea = [
      colorName + "-pawn1",
      colorName + "-pawn2",
      colorName + "-pawn3",
      colorName + "-pawn4",
    ];

    for (i = 1; i <= 4; i++)
      $(`#in-${colorName}-${i}`).append(
        `<div class='${colorName}-pawn${i}'></div>`
      );
  }
}



$(document).ready(function() {
  $(".playerNum").keydown(function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default Enter key behavior
      $(this).find(".noOfPlayer").click(); // Trigger click on the .noOfPlayer div inside the button
    }
  });

$("#twoPlayer").click(function () {
  $(".selected").removeClass("selected");
  $("#twoPlayer").addClass("selected");
  noOfPlayer = 2;
});


$("#threePlayer").click(function () {
  $(".selected").removeClass("selected");
  $("#threePlayer").addClass("selected");
  noOfPlayer = 3;
});


$("#fourPlayer").click(function () {
  $(".selected").removeClass("selected");
  $("#fourPlayer").addClass("selected");
  noOfPlayer = 4;
});

$("#startGame").click(function () {
  $("#home-container").css("display", "none");
  startGame();
});

});



/* restart Game */

function resetPawn(...color) {
  for (const colorName of color) {
    for (let i = 1; i <= 4; i++) {
      $(`.${colorName}-pawn${i}`).remove();
    }
  }
}

function restartGame() {
  $("#home-container").css("display", "block");
  $("main").css("display", "none");
  $("." + "badge-box").remove();
  if (noOfPlayer == 2) {
    resetPawn("r", "y");
  } else if (noOfPlayer == 3) {
    resetPawn("r", "g", "y");
  } else {
    resetPawn("r", "g", "y", "b");
  }
  $(diceBoxId).removeClass("startDiceRoll");
  $(diceBoxId).removeClass("showDice");
  $(diceBoxId).off();
  players = {
    rPlayer: new Player("out1", "out51"),
    gPlayer: new Player("out14", "out12"),
    yPlayer: new Player("out27", "out25"),
    bPlayer: new Player("out40", "out38"),
  };
  outAreaPos = new Position(52);
  playerNo = 0; // (red = 1, green = 2, yellow = 3, blue = 4)
  playerName = null; // store defult playerName
  diceBoxId = null; // store id value of dice box
  preDiceBoxId = null; // store id value of previou diceBoxId
  rndmNo = null; // generate rndmNo after dice is roll
  countSix = 0;
  cut = false;
  pass = false;
  flag = false;
  winningOrder = [];
}

$("#restart").click(function () {
  $("#alertBox").css("display", "block");
});

$("#ok").click(function () {
  restartGame();
  $("#alertBox").css("display", "none");
});

$("#cancel").click(function () {
  $("#alertBox").css("display", "none");
});

/* Sound Settings */

function soundSettings() {
  if (sound == true) {
    sound = false;
  } else {
    sound = true;
  }
}

$("#sound").click(function () {
  soundSettings();
  if (sound == true) {
    $("#sound").css("background-image", "url(../images/sound-on.svg)");
  } else {
    $("#sound").css("background-image", "url(../images/sound-off.svg)");
  }
});

/* fullsreen */

let elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }

  $("#fullscreen").css("display", "none");
  $("#exitfullscreen").css("display", "inline-block");
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }

  $("#exitfullscreen").css("display", "none");
  $("#fullscreen").css("display", "inline-block");
}

document.addEventListener("fullscreenchange", (event) => {
  // document.fullscreenElement will point to the element that
  // is in fullscreen mode if there is one. If there isn't one,
  // the value of the property is null.
  if (document.fullscreenElement) {
    $("#fullscreen").css("display", "none");
    $("#exitfullscreen").css("display", "inline-block");
  } else {
    $("#exitfullscreen").css("display", "none");
    $("#fullscreen").css("display", "inline-block");
  }
}); 

$("#fullscreen").click(function() {
  openFullscreen();
});

$("#exitfullscreen").click(function() {
  closeFullscreen();
});


/* help button control */

$(document).ready(function(){
  let isSpeaking= false;
  let utterance;
  function speakHelpText(){
    var helpText = $("#help-card").text();
    utterance = new SpeechSynthesisUtterance(helpText);
    utterance.rate=1.5;
    window.speechSynthesis.speak(utterance);
    isSpeaking= true;
    utterance.onend=function(){
      isSpeaking=false;
    }
  }
// toggle announcing shortcuts
  $("#help").on('click',function(event) {
    $("#help-card").toggleClass('hidden');
      event.stopPropagation();
      if ($("#help-card").hasClass('hidden')) {
        window.speechSynthesis.cancel();
        isSpeaking=false;
      } else {
        speakHelpText();
      }
  });

  // Hide the card if the user clicks outside of it
  $(document).on('click', function(event) {
      if (!$(event.target).closest('#help-card').length && !$(event.target).closest('#help').length) {
        $('#help-card').addClass('hidden');
        if(isSpeaking){
          window.speechSynthesis.cancel();
          isSpeaking=false;
        }
      }
  });
//help shortcut
  $(document).on('keydown', function(event) {
    if (event.key === 'h'|| event.key==='H') {
      if(isSpeaking){
        window.speechSynthesis.cancel();
        isSpeaking= false;
      }else{
        speakHelpText();
      }
    }
  });
// stop help announce if started the game 
  $("#startGame").on('click', function() {
    if (isSpeaking) {
      isSpeaking = false;
    }
  });
  
});