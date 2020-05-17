/*
status flags
0 - initializing 
1 - player 1 initialized, waiting for player 2
2 - player 1 playing; 
3 - player 2 playing;
4 - game over;


game object
oGame = {
id: 123,
status: 0,
players: [],
allData: "",	
	
}
*/

const arrStatusMsg = 
["initializing...", //0
"player 1 initialized, waiting for player 2", //1 
"player 2 intialied, player 1 click here to start game", //2
// "player 2 intialied, waiting for player 1 to start game", //2
"player 1 playing", //3
"player 2 playing", //4
"game over"]; //5

let continuousCheckTimer = true;
// let continuousCheckTimer = false;


let bBallDropping = false;

let g_gameID, g_playerID;

let g_currPlayer, g_YouArePlayerNum; 
g_currPlayer = -1;

let oTime;
let droppingBallTimer;

let g_latestGameDataVersion = -1;

let gettingLatestDataTimer;

function onBodyLoad()
{
	// alert("A")


	// slayIt();
	// init();

	//bootstrap 
	$("#status").hide();
	addEventListeners()

	g_playerID = parseInt(Math.random()*100);



	
}

function responsiveResizing(){
	let avWidth = $(window).width();
	let rowWidth = Math.floor(avWidth / 10);

	let cellPadding = Math.floor(rowWidth * 0.40);
	let cellMargin = Math.floor(rowWidth * 0.05);

	let remainigSpace = Math.floor(avWidth - (((cellPadding + cellMargin) * 2) * 10))
	// console.log(remainigSpace)
	$('.cells').css("padding", cellPadding + "px");
	$('.cells').css("margin", cellMargin + "px");
}

function addEventListeners(){
	$("#btnNewGame").on("click", newGameClicked);
	$("#btnJoinGame").on("click", joinGameClicked);

	$("#btnBackToMain").on("click", ShowMainControls);

	$("#btnJoinGameWithId").on("click", JoinGameWithID);

	$('.gameId').on("click", copyGameID);

	$('.statusMessage').on("click", statusClicked);
}

function statusClicked(){

	//only perform it if status is player 2 intialized, waiting for player 1 to start game
	if (getGameData().status === 2 && g_YouArePlayerNum === 1){
	// if (getGameData().status === 2){
		oGameData.status = 3;
		oGameData.gameDataVersion = 1;
		saveData();
		checkStatus();
	}
	
}

function copyGameID()
{
	let a = document.createElement('textarea');
	a.value = g_gameID;
	document.body.append(a);
	a.select();
	document.execCommand('copy');
	document.body.removeChild(a);
	alert('game id copied');
}

let dropTillRow = -1;
let droppedTill = -1;

function colSelected(event)
{
	console.log(event.currentTarget);
	if (areYouCurrentlyPlaying())
	{
		let colNum = event.currentTarget.getAttribute("col-num");
		dropTillRow = AddBallIn(+colNum-1);


		//temp
		// event.currentTarget.style.backgroundColor = "blue"
		event.currentTarget.classList.add("droppingBallIn")
		
		bBallDropping = true;
		droppingBallTimer = setInterval(dropBallIn, 100);
	}
	
	
}


function dropBallIn()
{
	let fillClassName = "player" + String(g_currPlayer).trim() + "Fill"
	let filledClassName = "player" + String(g_currPlayer).trim() + "Filled"

	droppedTill++;
	if (droppedTill <= dropTillRow)
	{
		$('.' + fillClassName).removeClass(fillClassName);
		$('.droppingBallIn .cells')[droppedTill].classList.add(fillClassName);

		// $('.player1Fill').removeClass('player1Fill');
		// $('.droppingBallIn .cells')[droppedTill].classList.add('player1Fill');
	}
	else
	{
		clearInterval(droppingBallTimer);
		bBallDropping = false;
		$('.droppingBallIn div')[dropTillRow].classList.add(filledClassName);
		$('.droppingBallIn div')[dropTillRow].classList.add("Filled");
		// currCell.classList.add("Filled")
		$('.droppingBallIn').removeClass('droppingBallIn');

		// $('.droppingBallIn div')[dropTillRow].classList.add('player1Filled');
		// $('.droppingBallIn').removeClass('droppingBallIn');

		droppedTill = -1;

		if(checkForWinner())
		{
			console.log("WINNER!")
			weHaveAWinner();
		}
		else
		{
			SaveAndSwitchPlayer();
		}
		

	}
	
}

function weHaveAWinner(){
	clearInterval(gettingLatestDataTimer);
	oGameData.status = 5;
	alert ("Player " + g_currPlayer + " wins!");
	checkStatus();
	saveData();
	
}

function SaveAndSwitchPlayer(){
	if (g_currPlayer === 1)
	{
		//switch to player 2
		oGameData.status = 4;
	}
	else
	{
		//switch to player 1
		oGameData.status = 3;
	}

	

	// incrementGameDataVersion();

	saveData();
	checkStatus();
}

function incrementGameDataVersion(){
	//oGameData.gameDataVersion++;
	g_latestGameDataVersion = getGameData().gameDataVersion++;

	// g_latestGameDataVersion = oGameData.gameDataVersion;
}

function JoinGameWithID()
{
	let userInputId = $("#gameIdInput").val();
	//check if game id exists
	if (!localStorage.tictac)
	{
		console.log("no game exists")
		return;
	}

	// if (JSON.parse(localStorage.tictac)[userInputId] === undefined)
	if (getGameData(userInputId) === -1)
	{
		console.log("no game exists")
	}
	else
	{
		initializeAllData();

		// oGameData = JSON.parse(localStorage.tictac)[userInputId];
		oGameData = getGameData(userInputId)
		oGameData.status = 2;
		g_gameID = oGameData.id;
		oGameData.players.push(g_playerID);

		allData = JSON.parse(oGameData.allData)

		incrementGameDataVersion();
		if (continuousCheckTimer){
			gettingLatestDataTimer = setInterval(checkForLatestData, 100);
		}
		
		
		saveData();

		$('.joinGameControls').hide();

		showGameArea();

		g_YouArePlayerNum = 2;
		document.title += " Player2"

		checkStatus();

		
	}

	temp1()
}

function ShowMainControls()
{
	$('.ini_btnContainer').show();
	$('.joinGameControls').hide();
}


function newGameClicked()
{
	$('.ini_btnContainer').hide();

	g_gameID = getUniqueID() + "_" + parseInt(Math.random()*100);

	// g_playerID = parseInt(Math.random()*100);


	// init();

	initializeAllData();
		
	oGameData = {
		id: g_gameID,
		status: 1,
		players: [g_playerID],
		allData: JSON.stringify(allData),
		gameDataVersion: -1	
	}


	

	//localStorage.tictac ? localStorage.tictac[g_gameID] = JSON.stringify(oGameData) : localStorage.tictac = {}

	saveData();


	showGameArea();

	// oTime = setInterval(checkForPlayer2ready, 500)
	
	g_YouArePlayerNum = 1;
	document.title += " Player1"

	checkStatus();
	if (continuousCheckTimer){
		gettingLatestDataTimer = setInterval(checkForLatestData, 100);
	}
	temp1();
	if ($(window).width() < 600)
	{
		responsiveResizing();
	}

}

function checkForLatestData()
{
	checkStatus();
	// console.log("checking for latest data ")
	gameData = getGameData();
	// checkStatus();
	// console.log("gameData.gameDataVersion ", gameData.gameDataVersion)
	// console.log("g_latestGameDataVersion ", g_latestGameDataVersion)
	if (gameData.gameDataVersion > g_latestGameDataVersion && !bBallDropping)
	{
		oGameData = getGameData();

		if (oGameData.status === 5)
		{
			alert ("game over")
			clearInterval(gettingLatestDataTimer);
		}

		allData = JSON.parse(gameData.allData);
		allCols = transpose(allData);
		renderFromAllData(allData);
	}
}

function showGameArea(){
	// $('.gameDetailsCont>div')[0].innerHTML += " " + String(g_gameID);
	$('.gameId>span')[0].innerHTML = String(g_gameID);
	$('.gameId').show();

	slayIt();
	$(".gameDetailsCont").show();
}

function checkStatus()
{
	gameData = getGameData(); // JSON.parse(localStorage.tictac)[g_gameID];
	iStat = gameData.status;
	$('.statusMessage').text(arrStatusMsg[iStat]);

	if (iStat === 3){
		g_currPlayer = 1;
	}
	else if (iStat === 4)
	{
		g_currPlayer = 2;
	}

	if (g_currPlayer === g_YouArePlayerNum){
		$('.cols').addClass("enabled");
	}
	else
	{
		$('.cols').removeClass("enabled");
	}

}


function saveData()
{
	
	
	if (!localStorage.tictac)
	{
		localStorage.tictac = "";
		storeData = {};
	}
	else
	{
		storeData = JSON.parse(localStorage.tictac);
	}

	oGameData.allData = JSON.stringify(allData);
	oGameData.gameDataVersion = $('.Filled').length;
	g_latestGameDataVersion = oGameData.gameDataVersion;

	storeData[g_gameID] = oGameData;

	localStorage.tictac = JSON.stringify(storeData);
}

function joinGameClicked()
{
	$('.ini_btnContainer').hide();
	$('.joinGameControls').show();
}

function addCell(parenElem){

	// a = document.querySelector('.cols')
	cell = document.createElement('div');
	// cell.innerText = "b";
	cell.classList.add('cells')
	parenElem.append(cell)
}

function slayIt()
{
	//alert("A")
	numCols = 10; 
	numRows = 10; 
	for (var i=0; i<numCols; i++)
	{
		colElem = document.createElement('div');
		colElem.classList.add('cols');
		colElem.classList.add('flexContainer');
		// colElem.classList.add('colNum' + String(i+1))
		colElem.setAttribute("col-num", i+1)
		// colElem.classList.add('padMar');
		document.querySelector('.mainCont').append(colElem);
		for (j=0; j<numRows; j++)
		{
			addCell(colElem);
		}
		// colElem.innerText = String(i+1);
	}

	// $('.cols').on("hover", colsHover);
	$('.cols').hover(colsHoverIn, colsHoverOut)
	$('.cols').on("click", colSelected)

}

function colsHoverIn(event)
{
	// console.log("colsHoverIn")
	if (areYouCurrentlyPlaying())
	event.currentTarget.classList.add("cols_Hovered");
}

function colsHoverOut(event)
{
	// console.log("colsHoverOut")
	// if (areYouCurrentlyPlaying())
	event.currentTarget.classList.remove("cols_Hovered");
}

function areYouCurrentlyPlaying()
{
	/* if (g_currPlayer === g_YouArePlayerNum)
	{
		return true;
	}
	else{
		return false;
	} */

	let ret;
	g_currPlayer === g_YouArePlayerNum ? ret = true : ret = false;
	return ret;

}

function addBall(){
	divBall = document.createElement('div')
	divBall.classList.add("divBall")
	document.body.append(divBall); 
}

function moveToSelCol(selCol)
{
	colW = document.querySelector('.cell').getBoundingClientRect().width;
	divBall.style.left = String((colW * selCol) + (colW / 2) - (divBall.getBoundingClientRect().width / 2)) + "px"
	
}

function gotoRow(gotoRow){
	//gotoRow = 4;
	colH = document.querySelector('.cell').getBoundingClientRect().height;
	divBall.style.top = String((colH * gotoRow) + (colH / 2) - (divBall.getBoundingClientRect().height / 2)) + "px"
}

let g_finalTop;
function getFinalTop(gotoRow)
{
	retTop = -1;
	colH = document.querySelector('.cell').getBoundingClientRect().height;
	retTop = (colH * gotoRow) + (colH / 2) - (divBall.getBoundingClientRect().height / 2)
	//divBall.style.top = String((colH * gotoRow) + (colH / 2) - (divBall.getBoundingClientRect().height / 2)) + "px"
	return retTop;
}


function moveDown(){
	curTop = divBall.getBoundingClientRect().top;
	if (curTop < g_finalTop){
		curTop += 1;
		divBall.style.top = String(curTop) + "px"
	}
	else{
		
		clearInterval(oTime)
	}
	
}


function getUniqueID(){
	let dt = new Date();
	let strID = "";
	strID += getTwoDigString(dt.getDate());
	strID += getTwoDigString(dt.getMonth()); 
	// strID += dt.getFullYear().toString();
	strID += getTwoDigString(new Date().getHours()) + getTwoDigString(new Date().getMinutes());

	return strID;
}

function getTwoDigString(param){
    let retStr = param.toString();

    if (param < 10){
        retStr = "0" + retStr;
    }

    return retStr;
}

function getGameData(gameId){

	if (gameId === undefined)
	{
		gameId = g_gameID;
	}


	if (localStorage.tictac && JSON.parse(localStorage.tictac)[gameId])
	{
		return JSON.parse(localStorage.tictac)[gameId];
	}
	else
	{
		return -1;
	}
	
}

function init(){
		
/* 	gameID = "1234";
	playerID = "98765";
	
	if (localStorage.tictac === undefined)
	{
		initializeAllData();
		
		oGameData = {
			id: 123,
			status: 1,
			players: [playerID],
			allData: JSON.stringify(allData),	
		}
	}
	else
	{
		oGameData = JSON.parse(localStorage.tictac);
		oGameData.players.push(playerID);
		oGameData.status = 1;
		
	}
	//

	localStorage.tictac = JSON.stringify(oGameData); */

	//selCol = 6;
	
}

function initializeAllData()
{
	allData = [];
	for (i=0; i<10; i++){
		rows = [];
		for (x=0; x<10; x++){
			rows.push("-");
		};
		allData.push(rows)
	}

	allCols = [];
	for (i=0; i<10; i++){
		cols = [];
		for (x=0; x<10; x++){
			cols.push("-");
		};
		allCols.push(cols)
	}
	
	
}

function AddBallIn(selCol){
	putBallIn = allCols[selCol].lastIndexOf("-");
	
	if (g_currPlayer === 1)
	{
		allData[putBallIn][selCol] = "O";
		allCols[selCol][putBallIn] = "O";
	}
	else
	{
		allData[putBallIn][selCol] = "X";
		allCols[selCol][putBallIn] = "X";
	}
    	
	saveData();

	console.table(allData);
	return putBallIn;
}


function temp1(){
	return;
	a = document.createElement('input');
	a.type = "button";
	a.value = "whatever gotham needs me to be";
	// a.onclick = checkForLatestData;
	a.addEventListener("click", SaveAndSwitchPlayer)
	// a.addEventListener("click", checkForLatestData)
	document.body.append(a)
}

function renderFromAllData(paramAllData){
	if (paramAllData === undefined)
	{
		paramAllData = JSON.parse(getGameData().allData);
	}

	paramColData = transpose(paramAllData);
	
	let currCellData;
	let currCell;

	let arrContainers = document.querySelectorAll('.flexContainer');
	for (var i=0; i<10; i++){

		arrCells = arrContainers[i].querySelectorAll('.cells')
		for (var k=0; k<10; k++){
			currCellData = paramColData[i][k];
			currCell = arrCells[k];
			if (currCellData === "O"){
				currCell.classList.add("player1Filled")
				currCell.classList.add("Filled")

			}
			else if (currCellData === "X")
			{
				currCell.classList.add("player2Filled")
				currCell.classList.add("Filled")
			}
		}
	}

}


function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
}


function checkForWinner(){
	//X{3}|O{3}
	let ret = false;
	for (x in allData)
	{
		strCode = allData[x].toLocaleString().replace(/,/g, "");
		if (strCode.search(/X{3}|O{3}/g) > -1)
		{
			ret = true;
		}
	}

	return ret;
}