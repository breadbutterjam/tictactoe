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


let g_gameID, g_playerID;
let oTime;
let droppingBallTimer;
function onBodyLoad()
{
	// alert("A")


	// slayIt();
	// init();

	//bootstrap 
	$("#status").hide();
	addEventListeners()
}

function addEventListeners(){
	$("#btnNewGame").on("click", newGameClicked);
	$("#btnJoinGame").on("click", joinGameClicked);

	$("#btnBackToMain").on("click", ShowMainControls);

	$("#btnJoinGameWithId").on("click", JoinGameWithID);

	
}

let dropTillRow = -1;
let droppedTill = -1;

function colSelected(event)
{
	console.log(event.currentTarget);
	let colNum = event.currentTarget.getAttribute("col-num");
	dropTillRow = AddBallIn(+colNum-1);


	//temp
	// event.currentTarget.style.backgroundColor = "blue"
	event.currentTarget.classList.add("droppingBallIn")
	
	droppingBallTimer = setInterval(dropBallIn, 100);
	
}


function dropBallIn()
{
	droppedTill++;
	if (droppedTill <= dropTillRow)
	{
		$('.player1Fill').removeClass('player1Fill');
		$('.droppingBallIn .cells')[droppedTill].classList.add('player1Fill');
	}
	else
	{
		clearInterval(droppingBallTimer);
		$('.droppingBallIn div')[dropTillRow].classList.add('player1Filled');
		$('.droppingBallIn').removeClass('droppingBallIn');
		droppedTill = -1;

	}
	
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

	if (JSON.parse(localStorage.tictac)[userInputId] === undefined)
	{
		console.log("no game exists")
	}
	else
	{
		oGameData = JSON.parse(localStorage.tictac)[userInputId];
		oGameData.status = 2;
		g_gameID = oGameData.id;
		oGameData.players.push(g_playerID);
		saveData();

		$('.joinGameControls').hide();

		showGameArea();
	}


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

	g_playerID = parseInt(Math.random()*100);


	initializeAllData();
		
	oGameData = {
		id: g_gameID,
		status: 1,
		players: [g_playerID],
		allData: JSON.stringify(allData),	
	}


	

	//localStorage.tictac ? localStorage.tictac[g_gameID] = JSON.stringify(oGameData) : localStorage.tictac = {}

	saveData();


	showGameArea();

	// oTime = setInterval(checkForPlayer2ready, 500)
	
}

function showGameArea(){
	$('.gameDetailsCont>div')[0].innerHTML += " " + String(g_gameID);

	slayIt();
	$(".gameDetailsCont").show();
}

function checkForPlayer2ready()
{
	gameData = JSON.parse(localStorage.tictac)[g_gameID];
	console.log("gameData", {gameData});
	console.log("status", gameData.status);
	if (status === 2)
	{
		clearInterval(oTime);
		
	}
}

 

function saveData()
{
	storeData = {};
	storeData[g_gameID] = oGameData;
	if (!localStorage.tictac)
	{
		localStorage.tictac = "";
	}

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

	$('.cols').on("click", colSelected)

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

function getGameData(){
	if (localStorage.game)
	{
		return JSON.parse(localStorage.game);
	}
	else
	{
		return -1;
	}
	
}

function init(){
		
	gameID = "1234";
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

	localStorage.tictac = JSON.stringify(oGameData);

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
    allData[putBallIn][selCol] = "O";
    allCols[selCol][putBallIn] = "O";
	console.table(allData);
	return putBallIn;
}