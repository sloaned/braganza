// explosion art via http://lucasb.eyer.be


var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
var diceShake = new Audio('audio/dice-shake.mp3');
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
var game = {state: "serpentMove", turn: 0};

$(document).ready(function(){
	
	setMaphilightDefaults();
	 
	$('img[usemap]').maphilight();
	$('map').imageMapResize();
	
	$('.mapRegion').click(function(e){
		e.preventDefault();
		var region = $(this).attr('id');
		var regionObj = eval(region);

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
						else if(game.state === "serpentMove"){
							moveSerpent(reachable[i]);
						}
						else if(game.state === "battle"){
							var region = reachable[i];
							var attackBattleResults;
							var defenseBattleResults;
							var attackerKills = 0;
							var defenderKills = 0;
							var attackerSerpentMoves = 0;
							var defenderSerpentMoves = 0;
							game.abstentions = -1;
							setTimeout(function(){
								setTimeout(function(){
									endBattle(region, attackerKills, defenderKills, attackerSerpentMoves, defenderSerpentMoves);
								}, (region.shots * 1500) + 3000);
								defenseBattleResults = battle(highlightedRegion, region.shots);
								//console.log(defenseBattleResults);
								defenderKills = defenseBattleResults[0];
								defenderSerpentMoves = defenseBattleResults[1];
							}, (highlightedRegion.shots * 1500) + 800);
							
							attackBattleResults = battle(reachable[i], highlightedRegion.shots);
							//console.log(attackBattleResults);
							attackerKills = attackBattleResults[0];
							attackerSerpentMoves = attackBattleResults[1];
						}
						else if(game.state === "serpentAttack"){
							console.log("clicked an area on serpentAttack");
							var region = reachable[i];
							var regionSoldiers = region.soldiers;
							var serpentAttackResults;
							if(region.captain){
								regionSoldiers++;
							}
							var serpentKills = 0;
							
							setTimeout(function(){
								serpentAttackResults = endSerpentAttack(region, serpentKills);
							}, (regionSoldiers * 1500) + 3000);
							
							serpentKills = serpentAttack(region, regionSoldiers);
						}
						break;
											
					}
				}
			}
		}

		else if(!highlighted  && regionObj.color === game.players[game.turn].color && (game.state === "move" || (game.state === "battle" && regionObj.battles > 0))){ // player clicks area containing own army, highlight it
			highlightAreas(region, game.state);	
		}
		else if(game.state === "pickCommandPosts"){
			for(var i = 0; i < commandPosts.length; i++){
				if(commandPosts[i].name === region && commandPosts[i].color === ""){
					commandPosts[i].color = game.players[game.turn].color;
					commandPosts[i].flag = game.players[game.turn].color;
					$("#mapArea").append(showArmy(commandPosts[i]));
					
					if(game.turn === game.players.length -1){
						var done = false;
						if(game.players.length > 4){
							done = true;
						}
						else{
							var postsEach = 0;
							for(var i = 0; i < commandPosts.length; i++){
								if(commandPosts[i].color === game.players[game.turn].color){
									postsEach++;
								}
							}
							if(postsEach > 2){
								done = true;
							}
						}
						if(done){
							$(".army").remove();
							game.state = "armCommandPosts";
							$("#instructions").html("<h2>Setup</h2><h4>Part 2: Arm command posts.</h4>Post 15 soldiers among your command posts. No territory may hold more than 8 soldiers.<br><br>Note: play order will reverse once setup is complete");
							if(game.players.length < 6){
								addNeutralArmies();
							}
							calculateAllShots();
							showArmies();	
						}
						$("#image-" + game.players[game.turn].color).css("border", "none");
						game.turn = 0;	
						$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
					}
					else{
						$("#image-" + game.players[game.turn].color).css("border", "none");
						game.turn++;
						$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
					}
					
					break;
				}
			}
			
			
		}
		else if(game.state === "armCommandPosts" && !action){
			for(var i = 0; i < commandPosts.length; i++){
				if(commandPosts[i].color === game.players[game.turn].color && region === commandPosts[i].name){
					if(commandPosts[i].soldiers < 8 && game.players[game.turn].soldiers > 24){
						action = true;
						var addPrompt = "<div class='prompt'><span>You have " + (game.players[game.turn].soldiers - 24)  + " soldiers left to place.</span><br>";
						//addPrompt += "<select id='armPost'>";
						for(var j = 1; j+commandPosts[i].soldiers <= 8 && (game.players[game.turn].soldiers - j) >= 24; j++){
							//addPrompt += "<option>" + j + "</option>";
							addPrompt += "<button onclick='armPost(" + j + ")'>" + j + "</button>";
						}
						//addPrompt += "</select><button onclick='armPost()'>Add soldiers</button>";
						addPrompt += "<button onclick='removePrompt()'>Cancel</button></div>";
						destination = commandPosts[i];
						$('#army-'+ commandPosts[i].name).css("z-index", 1);
						$('#army-'+ commandPosts[i].name).append(addPrompt);
					}
					break;
				}
			}
		}
		else if(game.state === "stageReinforcements"){
			var cannonMove = false;
			for(var i = 0; i < regions.length; i++){
				if(regions[i].name === region){
					if(!action && !game.reinforcementsAction.cannon && regions[i].color === game.players[game.turn].color && regions[i].cannons < 2){
						action = true;
						destination = regions[i];
						var addCannonPrompt = "<div class='prompt'><span>Add a cannon here?</span><br>";
						addCannonPrompt += "<button onclick='addCannon()'>Do it</button><button onclick='removePrompt()'>Cancel</button>";
						
						$('#army-'+ region).css("z-index", 1);
						$('#army-'+ region).append(addCannonPrompt);
						cannonMove = true;
						
					}	
					break;
				}
			}
			
			
			if(!cannonMove){
				for(var i = 0; i < stagingAreas.length; i++){
					if(stagingAreas[i].name === region && stagingAreas[i].color === "" && !game.reinforcementsAction.soldiers && (stagingAreas[i].type === "land" || game.boats > 0)){
						stagingAreas[i].color = game.players[game.turn].color;
						stagingAreas[i].soldiers = 8;
						game.players[game.turn].soldiers -= 8;
						if(stagingAreas[i].type === "sea"){
							game.boats--;
						}
						game.reinforcementsAction.soldiers = true;
						$("#army-" + region).remove();
						$("#mapArea").append(showArmy(stagingAreas[i]));
						break;
					}
					else if(stagingAreas[i].name === region && stagingAreas[i].type === "sea" && game.boats === 0){
						alert("No more ships available");
					}
				}
			}
			
			if(game.reinforcementsAction.cannon && game.reinforcementsAction.soldiers){
				game.reinforcementsAction = {cannon: false, soldiers: false};
				game.players[game.turn].reinforcements--;
				if(game.players[game.turn].reinforcements === 0){
					if(game.turn === game.players.length -1 || (game.turn < (game.players.length -1) && game.players[game.turn+1].cannons < 3)){ // no longer in setup, or setup complete
						game.state = "move";
						$("#instructions").html("<h2>Game</h2><h4>Move troops</h4>Click on any troops you wish to move. Click 'Done' when you are finished moving your armies.<br><br><button onclick='moveDone()'>Done</button>");
						calculateAllMoves();
						$(".army").remove();
						showArmies();
						
						if(game.players[game.turn].cannons === 2){ // we've just completed setup
							game.players.reverse();
							$("#captainImages").empty();
							for(var i = 0; i < game.players.length; i++){
								$("#captainImages").append("<div class='captainImage "  + game.players[i].captainImage + "' id='image-" + game.players[i].color + "'><div class='tint tint-" + game.players[i].color + "'></div></div>");								
							}
						}
						else{
							game.abstentions++;
							if(gameDrawn()){
								gameEndsInDraw();
							}
						}
						$("#image-" + game.players[game.turn].color).css("border", "none");
						if(game.turn === game.players.length-1){
							game.turn = 0;	
						}
						else{
							game.turn++;
						}
						$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
						
					}
					else{ // still in setup
						$("#image-" + game.players[game.turn].color).css("border", "none");
						game.turn++;
						$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
						game.reinforcementsAction = {cannon: false, soldiers: false};
					}
				}
			}
			
			
		}
		else if(game.state === "serpentMove" && regionObj.color === "serpent" && !highlighted){
			highlightAreas(region, "move");
		}
		else if(game.state === "serpentAttack" && regionObj.color === "serpent" && !highlighted){
			highlightAreas(region, "battle");
		}
	});
	
	$("#newGame").click(function(e){
		resetBoard();
		game = {};
		game.state = "setup";
		game.players = [];
		game.over = false;
		game.turn = 0;
		game.boats = 13;
		game.reinforcementsAction = {cannon: false, soldiers: false};
		game.serpentTurn = 0;
		game.action = false;
		game.abstentions = 0;
		var numPlayers = $("#numberOfPlayers").val();
		game.neededToWin = 7;
		if(numPlayers === 2){
			game.neededToWin = 7;
		}
		else if(numPlayers <= 4){
			game.neededToWin = 6;
		}
		else{
			game.neededToWin = 5;
		}
		var commandPostVals = [];
		var colorVals = [];
		for(var i = 0; i < 13; i++){
			commandPostVals.push(i);
		}
		for(var i = 0; i < 6; i++){
			colorVals.push(i);
		}
		var commandPost, color;
		for(var i = 0; i < numPlayers; i++){
			game.players.push({});
			color = Math.floor(Math.random() * colorVals.length);
			game.players[i].color = colors[colorVals[color]];
			commandPost = Math.floor(Math.random() * commandPostVals.length);
			game.players[i].commandPost = commandPosts[commandPostVals[commandPost]];
			game.players[i].commandPost.color = game.players[i].color;
			game.players[i].commandPost.cannons = 1;
			game.players[i].commandPost.captain = true;
			game.players[i].commandPost.flag = game.players[i].color;
			colorVals.splice(color, 1);
			commandPostVals.splice(commandPost, 1);
		
			game.players[i].cannons = 3;
			game.players[i].soldiers = 39;
			game.players[i].reinforcements = 0;
			game.players[i].captainImage = getCaptainImage(game.players[i].commandPost.name);
			
			$("#captainImages").append("<div class='captainImage "  + game.players[i].captainImage + "' id='image-" + game.players[i].color + "'><div class='tint tint-" + game.players[i].color + "'></div></div>");	
		}
		
		//$("#captainImages").append("<br style='clear: left;'/>");
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
		showArmies();
		game.state = "pickCommandPosts";
		$("#instructions").html("<h2>Setup</h2><h4>Part 1: Pick an additional command post</h4>Note: play order will reverse once setup is complete");
		game.turn = 0;
		$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
		placeSerpent();
		
	});
	
	$("#changeToMove").click(function(){
		game.state = "move";
		$(".army").remove();
		showArmies();
	});
	
	$("#changeToBattle").click(function(){
		game.state = "battle";
		$(".army").remove();
		calculateAllShots();
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
	/*placeSerpent();
	randomlyPopulateBoard();
	calculateAllShots();
	showArmies();*/

});

function playerWonGame(){
	game.state = "over";
	$("#image-" + game.players[game.turn].color).css("border", "none");
	$("#instructions").html("<h2>Game Over</h2><h4>" + game.players[game.turn].color + " team wins!</h4>");
};

function gameEndsInDraw(){
	game.state = "over";
	$("#image-" + game.players[game.turn].color).css("border", "none");
	$("#instructions").html("<h2>Game Over</h2><h4>The game ends in a draw.</h4>");
}

function gameWon(){
	var posts = 0;
	for(var i = 0; i < commandPosts.length; i++){
		if(commandPosts[i].hasOwnProperty('flag') && commandPosts[i].flag === game.players[game.turn].color){
			posts++;
		}
	}
	if(posts >= game.neededToWin){
		return true;
	}
	return false;
};

function gameDrawn(){
	if(game.abstentions >= (game.players.length * 2)){
		return true;
	}
	for(var i = 0; i < regions.length; i++){
		if(regions[i].color !== "" && regions[i].color !== "white" && regions[i].color !== "serpent"){
			return false;
		}
	}
	return true;

};

function battlesComplete(){
	console.log("# of reinforcements = " + game.players[game.turn].reinforcements);
	var stagingAreaAvailable = false;
	for(var i = 0; i < stagingAreas.length; i++){
		if(stagingAreas[i].color === "" && (game.boats > 0 || stagingAreas[i].type === "land")){
			stagingAreaAvailable = true;
			break;
		}
	}
	if(game.players[game.turn].reinforcements > 0 && stagingAreaAvailable){
		game.state = "stageReinforcements";
		$("#instructions").html("<h2>You have captured a command post!</h2>You may now stage reinforcements. Add one more battallion of 8 soldiers on any staging area (signified by a triangle). Additionally, add a cannon to any of your territories that does not already have two cannons.");

	}
	else{
		game.state = "move";
		game.abstentions++;
		if(gameDrawn()){
			gameEndsInDraw();
		}
		calculateAllMoves();
		$("#image-" + game.players[game.turn].color).css("border", "none");
		game.turn++;
		if(game.turn >= game.players.length){
			game.turn = 0;
		}
		$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
		$(".army").remove();
		showArmies();
		$("#instructions").html("<h2>Game</h2><h4>Move troops</h4>Click on any troops you wish to move. Click 'Done' when you are finished moving your armies.<br><br><button onclick='moveDone()'>Done</button>");
	}

};

function moveDone(){
	for(var i = 0; i < 40; i++){
		while(regions[i].newSoldiers > 0){
			regions[i].soldiers++;
			regions[i].newSoldiers--;
		}
	}
	for(var i = 0; i < regions.length; i++){
		if(regions[i].color === game.players[game.turn].color){
			regions[i].battles = 1;
		}
	}
	game.state = "battle";
	$(".army").remove();
	calculateAllShots();
	showArmies();
	$("#instructions").html("<h2>Game</h2><h4>Battle</h4>Select one of your armies to attack an adjacent territory. Each of your armies may engage in one battle per turn.<br><br>Click 'Done' to end your turn.<br><button onclick='battlesComplete()'>Done</button>");
};

function addCannon(){
	destination.cannons++;
	game.players[game.turn].cannons--;
	game.reinforcementsAction.cannon = true;
	$("#army-" + destination.name).remove();
	$("#mapArea").append(showArmy(destination));
	action = false;
	
	if(game.reinforcementsAction.cannon && game.reinforcementsAction.soldiers){
		game.reinforcementsAction = {cannon: false, soldiers: false};
		game.players[game.turn].reinforcements--;
		if(game.players[game.turn].reinforcements === 0){
			if(game.turn === game.players.length -1 || (game.turn < (game.players.length -1) && game.players[game.turn+1].cannons < 3)){
				game.state = "move";
				game.abstentions++;
				$("#instructions").html("<h2>Game</h2><h4>Move troops</h4>Click on any troops you wish to move. Click 'Done' when you are finished moving your armies.<br><br><button onclick='moveDone()'>Done</button>");

				calculateAllMoves();
				$(".army").remove();
				showArmies();
				game.abstentions++;
				if(gameDrawn()){
					gameEndsInDraw();
				}
				// need to do something here to determine whose turn it is
				if(game.players[game.turn].cannons === 2){ // we've just completed setup
					game.players.reverse();
					$("#captainImages").empty();
					for(var i = 0; i < game.players.length; i++){
						$("#captainImages").append("<div class='captainImage "  + game.players[i].captainImage + "' id='image-" + game.players[i].color + "'><div class='tint tint-" + game.players[i].color + "'></div></div>");								
					}
				}
				$("#image-" + game.players[game.turn].color).css("border", "none");
				if(game.turn === game.players.length-1){
					game.turn = 0;
				}
				else{
					game.turn++;
				}
					
				$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
						
			}
			else{
				$("#image-" + game.players[game.turn].color).css("border", "none");
				game.turn++;
				$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
			}
		}
	}
};

function armPost(numSoldiers){
	//var numSoldiers = parseInt($("#armPost").val());
	destination.soldiers += numSoldiers;
	game.players[game.turn].soldiers -= numSoldiers;
	if(game.players[game.turn].soldiers === 24){
		if((game.turn) === game.players.length -1){
			game.state = "stageReinforcements";
			$("#instructions").html("<h2>Setup</h2><h4>Part 3: Stage reinforcements</h4>Add one more battallion of 8 soldiers on any staging area (signified by a triangle). Additionally, add a cannon to any of your territories.<br><br>Note: play order will reverse once setup is complete");

			for(var i = 0; i < game.players.length; i++){
				game.players[i].reinforcements = 1;
			}
			$("#image-" + game.players[game.turn].color).css("border", "none");
			game.turn = 0;
			$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
		}
		else{
			$("#image-" + game.players[game.turn].color).css("border", "none");
			game.turn++;
			$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
		}
	}
	
	removePrompt();
};

function removePrompt(){
	$('.'+ destination.name).remove();
	$("#mapArea").append(showArmy(destination));
	$('#army-'+ destination.name).css("z-index", 0);
	action = false;
	
};

/* add neutral armies to any unoccupied command posts */
function addNeutralArmies(){
	for(var i = 0; i < commandPosts.length; i++){
		if(commandPosts[i].color === ""){
			commandPosts[i].color = "white";
			commandPosts[i].soldiers = 4;
			commandPosts[i].flag = "white";
		}
	}
};


/* remove everything from board */
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
		commandPosts[i].flag = "";
	}
	$("#captainImages").empty();
	$(".army").remove();
}


/* show the dice and hits/misses of a battle */
function showBattleResults(region, results){
	//console.log("showing battle results, region = " + region.name + ", results = " + results);
	$("#army-" + region.name).append("<div class='dice' id='dice-" + region.name + "'></div>");
	var result;
	setTimeout(function(){
		diceShake.play();
		var i = 0; 
		function showResult(){
			setTimeout(function(){
				if(i === 2 || i === 5){
					$("#dice-" + region.name).append("<br>");
				}
				if(i === 4){
					$("#battle-" + region.name).append("<br>");
				}
				if(region === highlightedRegion){
					$("#dice-" + region.name).append("<img class='die' src='images/white-die" + results[i] + ".png'>");
				}
				else{
					$("#dice-" + region.name).append("<img class='die' src='images/red-die" + results[i] + ".png'>");
				}
				if(results[i]%2 === 0){
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
		
		result = showResult();
	}, 1400);
	
	return result;
	
	
};

function serpentAttack(region, shots){
	console.log("serpent attack, region = " + region.name + ", shots = " + shots);
	var battleResults = "<div class='battle " + region.name + "' id='battle-" + region.name + "'></div>";
	$("#mapArea").append(battleResults);	
	var kills = 0;
	var results = [];
	var die;
	for(var i = 0; i < shots; i++){
		die = Math.ceil(Math.random() * 6);
		results.push(die);
		if(die%2 === 0) {
			//kill
			kills++;
		}
	}
	showBattleResults(region, results);
	
	return kills;
};

function endSerpentAttack(region, kills){
	console.log("endSerpentAttack, region = " + region.name + ", kills = " + kills);
	var troops = region.soldiers;
	if(region.captain){
		troops++;
	}
	if(kills >= troops){
		region.soldiers = 0;
		region.captain = false;
		region.cannons = 0;
		region.color = "";
		if(gameDrawn()){
			gameEndsInDraw();
		}
	}
	else{
		for(var i = 0; i < kills; i++){
			region.soldiers--;
		}
	}
	
	$('.'+ region.name).remove();
	calculateAllShots();
	$("#mapArea").append(showArmy(region));
	clearHighlight();
	game.state = "battle";
	$("#image-" + game.players[game.serpentTurn].color).css("border", "none");
	$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
	$("#instructions").html("<h2>Game</h2><h4>Battle</h4>Select one of your armies to attack an adjacent territory. Each of your armies may engage in one battle per turn.<br><br>Click 'Done' to end your turn.<br><button onclick='endTurn'>Done</button>");
};

function moveSerpent(region){
	console.log("serpent moved");
	console.log("moveSerpent, region = " + region.name);
	highlightedRegion.color = "";
	region.color = "serpent";
	$('.'+ region.name).remove();
	$('.'+ highlightedRegion.name).remove();
	showSerpent(region);
	clearHighlight();
	action = false;
	game.state = "serpentAttack";
	$("#instructions").html("<h2>Game</h2><h4>SERPENT READY TO ATTACK</h4>" + game.players[game.serpentTurn].color + " team may select the serpent to attack an adjacent enemy ship, or click 'Done' to abstain.<br><button onclick='doneWithSerpent()'>Done</button>");
}

function useSerpent(color, moves){
	game.serpentTurn = 0;
	for(var i = 39; i < regions.length; i++){
		if(regions[i].color === "serpent"){
			regions[i].moves = moves*2;
		}
	}
	
	for(var i = 0; i < game.players.length; i++){
		if(game.players[i].color === color){
			game.serpentTurn = i;
		}
	}
	$("#image-" + game.players[game.turn].color).css("border", "none");
	$("#image-" + game.players[game.serpentTurn].color).css("border", "thick solid black");
	$(".army").remove();
	showArmies();
	game.state = "serpentMove";
	$("#instructions").html("<h2>Game</h2><h4>SERPENT AWAKENED</h4>" + game.players[game.serpentTurn].color + " team may move the serpent, or click 'Done' to abstain.<br><button onclick='doneMovingSerpent()'>Done</button>");
	
};

function doneMovingSerpent(){
	console.log("done moving serpent");
	game.state = "serpentAttack";
	$("#instructions").html("<h2>Game</h2><h4>SERPENT READY TO ATTACK</h4>" + game.players[game.serpentTurn].color + " team may select the serpent to attack an adjacent enemy ship, or click 'Done' to abstain.<br><button onclick='doneWithSerpent()'>Done</button>");
};

function doneWithSerpent(){
	game.state = "battle";
	calculateAllShots();
	$(".army").remove();
	showArmies();
	$("#image-" + game.players[game.serpentTurn].color).css("border", "none");
	$("#image-" + game.players[game.turn].color).css("border", "thick solid black");
	$("#instructions").html("<h2>Game</h2><h4>Battle</h4>Select one of your armies to attack an adjacent territory. Each of your armies may engage in one battle per turn.<br><br>Click 'Done' to end your turn.<br><button onclick='endTurn()'>Done</button>");
};
		
/* remove dead troops from the board */		
function endBattle(region, attackerKills, defenderKills, attackerSerpentMoves, defenderSerpentMoves){
	console.log("highlighted region color = " + highlightedRegion.color);
	console.log("defender color = " + region.color);
	console.log("attacker soldiers = " + highlightedRegion.soldiers);
	console.log("defender soldiers = " + region.soldiers);
	
	var attackerColor = highlightedRegion.color;
	var defenderColor = region.color;
	
	var regionTroops = region.soldiers;
	if(region.captain){ regionTroops++; }
	if(attackerKills >= regionTroops){
		region.captain = false;
		region.soldiers = 0;
		if(region.type === "sea"){
			region.cannons = 0;
		}
		region.color = "";
		
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
		if(gameDrawn()){
			gameEndsInDraw();
		}
	}
	else if(defenderKills > 0){
		var attackSoldiers = highlightedRegion.soldiers;
		for(var i = 0; i < attackSoldiers && i < defenderKills; i++){
			highlightedRegion.soldiers--;
		}
	}
	
	if(region.type === "land" && (!region.captain && region.soldiers === 0) && highlightedRegion.color !== "" && highlightedRegion.landTravel.indexOf(region) !== -1){
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
		if(attackerSerpentMoves > defenderSerpentMoves){
			useSerpent(attackerColor, attackerSerpentMoves-defenderSerpentMoves);
		}
		else if(defenderSerpentMoves > attackerSerpentMoves && region.color !== ""){ // no serpent for neutral team
			useSerpent(defenderColor, defenderSerpentMoves-attackerSerpentMoves);
		}	
	}
	

	
	
};

/* show prompt allowing player to move soldiers into captured territory */
function victoryMove(region){
	destination = region;
	var movePrompt = "<div class='prompt'><span>Victory!</span><br><span>Move troops?</span><br>";
	if(highlightedRegion.captain){
		movePrompt += "Captain <input id='moveCaptain' type='checkbox'><br>";
	}
	if(highlightedRegion.soldiers > 0){ 
		movePrompt += "Soldiers:";
		//movePrompt += "Soldiers <select id='moveSoldiers'>";
		for(var i = 1; i <= highlightedRegion.soldiers && i+region.soldiers+region.newSoldiers <=8; i++){
			//movePrompt += "<option>" + i + "</option>";
			movePrompt += "<button onclick='sendArmy(" + i + ")'>" + i + "</button>";
		}
		//movePrompt += "</select>";
	}
	// movePrompt += "<span><button onclick='sendArmy()'>Move in!</button>";
	movePrompt += "<button onclick='resetBoardAfterBattle()'>No move</button></span></div>";
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

/* move soldiers into captured territory */
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
	if(region.hasOwnProperty('flag')){
		region.flag = highlightedRegion.color;
		if(gameWon()){
			playerWonGame();
		}
		if(game.players[game.turn].soldiers > 0 && game.players[game.turn].reinforcements < 2){
			game.players[game.turn].reinforcements++;
		}
	}
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

/* return to normal view after battle is over */
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


function battle(region, shots){

	var battleResults = "<div class='battle " + region.name + "' id='battle-" + region.name + "'></div>";
	$("#mapArea").append(battleResults);	
	var kills = 0;
	var ones = 0;
	var results = [];
	var die;
	for(var i = 0; i < shots; i++){
		die = Math.ceil(Math.random() * 6);
		if(die === 1){
			ones++;
		}
		results.push(die);
		if(die%2 === 0) {
			//kill
			kills++;
		}
	}
	showBattleResults(region, results);
	
	var battleResults = [kills, Math.floor(ones/2)];
	return battleResults;
	
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
		movePrompt += "Soldiers:<br>";
		//movePrompt += "Soldiers <select id='moveSoldiers'>";
		for(var i = 0; i <= highlightedRegion.soldiers && i+region.soldiers+region.newSoldiers <=8; i++){
			//movePrompt += "<option>" + i + "</option>";
			movePrompt += "<button onclick='sendArmy(" + i + ")'>" + i + "</button>";
		}
		//movePrompt += "</select>";
	}
	movePrompt += "<span><button onclick='cancelMove()'>Cancel</button></span></div>";  // <button onclick='sendArmy()'>Move!</button>
	$('#army-'+ highlightedRegion.name).css("z-index", 1);
	$('#army-'+ highlightedRegion.name).append(movePrompt);
};

function sendArmy(soldiers){
	game.abstentions = -1;
	var captain = $("#moveCaptain").prop('checked');
	if(captain === undefined){
		captain = false;
	}
	//var soldiers = parseInt($("#moveSoldiers").val());
	if(captain || soldiers > 0){
		if(game.state === "move"){
			moveArmy(destination, captain, soldiers);
		}
		else if(game.state === "battle"){
			moveIn(destination, captain, soldiers);
		}
		
	}
	else if(soldiers === 0){
		cancelMove();
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
	else if(region.type === "land" && region.color === ""){ // redundant? wouldn't it be zero already?
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
	if(region.hasOwnProperty('flag')){
		region.flag = highlightedRegion.color;
		if(gameWon()){
			playerWonGame();
		}
	}

	
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
};

function highlightAreas(region, act)
{
		if(!highlighted){	
			for(var i = 0; i < regions.length; i++){
				if(regions[i].name === region && regions[i].color != ""){
					highlighted = true;
					highlightedRegion = regions[i];
					highlightedRegionName = regions[i].name;
					if(act === "move"){
						reachable = findReachableAreas(regions[i]);
					}
					else if(act === "battle"){
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

function findSerpentReachableAreas(region, areasAndNeighbors){  
	var areas = areasAndNeighbors[0];
	var neighbors = [];
	var newNeighbors = [];
	for(var i = 0; i < region.seaTravel.length; i++){
		if(region.seaTravel[i].color === ""){
			if(areas.indexOf(region.seaTravel[i]) === -1){
				areas.push(region.seaTravel[i]);
			}
			neighbors.push(region.seaTravel[i]);
		}
	}
	
	
	for(var i = 0; i < neighbors.length; i++){
		
		var neighbor = neighbors[i];
		for(var j = 0; j < neighbor.seaTravel.length; j++){
			if(neighbor.seaTravel[j].color === "" && neighbor.seaTravel[j] !== region && areas.indexOf(neighbor.seaTravel[j]) === -1){
				areas.push(neighbor.seaTravel[j]);
				newNeighbors.push(neighbor.seaTravel[j]);
			}
		}
	}
	return [areas, newNeighbors];
	
};

function findReachableAreas(region){
	if(region.color === "serpent"){
		var areasAndNeighbors = [[], []];
	
		areasAndNeighbors = findSerpentReachableAreas(region, areasAndNeighbors);
		if(region.moves === 4){
			var neighbors = areasAndNeighbors[1];
			for(var i = 0; i < neighbors.length; i++){
				areasAndNeighbors = findSerpentReachableAreas(neighbors[i], areasAndNeighbors);
			}
		}
		return areasAndNeighbors[0];
	}
	
	var areas = [];
	var neighbors = [];
	if(region.moves > 0){
		for(var i = 0; i < region.landTravel.length; i++){
			
			if(region.landTravel[i].color === "" || (region.landTravel[i].color === region.color && (region.captain === true || region.landTravel[i].soldiers + region.landTravel[i].newSoldiers < 8))){
				areas.push(region.landTravel[i]);
			}
		}
		for(var i = 0; i < region.seaTravel.length; i++){
			if(region.type === "land"){
				if(region.seaTravel[i].color === region.color && region.seaTravel[i].moves > 0 && (region.captain === true || region.seaTravel[i].soldiers < 8)){
					areas.push(region.seaTravel[i]);
				}
			}
			else if(region.type === "sea" && region.seaTravel[i].color === ""){
				areas.push(region.seaTravel[i]);
				neighbors.push(region.seaTravel[i]);
			}	
		}
	}
	if(region.moves === 2 && region.type === "sea"){

		for(var i = 0; i < neighbors.length; i++){
		
			var neighbor = neighbors[i];
			
			if(neighbor.type === "sea" && (neighbor.soldiers < 8 || region.captain === true)){
				for(var j = 0; j < neighbor.landTravel.length; j++){
					if((neighbor.landTravel[j].color === "" || (neighbor.landTravel[j].color === region.color && (region.captain === true || neighbor.landTravel[j].soldiers+neighbor.landTravel[j].newSoldiers < 8))) && neighbor.landTravel[j] != region && areas.indexOf(neighbor.landTravel[j]) === -1 && neighbor.color === ""){
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

function calculateMoves(region){
	if(region.color !== "" && region.color !== "serpent" && (region.captain || region.soldiers > 0)){
		if(region.type === "land"){
			region.moves = 1;
		}
		else if(region.type === "sea"){
			region.moves = 2;
		}
	}
};

function calculateAllMoves(){
	for(var i = 0; i < regions.length; i++){
		calculateMoves(regions[i]);
	}
};

function calculateAllShots(){
	for(var i = 0; i < regions.length; i++){
		if(regions[i].captain || regions[i].soldiers > 0){
			calculateShots(regions[i]);
		}
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
		if(territory.color === game.players[game.turn].color && (territory.soldiers > 0 || territory.captain) && game.state === "move"){
			armyString += "<span class='showMoves'>MOVES: " + territory.moves + "</span><br>";
		}
		else if(territory.color != "" && (territory.soldiers > 0 || territory.captain) && game.state === "battle" && (territory.color !== game.players[game.turn].color || territory.battles > 0)){
			armyString += "<span class='showMoves'>SHOTS: " + territory.shots + "</span><br>";
		}
		if(territory.hasOwnProperty('flag')){
			armyString += "<img class='flag " + territory.color + "' src='images/flag-" + territory.flag + ".png'>";
			if(territory.captain === false){
				armyString += "<br>";
			}
		}
		if(territory.captain || territory.newCaptain){
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

function showSerpent(region){
	var serpentString = "<div class='army " + region.name + "' id='army-" + region.name + "'><div class='armymen'><img class='serpent' src='images/serpent-right.png'></div></div>";
	$("#mapArea").append(serpentString);
};

function showArmies(){
	for(var i = 0; i < regions.length; i++){
		if((regions[i].color != "" || regions[i].cannons > 0) && regions[i].color != "serpent"){
			var army = showArmy(regions[i]);
			$("#mapArea").append(army);
		}	
		else if(regions[i].color === "serpent"){
			showSerpent(regions[i]);
		}
	}
	
};

function placeSerpent(){
	var corners = [water36, water37, water38, water39];
	var cornerNumber = Math.floor(Math.random() * 4);
	corners[cornerNumber].color = "serpent";
	corners[cornerNumber].moves = 4;
	showSerpent(corners[cornerNumber]);
};
