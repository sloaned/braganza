var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
var diceAudio = new Audio('audio/dice-throw-on-gameboard.mp3');
var highlighted = false;
var highlightedRegion;
var reachable = [];
var attackable = [];

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
		if(region.color !== "")
		{
			highlightReachableAreas(region);
		}
	});
	
	/*$('.army').click(function(e){
		e.preventDefault();
		var armyId = $(this).attr('id').toString();
		var region = armyId.substr(5);
		console.log("region = ");
		console.log(region);
	});*/
	
	randomlyPopulateBoard();
	showArmies();

});

function randomlyPopulateBoard(){
	var armyNumber = Math.ceil(Math.random()*2) + 1;
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
			armies[i].territories.push(regions[num]);
			var index = values.indexOf(num);
			values.splice(index, 1);
		}
		for(var j = 0; j < armies[i].territories.length; j++)
		{
			armies[i].territories[j].color = armies[i].color;
			armies[i].territories[j].soldiers = Math.ceil(Math.random() * 4) + 4;
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

function highlightAttackableAreas(region){
	if(highlighted && region === highlightedRegion.name){
		for(var i = 0; i < regions.length; i++){
			if(regions[i].name === region){
				for(var j = 0; j < attackable.length; j++){
					var data = $("#" + attackable[j].name).mouseout().data('maphilight') || {};
					data.alwaysOn = !data.alwaysOn;
					$("#" + attackable[j].name).data('maphilight', data).trigger('alwaysOn.maphilight');
				}
			}
		}
		var data = $("#" + region).mouseout().data('maphilight') || {};
		data.alwaysOn = !data.alwaysOn;
		data.strokeWidth = 1;
		data.fillOpacity = 0.4;
		$("#" + region).data('maphilight', data).trigger('alwaysOn.maphilight');
		highlighted = false;
		attackable = [];
	}
	else if(!highlighted)
	{	
		for(var i = 0; i < regions.length; i++)
		{
			if(regions[i].name === region && regions[i].color != ""){
				highlighted = true;
				highlightedRegion = regions[i];
				attackable = findAttackableAreas(regions[i]);
				for(var j = 0; j < attackable.length; j++)
				{
					var data = $("#" + attackable[j].name).mouseout().data('maphilight') || {};
					data.alwaysOn = !data.alwaysOn;
					$("#" + attackable[j].name).data('maphilight', data).trigger('alwaysOn.maphilight');
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

function highlightReachableAreas(region)
{
		if(highlighted && region === highlightedRegion.name)
		{
			for(var i = 0; i < regions.length; i++)
			{
				if(regions[i].name === region){
					for(var j = 0; j < reachable.length; j++)
					{
						var data = $("#" + reachable[j].name).mouseout().data('maphilight') || {};
						data.alwaysOn = !data.alwaysOn;
						$("#" + reachable[j].name).data('maphilight', data).trigger('alwaysOn.maphilight');
					}
				}
			}
			var data = $("#" + region).mouseout().data('maphilight') || {};
			data.alwaysOn = !data.alwaysOn;
			data.strokeWidth = 1;
			data.fillOpacity = 0.4;
			$("#" + region).data('maphilight', data).trigger('alwaysOn.maphilight');

			highlighted = false;
			reachable = [];
		}
		else if(!highlighted)
		{	
			for(var i = 0; i < regions.length; i++)
			{
				if(regions[i].name === region && regions[i].color != ""){
					highlighted = true;
					highlightedRegion = regions[i];
					reachable = findReachableAreas(regions[i], 2);
					for(var j = 0; j < reachable.length; j++)
					{
						var data = $("#" + reachable[j].name).mouseout().data('maphilight') || {};
						data.alwaysOn = !data.alwaysOn;
						$("#" + reachable[j].name).data('maphilight', data).trigger('alwaysOn.maphilight');
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

function findReachableAreas(region, moves){
	var areas = [];
	var neighbors = [];

	for(var i = 0; i < region.landTravel.length; i++){
		if(region.landTravel[i].color === "" || (region.landTravel[i].color === region.color && (region.captain === true || region.landTravel[i].soldiers < 8))){
			areas.push(region.landTravel[i]);
		}
	}
	for(var i = 0; i < region.seaTravel.length; i++){
		if(region.type === "land"){
			if(region.seaTravel[i].color === region.color && (region.captain === true || region.seaTravel[i].soldiers < 8)){
				areas.push(region.seaTravel[i]);
			}
		}
		else if(region.type === "sea"){
			if(region.seaTravel[i].color === "" || (region.seaTravel[i].color === region.color && (region.captain === true || region.seaTravel[i].soldiers < 8))){
				areas.push(region.seaTravel[i]);
			}
			if(moves === 2 && region.seaTravel[i].color === "" || region.seaTravel[i].color === region.color){
				neighbors.push(region.seaTravel[i]);
			}
		}		
	}
	
	if(moves === 2 && region.type === "sea"){

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
					if((neighbor.seaTravel[j].color === "" || (neighbor.seaTravel[j].color === region.color && (region.captain === true || neighbor.seaTravel[j].soldiers < 8))) && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1){
						areas.push(neighbor.seaTravel[j]);
					}
				}
			}
			else if(neighbor.type === "land"){
				for(var j = 0; j < neighbor.landTravel.length; j++){
					if((neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === true || neighbor.landTravel[j].soldiers < 8))) && neighbor.landTravel[j] != region && areas.indexOf(neighbor.landTravel[j]) === -1){
						areas.push(neighbor.landTravel[j]);
					}
				}
				for(var j = 0; j < neighbor.seaTravel.length; j++){
					if(((neighbor.seaTravel[j].color === region.color && (region.captain === true || neighbor.seaTravel[j].soldiers < 8))) && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1){
						areas.push(neighbor.seaTravel[j]);
					}
				}
			}
		}		
	}
	return areas;
};

function findAttackableAreas(region){
	var areas = [];
	for(var i = 0; i < region.attack.length; i++){
		if(region.attack[i].color != "" && region.attack[i].color != "serpent" && region.attack[i].color != region.color){
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
	if(territory.captain === true){
		armyString += "<img class='captain " + territory.color + "' src='images/captain-" + territory.color + ".png'><br>";
	}
	for(var i = 0; i < territory.soldiers; i++){
		armyString += "<img class='soldier' src='images/soldier-" + territory.color + ".png'>";
		if(i === 3 || i === territory.soldiers-1){
			armyString += "<br>";
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
		if(regions[i].color != "" && regions[i].color != "serpent"){
			var army = showArmy(regions[i]);
			$("#mapArea").append(army);
		}	
	}
};



