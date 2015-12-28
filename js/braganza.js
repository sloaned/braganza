// explosion art via http://lucasb.eyer.be


var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
var diceAudio = new Audio('audio/dice-throw-on-gameboard.mp3');
var musket = new Audio('audio/bullets2.mp3');
var ricochet = new Audio('audio/ricochet.mp3');
var highlighted = false;
var highlightedRegion;
var highlightedRegionName = "";
var reachable = [];
var reachableNames = [];
var destination;
var action = false;
var inGame = false;
var game = {state: "move"};

$(document).ready(function(){
	
	/*var currentMousePos = { x: -1, y: -1 };
	$('#gameboard').click(function(event){
		currentMousePos.x = event.pageX;
		currentMousePos.y = event.pageY;
		alert(currentMousePos.x + ", " + currentMousePos.y);
	});*/
	setMaphilightDefaults();
	 
	$('img[usemap]').maphilight();
	$('map').imageMapResize();
	
	/*var redDice = rollDice(5, "red");
	var whiteDice = rollDice(5, "white");
	diceAudio.play();
	$("#mapArea").append(redDice);
	$("#mapArea").append(whiteDice);*/
	
	
	$('.mapRegion').click(function(e){
		e.preventDefault();
		var region = $(this).attr('id');
		if(highlighted && region === highlightedRegionName && !action){  // player reclicks highlighted area, cancel highlight
			clearHighlight();
		}
		else if(highlighted && reachableNames.indexOf(region) !== -1){	// player clicks area surrounding highlighted area, take action
			if(!action){
				for(var i = 0; i < reachable.length; i++){
					if(reachable[i].name === region){
						action = true;
						if(game.state === "move"){
							movePrompt(reachable[i]);
						}
						else if(game.state === "battle"){
							var region = reachable[i];
							var attackerKills = 0;
							var defenderKills = 0;
							setTimeout(function(){
								setTimeout(function(){
									endBattle(region, attackerKills, defenderKills);
								}, (region.shots * 1340) + 2200);
								defenderKills = battle(highlightedRegion, region.shots);
							}, (highlightedRegion.shots * 1340) + 900);
							
							attackerKills = battle(reachable[i], highlightedRegion.shots);	
						}
											
					}
				}
			}
		}
		else if(!highlighted && region.color !== ""){ // player clicks area containing army, highlight it
			if(game.state === "move"){
				highlightAreas(region, "move");
			}
			else if(game.state === "battle"){
				highlightAreas(region, "attack");
			}
			
		}
	});
	
	$("#newGame").click(function(e){
		resetBoard();
		game = {};
		game.state = "move";
		game.players = [];
		game.over = false;
		var numPlayers = $("#numberOfPlayers").val();
		var commandPostVals = [];
		for(var i = 0; i < 13; i++){
			commandPostVals.push(i);
		}
		var commandPost;
		for(var i = 0; i < numPlayers; i++){
			game.players.push({});
			game.players[i].color = colors[i];
			commandPost = Math.floor(Math.random() * commandPostVals.length);
			game.players[i].commandPost = commandPosts[commandPostVals[commandPost]];
			game.players[i].commandPost.color = colors[i];
			game.players[i].commandPost.cannons = 1;
			game.players[i].commandPost.captain = true;
			commandPostVals.splice(commandPost, 1);
		
			game.players[i].cannons = 3;
			game.players[i].soldiers = 39;
			game.players[i].captainImage = getCaptainImage(game.players[i].commandPost.name);
			
			$("#gameInfo").append("<span class='captainImage "  + game.players[i].captainImage + "'><div class='tint " + game.players[i].color + "'</span>");
		}
		for(var i = 0; i < regions.length; i++){
			if(regions[i].color !== "" && regions[i].color !== "serpent"){
				if(regions[i].type === "sea"){
					regions[i].moves = 2;
				}
				else{
					regions[i].moves = 1;
				}
			}
		}
		calculateAllShots();
		showArmies();
	});
	
	$("#changeToMove").click(function(){
		game.state = "move";
		$(".army").remove();
		showArmies();
	});
	
	$("#changeToBattle").click(function(){
		game.state = "battle";
		$(".army").remove();
		showArmies();
	});
	/*
	$('.army').click(function(){
		//e.preventDefault();
		var armyId = $(this).attr('id').toString();
		var region = armyId.substr(5);
		console.log("region = ");
		console.log(region);
	});*/
	placeSerpent();
	randomlyPopulateBoard();
	calculateAllShots();
	showArmies();

});



function resetBoard(){
	for(var i = 0; i < regions.length; i++)
	{
		regions[i].soldiers = 0;
		regions[i].cannons = 0;
		regions[i].captain = false;
		regions[i].color = "";
		regions[i].moves = 0;
		regions[i].shots = 0;
		regions[i].newSoldiers = 0;
		regions[i].newCaptain = false;
	}
	for(var i = 0; i < commandPosts.length; i++){
		commandPosts[i].flag = false;
	}
	$("#gameInfo").empty();
	$(".army").remove();
}


	
function showBattleResults(region, results){
		
	var i = 0; 
	function showResult(){
		setTimeout(function(){
			if(results[i] === 1){
				musket.play();
				$("#battle-" + region.name).append("<img src='images/explosion.png'>");
			}
			else{
				ricochet.play();
				$("#battle-" + region.name).append("<img src='images/miss.png'>");
			}
			i++;
			if(i < results.length){
				showResult();
			}
		
		}, 1340);
		
	};
	
	var result = showResult();
	
	return result;
	
	
};
		
		
function endBattle(region, attackerKills, defenderKills){

	var regionTroops = region.soldiers;
	if(region.captain){ regionTroops++; }
	if(attackerKills >= regionTroops){
		region.color = "";
		region.captain = false;
		region.soldiers = 0;
		if(region.type === "sea"){
			region.cannons = 0;
		}
	}
	else if(attackerKills > 0){
		var defendingSoldiers = region.soldiers;
		for(var i = 0; i < defendingSoldiers && i < attackerKills; i++){
			region.soldiers--;
		}
	}
	
	var attackTroops = highlightedRegion.soldiers;
	if(highlightedRegion.captain){ attackTroops++; }
	if(defenderKills >= attackTroops){
		highlightedRegion.color = "";
		highlightedRegion.captain = false;
		highlightedRegion.soldiers = 0;
		if(highlightedRegion.type === "sea"){
			highlightedRegion.cannons = 0;
		}
	}
	else if(defenderKills > 0){
		var attackSoldiers = highlightedRegion.soldiers;
		for(var i = 0; i < attackSoldiers && i < defenderKills; i++){
			highlightedRegion.soldiers--;
		}
	}
	
	if(region.type === "land" && region.color === "" && highlightedRegion.color !== "" && highlightedRegion.landTravel.indexOf(region) !== -1){
		//attacker won, can move troops in
		victoryMove(region);
	}
	else{
		calculateShots(highlightedRegion);
		calculateShots(region);
		$('.'+ region.name).remove();
		$('.'+ highlightedRegion.name).remove();
		$("#mapArea").append(showArmy(region));
		$("#mapArea").append(showArmy(highlightedRegion));
		action = false;
		clearHighlight();
	}
	
};

function victoryMove(region){
	destination = region;
	var movePrompt = "<div class='prompt'><span>Victory!</span><br><span>Move troops?</span><br>";
	if(highlightedRegion.captain){
		movePrompt += "Captain <input id='moveCaptain' type='checkbox'><br>";
	}
	if(highlightedRegion.soldiers > 0){ 
		movePrompt += "Soldiers <select id='moveSoldiers'>";
		for(var i = 0; i <= highlightedRegion.soldiers && i+region.soldiers+region.newSoldiers <=8; i++){
			movePrompt += "<option>" + i + "</option>";
		}
		movePrompt += "</select>";
	}
	movePrompt += "<span><button onclick='sendArmy()'>Move in!</button><button onclick='resetBoardAfterBattle()'>No move</button></span></div>";
	$('.battle').remove();
	calculateShots(highlightedRegion);
	calculateShots(region);
	$('.'+ region.name).remove();
	$('.'+ highlightedRegion.name).remove();
	$("#mapArea").append(showArmy(region));
	$("#mapArea").append(showArmy(highlightedRegion));
	
	$('#army-'+ highlightedRegion.name).css("z-index", 1);
	$('#army-'+ highlightedRegion.name).append(movePrompt);
};

function moveIn(region, captain, soldiers){
	if(captain === true){	
		highlightedRegion.captain = false;
		region.captain = true;		
	}
	for(var i = 0; i < soldiers; i++){
		highlightedRegion.soldiers--;
		region.soldiers++;
	}
	
	if(highlightedRegion.type === "sea"){
		if(highlightedRegion.captain === false && highlightedRegion.soldiers === 0){
			highlightedRegion.cannons = 0;
		}
	}
	
	region.color = highlightedRegion.color;

	
	if(highlightedRegion.captain === false && highlightedRegion.soldiers === 0){	
		highlightedRegion.color = "";
	}
	
	calculateShots(highlightedRegion);
	calculateShots(region);
	$('.'+ region.name).remove();
	$('.'+ highlightedRegion.name).remove();
	$("#mapArea").append(showArmy(region));
	$("#mapArea").append(showArmy(highlightedRegion));
	action = false;
	clearHighlight();
	
};

function resetBoardAfterBattle(){
	calculateShots(highlightedRegion);
	calculateShots(destination);
	$('.'+ destination.name).remove();
	$('.'+ highlightedRegion.name).remove();
	$("#mapArea").append(showArmy(destination));
	$("#mapArea").append(showArmy(highlightedRegion));
	action = false;
	clearHighlight();
};

function noVictoryMove(){
	calculateShots(highlightedRegion);
	calculateShots(region);
	action = false;
	$('.'+ highlightedRegion.name).remove();
	$('#army-'+ highlightedRegion.name).css("z-index", 0);
	$("#mapArea").append(showArmy(highlightedRegion));
	
};


function battle(region, shots, callback){

	var battleResults = "<div class='battle " + region.name + "' id='battle-" + region.name + "'></div>";
	$("#mapArea").append(battleResults);	
	var kills = 0;
	var results = [];
	for(var i = 0; i < shots; i++){
		if((Math.ceil(Math.random() * 6))%2 === 0) {
			//kill
			results.push(1);
			kills++;
		}
		else{
			//miss
			results.push(0);
		}
	}
	showBattleResults(region, results);
	
	return kills;
	
	
	//callback();
}


function movePrompt(region){
	// account for situations where player choice of who to move is irrelevant
	if(highlightedRegion.type === "sea" && region.type === "sea"){
		moveArmy(region, highlightedRegion.captain, highlightedRegion.soldiers);
		return;
	}
	if(highlightedRegion.captain && (highlightedRegion.soldiers === 0 || (region.soldiers + region.newSoldiers === 8))){
		moveArmy(region, true, 0);
		return;
	}
	if(!highlightedRegion.captain && (highlightedRegion.soldiers === 1 || (region.soldiers + region.newSoldiers === 7))){
		moveArmy(region, false, 1);
		return;
	}
	destination = region;
	var movePrompt = "<div class='prompt'><span>Move which troops?</span><br>";
	if(highlightedRegion.captain){
		movePrompt += "Captain <input id='moveCaptain' type='checkbox'><br>";
	}
	if(highlightedRegion.soldiers > 0 && region.soldiers < 8){ 
		movePrompt += "Soldiers <select id='moveSoldiers'>";
		for(var i = 0; i <= highlightedRegion.soldiers && i+region.soldiers+region.newSoldiers <=8; i++){
			movePrompt += "<option>" + i + "</option>";
		}
		movePrompt += "</select>";
	}
	movePrompt += "<span><button onclick='sendArmy()'>Move!</button><button onclick='cancelMove()'>Cancel</button></span></div>";
	$('#army-'+ highlightedRegion.name).css("z-index", 1);
	$('#army-'+ highlightedRegion.name).append(movePrompt);
};

function sendArmy(){
	var captain = $("#moveCaptain").prop('checked');
	if(captain === undefined){
		captain = false;
	}
	var soldiers = $("#moveSoldiers").val();
	if(captain || soldiers > 0){
		if(game.state === "move"){
			moveArmy(destination, captain, soldiers);
		}
		else if(game.state === "battle"){
			moveIn(destination, captain, soldiers);
		}
		
	}
	
};

function cancelMove(){
	action = false;
	$('.'+ highlightedRegion.name).remove();
	$('#army-'+ highlightedRegion.name).css("z-index", 0);
	$("#mapArea").append(showArmy(highlightedRegion));
};

function moveArmy(region, captain, soldiers){

	// two moves in a boat
	if(highlightedRegion.type === "sea" && highlightedRegion.seaTravel.indexOf(region) === -1 && highlightedRegion.landTravel.indexOf(region) === -1){
		//console.log("two boat moves");
		highlightedRegion.moves = 0;
	}
	
	// sea to sea, 1 space moved
	else if(highlightedRegion.type === "sea" && region.type === "sea"){
		//console.log("sea to sea, 1 move");
		region.moves = highlightedRegion.moves - 1;
		highlightedRegion.moves = 0;
	}
	
	// sea to land in one move, boat moves decrement
	else if(highlightedRegion.type === "sea"){
		//console.log("boat to shore, one move");
		highlightedRegion.moves--;
	}
	
	// land to sea, boat moves decrement
	else if(highlightedRegion.type === "land" && region.type === "sea"){ 
		region.moves--;
	}
	
	// anywhere to unoccupied land
	else if(region.type === "land" && region.color === ""){ // possibly redundant? wouldn't it be zero already?
		region.moves = 0;
	}	
	
	// move troops	
	if(region.type === "land")
	{
		if(captain === true){	
			highlightedRegion.captain = false;
			region.newCaptain = true;		
		}
		for(var i = 0; i < soldiers; i++){
			highlightedRegion.soldiers--;
			region.newSoldiers++;
		}
	}
	else{
		if(captain === true){
			highlightedRegion.captain = false;
			region.captain = true;
		}
		for(var i = 0; i < soldiers; i++){
			highlightedRegion.soldiers--;
			region.soldiers++;
		}
	}
		

	
	if(highlightedRegion.type === "sea" && region.type === "sea"){
		region.cannons = highlightedRegion.cannons;
		highlightedRegion.cannons = 0;
	}

	// if cannons are left on boat by themselves, remove them
	if(highlightedRegion.type === "sea"){
		if(highlightedRegion.captain === false && highlightedRegion.soldiers === 0){
			highlightedRegion.cannons = 0;
		}
	}
	
	region.color = highlightedRegion.color;

	
	if(highlightedRegion.captain === false && highlightedRegion.soldiers === 0){
		highlightedRegion.moves = 0; // redundant?
		if(highlightedRegion.newSoldiers === 0){
			highlightedRegion.color = "";
		}
	}
	
	// boat to land in two moves, boat must move up to the land
	if(highlightedRegion.type === "sea" && region.type === "land" && highlightedRegion.landTravel.indexOf(region) === -1){
		for(var i = 0; i < reachable.length; i++){
			if(reachable[i].type === "sea" && reachable[i].landTravel.indexOf(region) !== -1){
				reachable[i].color = highlightedRegion.color;
				highlightedRegion.color = "";
				reachable[i].captain = highlightedRegion.captain;
				highlightedRegion.captain = false;
				reachable[i].soldiers = highlightedRegion.soldiers;
				highlightedRegion.soldiers = 0;
				reachable[i].cannons = highlightedRegion.cannons;
				highlightedRegion.cannons = 0;
				
				$('.'+reachable[i].name).remove();
				$("#mapArea").append(showArmy(reachable[i]));
				break;
			}
		}
	}

	$('.'+ region.name).remove();
	$('.'+ highlightedRegion.name).remove();
	$('#army-'+ highlightedRegion.name).css("z-index", 0);
	$("#mapArea").append(showArmy(region));
	$("#mapArea").append(showArmy(highlightedRegion));
	action = false;
	clearHighlight();
};

function clearHighlight(){ 
	for(var i = 0; i < reachable.length; i++)
	{
		var data = $("#" + reachable[i].name).mouseout().data('maphilight') || {};
		data.alwaysOn = !data.alwaysOn;
		$("#" + reachable[i].name).data('maphilight', data).trigger('alwaysOn.maphilight');
		$("#" + reachable[i].name).css("cursor", "default");
		$("#army-" + reachable[i].name).css("cursor", "default");
	}
	var data = $("#" + highlightedRegionName).mouseout().data('maphilight') || {};
	data.alwaysOn = !data.alwaysOn;
	data.strokeWidth = 1;
	data.fillOpacity = 0.4;
	$("#" + highlightedRegionName).data('maphilight', data).trigger('alwaysOn.maphilight');
	
	highlightedRegionName = "";
	highlighted = false;
	reachable = [];
	reachableNames = [];
};

function randomlyPopulateBoard(){
	var armyNumber = Math.ceil(Math.random()*5)+1;
	var armies = [];
	var values = [];
	for(var i = 0; i < 78; i++)
	{
		values.push(i);
	}
	var landEach = Math.floor(37/armyNumber);
	for(var i = 0; i < armyNumber; i++)
	{
		armies.push({});
		armies[i].color = colors[i];
		
		armies[i].territories = [];

		for(var j = 0; j < landEach; j++)
		{
			var num = values[Math.floor(Math.random() * values.length)];
			if(regions[num].color != "serpent"){
				armies[i].territories.push(regions[num]);
				var index = values.indexOf(num);
				values.splice(index, 1);
			}
			else{
				j--;
			}
		}
		for(var j = 0; j < armies[i].territories.length; j++)
		{
			if(armies[i].territories[j].type === "sea"){
				armies[i].territories[j].moves = 2;
			}
			else{
				armies[i].territories[j].moves = 1;
			}
			armies[i].territories[j].color = armies[i].color;
			
			armies[i].territories[j].soldiers = Math.ceil(Math.random() * 8);
			var artillery = Math.ceil(Math.random() * 7);
			if(artillery < 5)
			{
				armies[i].territories[j].cannons = 0;
			}
			else if(artillery < 7)
			{
				armies[i].territories[j].cannons = 1;
			}
			else
			{
				armies[i].territories[j].cannons = 2;
			}
		}
		armies[i].territories[0].captain = true;
		
	}
	/*
	var teamList = "<div id='teamList'><span>";
	
	for(var i = 0; i < armies.length; i++){
		teamList += " " + armies[i].color + " ";
	}
	teamList += "</span></div>";
	
	$("#gameInfo").append(teamList);*/
};

function highlightAreas(region, action)
{
		if(!highlighted)
		{	
			for(var i = 0; i < regions.length; i++)
			{
				if(regions[i].name === region && regions[i].color != ""){
					highlighted = true;
					highlightedRegion = regions[i];
					highlightedRegionName = regions[i].name;
					if(action === "move"){
						reachable = findReachableAreas(regions[i]);
					}
					else{ // if(action === "attack")
						reachable = findAttackableAreas(regions[i]);
					}
				
					for(var j = 0; j < reachable.length; j++)
					{
						var data = $("#" + reachable[j].name).mouseout().data('maphilight') || {};
						data.alwaysOn = !data.alwaysOn;
						$("#" + reachable[j].name).data('maphilight', data).trigger('alwaysOn.maphilight');
						
						reachableNames.push(reachable[j].name);
					}
					break;
				}
			}
			if(highlighted)
			{
				var data = $("#" + region).mouseout().data('maphilight') || {};
				data.alwaysOn = !data.alwaysOn;
				data.strokeWidth = 6;
				data.fillOpacity = 0.6;
				$("#" + region).data('maphilight', data).trigger('alwaysOn.maphilight');
			}
			
		}
}

// currently only written for up to two moves
function findSerpentReachableAreas(region){   // can the sea serpent move through occupied territories? (currently no)
	var areas = [];
	var neighbors = [];
	
	if(region.moves > 0){
		for(var i = 0; i < region.seaTravel.length; i++){
			if(region.seaTravel[i].color === ""){
				areas.push(region.seaTravel[i]);
				neighbors.push(region.seaTravel[i]);
			}
		}
	}
	if(region.moves === 2){
		for(var i = 0; i < neighbors.length; i++){
		
			var neighbor = neighbors[i];
			for(var j = 0; j < neighbor.seaTravel.length; j++){
				if(neighbor.seaTravel[j].color === "" && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1){
					areas.push(neighbor.seaTravel[j]);
				}
			}
		}
	}
	return areas;
};

function findReachableAreas(region){
	if(region.color === "serpent"){
		return findSerpentReachableAreas(region);
	}
	
	var areas = [];
	var neighbors = [];
	if(region.moves > 0){
		for(var i = 0; i < region.landTravel.length; i++){
			if(region.landTravel[i].color === "" || (region.landTravel[i].color === region.color && (region.captain === true || region.landTravel[i].soldiers < 8))){
				areas.push(region.landTravel[i]);
			}
		}
		for(var i = 0; i < region.seaTravel.length; i++){
			if(region.type === "land"){
				if(region.seaTravel[i].color === region.color && region.seaTravel[i].moves > 0 && (region.captain === true || region.seaTravel[i].soldiers < 8)){
					areas.push(region.seaTravel[i]);
				}
			}
			else if(region.type === "sea"){
				if(region.seaTravel[i].color === ""/* || (region.seaTravel[i].color === region.color && region.seaTravel[i].moves > 0 && (region.captain === true || region.seaTravel[i].soldiers < 8))*/){
					areas.push(region.seaTravel[i]);
					neighbors.push(region.seaTravel[i]);
				}
				if(region.moves === 2 && region.seaTravel[i].color === region.color){
					neighbors.push(region.seaTravel[i]);	
				}
			}		
		}
	}
	if(region.moves === 2 && region.type === "sea"){

		for(var i = 0; i < neighbors.length; i++){
		
			var neighbor = neighbors[i];
			
			if(neighbor.type === "sea" && (neighbor.soldiers < 8 || region.captain === true)){
				for(var j = 0; j < neighbor.landTravel.length; j++){
					if((neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === true || neighbor.landTravel[j].soldiers < 8))) && neighbor.landTravel[j] != region && areas.indexOf(neighbor.landTravel[j]) === -1 && neighbor.color === ""){
						areas.push(neighbor.landTravel[j]);
					}
				}
			}
			if(neighbor.type === "sea"){
				for(var j = 0; j < neighbor.seaTravel.length; j++){
					if(neighbor.seaTravel[j].color === "" && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1){
						areas.push(neighbor.seaTravel[j]);
					}
				}
			}
		}		
	}
	return areas;
};

function findAttackableAreas(region){
	
	if(region.color === "serpent"){
		return findSerpentAttackableAreas(region);
	}
	var areas = [];
	for(var i = 0; i < region.attack.length; i++){
		if(region.attack[i].color != "" && region.attack[i].color != "serpent" && region.attack[i].color != region.color){
			$("#" + region.attack[i].name).css("cursor", "url('images/bullseye-cursor.png'), default");
			$("#army-" + region.attack[i].name).css("cursor", "url('images/bullseye-cursor.png'), default");
			areas.push(region.attack[i]);
		}
	}
	return areas;
};

function findSerpentAttackableAreas(region){
	var areas = [];
	for(var i = 0; i < region.attack.length; i++){
		if(region.attack[i].type === "sea" && region.attack[i].color !== ""){
			$("#" + region.attack[i].name).css("cursor", "url('images/bullseye-cursor.png'), default");
			$("#army-" + region.attack[i].name).css("cursor", "url('images/bullseye-cursor.png'), default");
			areas.push(region.attack[i]);
		}
	}
	return areas;
};


function setMaphilightDefaults(){
	$.fn.maphilight.defaults = {
		fill: true,
		fillColor: '000000', 
		fillOpacity: 0.4,
		stroke: true,
		strokeColor: 'ff0000',
		strokeOpacity: 1,
		strokeWidth: 1,
		fade: true,
		alwaysOn: false,
		neverOn: true,
		groupBy: false,
		wrapClass: true,
		shadow: false,
		shadowX: 0,
		shadowY: 0,
		shadowRadius: 6,
		shadowColor: '000000',
		shadowOpacity: 0.8,
		shadowPosition: 'outside',
		shadowFrom: false
	};	
};

function calculateAllShots(){
	for(var i = 0; i < regions.length; i++){
		calculateShots(regions[i]);
	}
};

function calculateShots(region){
	var shots = 0;
	if(region.captain){
		shots++;
	}
	if(region.soldiers > 1){
		shots += 2;
	}
	else if(region.soldiers === 1){
		shots++;
	}
	for(var i = 0; i < region.cannons; i++){
		shots++;
	}
	region.shots = shots;
}


function rollDice(dice, color){
	
	var diceString = "<div class='dice' id='" + color + "Dice'>";
	var dieRoll;
	for(var i = 0; i < dice; i++){
		dieRoll = Math.ceil(Math.random()*6);
		diceString += "<img class='die' src='images/" + color + "-die" + dieRoll + ".png'>";
		if(i === 1){
			diceString += "<br>";
		}
	}
	diceString += "</div>";
	return diceString;
};

function showArmy(territory){
	var armyString = "";
	
		armyString += "<div class='army " + territory.name + "' id='army-" + territory.name + "'><div class='armymen'>";
		if(territory.color != "" && game.state === "move"){
			armyString += "<span class='showMoves'>MOVES: " + territory.moves + "</span><br>";
		}
		else if(territory.color != "" && game.state === "battle"){
			armyString += "<span class='showMoves'>SHOTS: " + territory.shots + "</span><br>";
		}
		if(territory.captain === true || territory.newCaptain === true){
			armyString += "<img class='captain " + territory.color + "' src='images/captain-" + territory.color + ".png'><br>";
		}
		for(var i = 0; i < territory.soldiers; i++){
			armyString += "<img class='soldier' src='images/soldier-" + territory.color + ".png'>";
		if(i === 3 || (territory.newSoldiers === 0 && i === territory.soldiers-1)){
				armyString += "<br>";
			}
		}
		if(territory.newSoldiers > 0){
			for(var i = territory.soldiers; i < territory.soldiers + territory.newSoldiers; i++){
				armyString += "<img class='soldier' src='images/soldier-" + territory.color + ".png'>";
				if(i === 3 || i === (territory.soldiers + territory.newSoldiers -1)){
					armyString += "<br>";
				}
			}
		}
		for(var i = 0; i < territory.cannons; i++){
			armyString += "<img class='cannon' src='images/cannon-" + territory.color + ".png'>";
		}
		armyString += "</div></div>";
	
	
	return armyString;
};

function showArmies(){
	for(var i = 0; i < regions.length; i++){
		if((regions[i].color != "" || regions[i].cannons > 0) && regions[i].color != "serpent"){
			var army = showArmy(regions[i]);
			$("#mapArea").append(army);
		}	
		else if(regions[i].color === "serpent"){
			var serpentString = "<div class='army " + regions[i].name + "' id='army-" + regions[i].name + "'><div class='armymen'><img class='serpent' src='images/serpent-right.png'></div></div>";
			$("#mapArea").append(serpentString);
		}
	}
	
};

function placeSerpent(){
	var corners = [water36, water37, water38, water39];
	var cornerNumber = Math.floor(Math.random() * 4);
	corners[cornerNumber].color = "serpent";
};
