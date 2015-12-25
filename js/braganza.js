var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
var diceAudio = new Audio('audio/dice-throw-on-gameboard.mp3');
var highlighted = false;
var highlightedRegion;
var highlightedRegionName = "";
var reachable = [];
var reachableNames = [];

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
	
	var redDice = rollDice(5, "red");
	var whiteDice = rollDice(5, "white");
	diceAudio.play();
	$("#mapArea").append(redDice);
	$("#mapArea").append(whiteDice);
	
	
	$('.mapRegion').click(function(e){
		e.preventDefault();
		var region = $(this).attr('id');
		if(highlighted && region === highlightedRegionName){  // player reclicks highlighted area, cancel highlight
			clearHighlight();
		}
		else if(highlighted && reachableNames.indexOf(region) !== -1){	// player clicks area surrounding highlighted area, take action
			for(var i = 0; i < reachable.length; i++){
				if(reachable[i].name === region){
					movePlayers(reachable[i]);
				}
			}
		}
		else if(!highlighted && region.color !== ""){ // player clicks area containing army, highlight it
			highlightAreas(region, "move");
		}
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
	showArmies();

});

function movePlayers(region){

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
	
	// land to sea
	else if(highlightedRegion.type === "land" && region.type === "sea"){ 
		region.moves--;
	}
	
	// anywhere to unoccupied land
	else if(region.type === "land" && region.color === ""){ // possibly redundant? wouldn't it be zero already?
		region.moves = 0;
	}
	
	
	
	// move the captain and as many soldiers as possible over
	if(region.color === highlightedRegion.color){
		
		if(region.type === "land")
		{
			if(highlightedRegion.captain === true){
				highlightedRegion.captain = false;
				region.newCaptain = true;
			}
			for(var i = region.soldiers + region.newSoldiers; i < 8 && highlightedRegion.soldiers > 0; i++){
				highlightedRegion.soldiers--;
				region.newSoldiers++;
			}
		}
		else{ // land to sea
			if(highlightedRegion.captain === true){
				highlightedRegion.captain = false;
				region.captain = true;
			}
			for(var i = region.soldiers + region.newSoldiers; i < 8 && highlightedRegion.soldiers > 0; i++){
				highlightedRegion.soldiers--;
				region.soldiers++;
			}
		}
		
	}
	// cannons can only move if moving on boat
	else if(highlightedRegion.type === "sea" && region.type === "sea"){
		region.cannons = highlightedRegion.cannons;
		highlightedRegion.cannons = 0;
	}
	
	// all soldiers/captain move to destination if destination is unoccupied
	if(region.color === ""){
		if(region.type === "land"){
			region.newCaptain = highlightedRegion.captain;
			region.newSoldiers = highlightedRegion.soldiers;
		}
		else{
			region.captain = highlightedRegion.captain;
			region.soldiers = highlightedRegion.soldiers;
		}
		highlightedRegion.soldiers = 0;
		highlightedRegion.captain = false;
	}
	
	// if cannons are left on boat by themselves, remove them
	if(highlightedRegion.type === "sea"){
		if(highlightedRegion.captain === false && highlightedRegion.soldiers === 0){
			highlightedRegion.cannons = 0;
		}
	}
	/*if(region.color === ""){
		if(region.type === "land"){
			region.moves = 1;
		}
		else{
			region.moves = 2;
		}
	}*/
	
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
	$("#mapArea").append(showArmy(region));
	$("#mapArea").append(showArmy(highlightedRegion));
	clearHighlight();
};

function clearHighlight(){ 
	for(var i = 0; i < reachable.length; i++)
	{
		var data = $("#" + reachable[i].name).mouseout().data('maphilight') || {};
		data.alwaysOn = !data.alwaysOn;
		$("#" + reachable[i].name).data('maphilight', data).trigger('alwaysOn.maphilight');
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
	var landEach = Math.floor(30/armyNumber);
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
			
			armies[i].territories[j].soldiers = Math.ceil(Math.random() * 7) + 1;
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
				}
				if(region.moves === 2 && region.seaTravel[i].color === "" || region.seaTravel[i].color === region.color){
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
					if((neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === true || neighbor.landTravel[j].soldiers < 8))) && neighbor.landTravel[j] != region && areas.indexOf(neighbor.landTravel[j]) === -1){
						areas.push(neighbor.landTravel[j]);
					}
				}
			}
			if(neighbor.type === "sea"){
				for(var j = 0; j < neighbor.seaTravel.length; j++){
					if(neighbor.seaTravel[j].color === ""/* || (neighbor.seaTravel[j].color === region.color && (region.captain === true || neighbor.seaTravel[j].soldiers < 8)))*/ && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1){
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
			areas.push(region.attack[i]);
		}
	}
	return areas;
};

function findSerpentAttackableAreas(region){
	var areas = [];
	for(var i = 0; i < region.attack.length; i++){
		if(region.attack[i].type === "sea" && region.attack[i].color !== ""){
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

function calculateDice(region){
	var dice = 0;
	if(region.captain){
		dice++;
	}
	if(region.soldiers > 1){
		dice += 2;
	}
	else if(region.soldiers === 1){
		dice++;
	}
	for(var i = 0; i < region.cannons; i++){
		dice++;
	}
	return dice;
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
	var armyString = "<div class='army " + territory.name + "' id='army-" + territory.name + "'><div class='armymen'>";
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
	//console.log(armyString);
	return armyString;
};

function showArmies(){
	for(var i = 0; i < regions.length; i++){
		if((regions[i].color != "" || regions[i].cannons > 0) && regions[i].color != "serpent"){
			var army = showArmy(regions[i]);
			$("#mapArea").append(army);
		}	
		else if(regions[i].color === "serpent"){
			var serpentString = "<div class='army' id='army-" + regions[i].name + "'><div class='armymen'><img class='serpent' src='images/serpent-right.png'></div></div>";
			$("#mapArea").append(serpentString);
		}
	}
	
};


function placeSerpent(){
	var corners = [water36, water37, water38, water39];
	var cornerNumber = Math.floor(Math.random() * 4);
	corners[cornerNumber].color = "serpent";
};
