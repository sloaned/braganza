var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
var diceAudio = new Audio('audio/dice-throw-on-gameboard.mp3');


$(document).ready(function(){
	
	/*var currentMousePos = { x: -1, y: -1 };
	$('#gameboard').click(function(event){
		currentMousePos.x = event.pageX;
		currentMousePos.y = event.pageY;
		alert(currentMousePos.x + ", " + currentMousePos.y);
	});

	$(".mapRegion").click(function(){
		var $area = $(this).attr('id');
		alert("you clicked " + $area);
		
	});*/
	
	//setAttackMaphilight();
	var highlighted = false;
	var highlightedRegion;
	setMaphilightDefaults();
	 
	$('img[usemap]').maphilight();
	$('map').imageMapResize();
	
	var redDice = rollDice(5, "red");
	var whiteDice = rollDice(5, "white");
	/*
	water39.color = "orange";
	water39.soldiers = 5;
	water39.cannons = 1;
	water39.captain = 1;
	
	var army = showArmy(water39);
	$("#mapArea").append(army);*/
	$("#mapArea").append(redDice);
	$("#mapArea").append(whiteDice);
	
	
	$('.mapRegion').click(function(e){
		e.preventDefault();
		var region = $(this).attr('id');
		if(highlighted && region === highlightedRegion.name)
		{
			for(var i = 0; i < regions.length; i++)
			{
				if(regions[i].name === region){
					var areas = findReachableAreas(regions[i], 2);
					for(var j = 0; j < areas.length; j++)
					{
						var data = $("#" + areas[j].name).mouseout().data('maphilight') || {};
						data.alwaysOn = !data.alwaysOn;
						$("#" + areas[j].name).data('maphilight', data).trigger('alwaysOn.maphilight');
					}
				}
			}
			var data = $(this).mouseout().data('maphilight') || {};
			data.alwaysOn = !data.alwaysOn;
			data.strokeWidth = 1;
			data.fillOpacity = 0.3;
			$(this).data('maphilight', data).trigger('alwaysOn.maphilight');

			highlighted = false;
		}
		else if(!highlighted)
		{
			
			for(var i = 0; i < regions.length; i++)
			{
				if(regions[i].name === region && regions[i].color != ""){
					highlighted = true;
					highlightedRegion = regions[i];
					var areas = findReachableAreas(regions[i], 2);
					for(var j = 0; j < areas.length; j++)
					{
						var data = $("#" + areas[j].name).mouseout().data('maphilight') || {};
						data.alwaysOn = !data.alwaysOn;
						$("#" + areas[j].name).data('maphilight', data).trigger('alwaysOn.maphilight');
					}
					break;
				}
			}
			if(highlighted)
			{
				var data = $(this).mouseout().data('maphilight') || {};
				data.alwaysOn = !data.alwaysOn;
				data.strokeWidth = 6;
				data.fillOpacity = 0.4;
				$(this).data('maphilight', data).trigger('alwaysOn.maphilight');
			}
			
		}
	});
	randomlyPopulateBoard();
	showArmies();

});

function randomlyPopulateBoard(){
	var armyNumber = Math.ceil(Math.random()*5) + 1;
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
			values.splice(num, 1);
		}
		for(var j = 0; j < armies[i].territories.length; j++)
		{
			armies[i].territories[j].color = armies[i].color;
			armies[i].territories[j].soldiers = Math.ceil(Math.random() * 7) + 1;
			var artillery = Math.ceil(Math.random() * 6);
			if(artillery < 4)
			{
				armies[i].territories[j].cannons = 0;
			}
			else if(artillery < 6)
			{
				armies[i].territories[j].cannons = 1;
			}
			else
			{
				armies[i].territories[j].cannons = 2;
			}
		}
		armies[i].territories[0].captain = 1;
		
	}
	
};

function showArmies(){
	for(var i = 0; i < regions.length; i++)
	{
		if(regions[i].color != "" && regions[i].color != "serpent")
		{
			var army = showArmy(regions[i]);
			$("#mapArea").append(army);
		}	
	}
};

function findReachableAreas(region, moves){
	var areas = [];
	if(moves === 1){
		for(var i = 0; i < region.landTravel.length; i++)
		{
			if(region.landTravel[i].color === "" || (region.landTravel[i].color === region.color && (region.captain === 1 || region.landTravel[i].soldiers < 8)))
			{
				areas.push(region.landTravel[i]);
			}
		}
		for(var i = 0; i < region.seaTravel.length; i++)
		{
			if(region.type === "land")
			{
				if(region.seaTravel[i].color === region.color && (region.captain === 1 || region.seaTravel[i].soldiers < 8))
				{
					areas.push(region.seaTravel[i]);
				}
			}
			else if(region.type === "sea")
			{
				if(region.seaTravel[i].color === "" || (region.seaTravel[i].color === region.color && (region.captain === 1 || region.seaTravel[i].soldiers < 8)))
				{
					areas.push(region.seaTravel[i]);
				}
			}		
		}
		return areas;
	}
	else if(moves === 2){
		var neighbors = [];
		
		if(region.type === "sea")
		{
			for(var i = 0; i < region.landTravel.length; i++)
			{
				if(region.landTravel[i].color === "" || (region.landTravel[i].color === region.color && (region.captain === 1 || region.landTravel[i].soldiers < 8)))
				{
					neighbors.push(region.landTravel[i]);
					areas.push(region.landTravel[i]);
				}
			}
			for(var i = 0; i < region.seaTravel.length; i++)
			{
				if(region.seaTravel[i].color === "" || (region.seaTravel[i].color === region.color && (region.captain === 1 || region.seaTravel[i].soldiers < 8)))
				{
					neighbors.push(region.seaTravel[i]);
					areas.push(region.seaTravel[i]);
				}
			}
			
			var neighborSize = neighbors.length;

			for(var i = 0; i < neighborSize; i++)
			{
				var neighbor = neighbors[i];
				
				if(neighbor.type === "sea")
				{
					for(var j = 0; j < neighbor.landTravel.length; j++)
					{
						if((neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === 1 || neighbor.landTravel[j].soldiers < 8))) && neighbor.landTravel[j] != region && areas.indexOf(neighbor.landTravel[j]) === -1)
						{
							areas.push(neighbor.landTravel[j]);
						}
					}
					for(var j = 0; j < neighbor.seaTravel.length; j++)
					{
						if((neighbor.seaTravel[j].color === "" || (neighbor.seaTravel[j].color === region.color && (region.captain === 1 || neighbor.seaTravel[j].soldiers < 8))) && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1)
						{
							areas.push(neighbor.seaTravel[j]);
						}
					}
				}
				else if(neighbor.type === "land")
				{
					for(var j = 0; j < neighbor.landTravel.length; j++)
					{
						if((neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === 1 || neighbor.landTravel[j].soldiers < 8))) && neighbor.landTravel[j] != region && areas.indexOf(neighbor.landTravel[j]) === -1)
						{
							areas.push(neighbor.landTravel[j]);
						}
					}
					for(var j = 0; j < neighbor.seaTravel.length; j++)
					{
						if(((neighbor.seaTravel[j].color === region.color && (region.captain === 1 || neighbor.seaTravel[j].soldiers < 8))) && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1)
						{
							areas.push(neighbor.seaTravel[j]);
						}
					}
				}
			}
		}
		else if(region.type === "land")
		{
			for(var i = 0; i < region.landTravel.length; i++)
			{
				if(region.landTravel[i].color === "" || (region.landTravel[i].color === region.color && (region.captain === 1 || region.landTravel[i].soldiers < 8)))
				{
					neighbors.push(region.landTravel[i]);
					areas.push(region.landTravel[i]);
				}
			}
			for(var i = 0; i < region.seaTravel.length; i++)
			{
				if((region.seaTravel[i].color === region.color && (region.captain === 1 || region.seaTravel[i].soldiers < 8)))
				{
					neighbors.push(region.seaTravel[i]);
					areas.push(region.seaTravel[i]);
				}
			}
			
			var neighborSize = neighbors.length;
			for(var i = 0; i < neighborSize; i++)
			{
				var neighbor = neighbors[i];
				
				if(neighbor.type === "sea")
				{
					for(var j = 0; j < neighbor.landTravel.length; j++)
					{
						if(areas.indexOf(neighbor.landTravel[j]) === -1 && neighbor.landTravel[j] != region && (neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === 1 || neighbor.landTravel[j].soldiers < 8))))
						{
							areas.push(neighbor.landTravel[j]);
						}
					}
					for(var j = 0; j < neighbor.seaTravel.length; j++)
					{
						if(areas.indexOf(neighbor.seaTravel[j]) === -1 && neighbor.seaTravel[j] != region && (neighbor.seaTravel[j].color === "" || (neighbor.seaTravel[j].color === region.color && (region.captain === 1 || neighbor.seaTravel[j].soldiers < 8))))
						{
							areas.push(neighbor.seaTravel[j]);
						}
					}
				}
				else if(neighbor.type === "land")
				{
					for(var j = 0; j < neighbor.landTravel.length; j++)
					{
						if((neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === 1 || neighbor.landTravel[j].soldiers < 8))) && neighbor.landTravel[j] != region && areas.indexOf(neighbor.landTravel[j]) === -1)
						{
							areas.push(neighbor.landTravel[j]);
						}
					}
					for(var j = 0; j < neighbor.seaTravel.length; j++)
					{
						if((neighbor.seaTravel[j].color === region.color && (region.captain === 1 || neighbor.seaTravel[j].soldiers < 8)) && neighbor.seaTravel[j] != region && areas.indexOf(neighbor.seaTravel[j]) === -1)
						{
							areas.push(neighbor.seaTravel[j]);
						}
					}
				}
				
			}
		}
	}
	return areas;
};



/*function setAttackMaphilight(){
	$.fn.maphilight.defaults = {
		fill: true,
		fillColor: '000000', 
		fillOpacity: 0.2,
		stroke: true,
		strokeColor: 'ff0000',
		strokeOpacity: 1,
		strokeWidth: 1,
		fade: true,
		alwaysOn: false,
		neverOn: false,
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
	
};*/

function setMaphilightDefaults(){
	$.fn.maphilight.defaults = {
		fill: true,
		fillColor: '000000', 
		fillOpacity: 0.3,
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


function rollDice(dice, color){
	
	var diceString = "<div class='dice' id='" + color + "Dice'>";
	var dieRoll;
	for(var i = 0; i < dice; i++)
	{
		dieRoll = Math.ceil(Math.random()*6);
		diceString += "<img class='die' src='images/" + color + "-die" + dieRoll + ".png'>";
		if(i === 1)
		{
			diceString += "<br>";
		}
	}
	diceString += "</div>";
	diceAudio.play();
	return diceString;
	
};

function showArmy(territory){
	var armyString = "<div class='army " + territory.name + "'><div class='armymen'>";
	if(territory.captain === 1)
	{
		armyString += "<img class='captain " + territory.color + "' src='images/captain-" + territory.color + ".png'><br>";
	}
	for(var i = 0; i < territory.soldiers; i++)
	{
		armyString += "<img class='soldier' src='images/soldier-" + territory.color + ".png'>";
		if(i === 3 || i === territory.soldiers-1)
		{
			armyString += "<br>";
		}
	}
	for(var i = 0; i < territory.cannons; i++)
	{
		armyString += "<img class='cannon' src='images/cannon-" + territory.color + ".png'>";
	}
	armyString += "</div></div>";
	return armyString;
}



