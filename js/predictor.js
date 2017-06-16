$(window).ready(function(){		
	//Print fixtures on load
	$.getJSON("tournament.json", function(data){
		PrintGroupFixtures(data);	
		PrintKnockoutFixtures(data);	
	});

	//Handle change in predictions by user
	$("body").on("change keyup paste", "input", function(event){
		ResultsChange(event.target);
	});	

	//Group fixtures submitted
	$("#submit-groups-button").click(function(){
		SubmitGroupFixtures();
	});

	//Knockout back button clicked
	$("#knockouts-back-button").click(function(){
		HideKnockoutStage();
		ShowGroupStage();
	});
});

//Global Models
var groups = null;
var knockouts = null;
var map = null;

//Prints fixtures and tables
function PrintGroupFixtures(data){
	var groupContent = $("#group-content");
	groups = data["Groups"];
	map = data["TeamNames"];
	groupContent.append("<h2>Group Stage</h2>");
	for (var group in groups){
		fixtures = groups[group]["Fixtures"];		
		var groupTitle = "<h4>Group "+group+"</h4>";
		var groupFixtures = [];
		for (var fixture in fixtures){
			var homeCode = fixtures[fixture]["Home"];
			var homeName = "";
			if (homeCode in map){
				homeName = map[homeCode];
			}
			var awayCode = fixtures[fixture]["Away"];
			var awayName = "";
			if (awayCode in map){
				awayName = map[awayCode];
			}
			var constructedFixture = ConstructFixture(fixture, homeCode, awayCode, homeName, awayName);
			groupFixtures.push(constructedFixture);
		}

		var groupRow = "<div class=\"row\">"+groupTitle;
		groupRow = groupRow + "<div class=\"col-sm-6\">";
		for (var i = 0; i < groupFixtures.length; i++) {
			groupRow = groupRow + groupFixtures[i];
		}
		groupRow = groupRow + "</div><div id=\"group-"+group+"-table-div\" class=\"col-sm-6\"";
		groupRow = groupRow + "</div>";
		groupContent.append(groupRow);
		PrintEmptyTable(group);
		GroupsModelChanged(group, true);
	}
}

//Print Knockouts Round 1
function PrintKnockoutFixtures(data){
	var knockoutContent = $("#knockout-content");
	knockouts = data["Knockouts"];
	knockoutContent.append("<h2>Knockout Rounds</h2>");
	var knockoutFixtures = knockouts["Fixtures"];
	for(round in knockoutFixtures){
		var roundRow = "<div class=\"row\">";
		var roundFixtures = knockoutFixtures[round];
		roundRow = roundRow + "<h4>"+round+"</h4>";
		var divSize = "6";
		if(Object.keys(roundFixtures).length == 1){divSize = "12";}
		//Print each fixture
		for(fixtureId in roundFixtures){
			roundRow = roundRow+"<div id=\"K-"+round+"-"+fixtureId+"\" class=\"col-sm-"+divSize+" "+round+"-fixture\"><div class=\"form-group row\">";
			roundRow = roundRow+"<div class=\"col-xs-3 home-team\">Home</div>";
			roundRow = roundRow+"<form id=\"K-"+round+"-"+fixtureId+"-form\" class=\"form-horizontal\">";
			roundRow = roundRow+"<div class=\"col-xs-6\"><div class=\"col-xs-6\"><input type=\"number\" min=\"0\" id=\""+fixtureId+"-Home\" class=\"form-control input-sm\"></div><div class=\"col-xs-6\"><input type=\"number\" min=\"0\" id=\""+fixtureId+"-Away\" class=\"form-control input-sm\"></div></div>";
			roundRow = roundRow+"</form>";
			roundRow = roundRow+"<div class=\"col-xs-3 away-team\">Away</div>";
			roundRow = roundRow+"</div></div>";
		}
		roundRow = roundRow+"</div>";
		knockoutContent.append(roundRow);
	}
}

//Construct the html for a fixture
function ConstructFixture(fixture, homeCode, awayCode, homeName, awayName){
	var homeInput = "<input id=\""+fixture+"-Home\" type=\"number\" min=\"0\" class=\"form-control input-sm\" required>";
	var awayInput = "<input id=\""+fixture+"-Away\" type=\"number\" min=\"0\" class=\"form-control input-sm\" required>";
	var groupId = homeCode.charAt(0);
	var fixtureForm = "<form id=\""+groupId+"-"+fixture+"-form\" class=\"form-horizontal fixture\"><div class=\"col-xs-6\"><div class=\"col-xs-6\">"+homeInput+"</div><div class=\"col-xs-6\">"+awayInput+"</div></div></form>";
	if(homeName == ""){	homeName = homeCode; }
	if(awayName == ""){	awayName = awayCode; }
	var fixtureDiv = "<div class=\"form-group row\"><div class=\"col-xs-3\">"+homeName+"</div>"+fixtureForm+"<div class=\"col-xs-3\">"+awayName+"</div></div>";
	return fixtureDiv;
}

//Prints an empty table for a group
function PrintEmptyTable(groupId){
	var table = "<table id=\"group-"+groupId+"-table\" class=\"table table-striped\"><thead><tr><th>Name</th><th>Pl</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody id=\"group-"+groupId+"-table-rows\"><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>";
	$("#group-"+groupId+"-table-div").append(table);
}

//Update model with result changes
function ResultsChange(target){
	var id = target.id;
	var value = $(target).val();
	//Get info from id
	var splitId = id.split("-");
	var matchNumber = splitId[0];
	var homeOrAway = splitId[1];
	var fixtureDetails = target.closest("form").id.split("-");
	var groupOrKnockout = fixtureDetails[0];
	if(groupOrKnockout == "K"){
		//It's a knockout game
		console.log('knockout changed');
		var roundId = fixtureDetails[1];
		var match = knockouts["Fixtures"][roundId][matchNumber];
		SetNewResults(homeOrAway, value, match, id);
		KnockoutsModelChanged(roundId, matchNumber);
	}
	else{
		//It's a group game
		console.log('group changed');
		var groupId = groupOrKnockout;
		var match = groups[groupId]["Fixtures"][matchNumber];
		SetNewResults(homeOrAway, value, match, id);
		GroupsModelChanged(groupId);
	}
}

//Sets new results for the match model
function SetNewResults(homeOrAway, value, match, id){
	var intGoals;
	if(homeOrAway == "Home"){
		intGoals = parseInt(value);
		if(!isNaN(intGoals)){
			match["HomeGoals"] = intGoals;
		}			
	}
	else if(homeOrAway == "Away"){
		intGoals = parseInt(value);
		if(!isNaN(intGoals)){
			match["AwayGoals"] = intGoals;
		}			
	}
	else{
		alert("Something went wrong trying to update the score");
		console.log("Error updating score for id: "+id);
	}
	return match;
}

//Called when knockouts model changed
//Traverses entire knockouts and updates next round model
function KnockoutsModelChanged(){
	var rounds = knockouts["Fixtures"];
	var winners = {};
	var losers = {};
	var draws = [];
	for (round in rounds){
		var fixtures = rounds[round]
		for (fixtureId in fixtures){
			var fixtureDetails = fixtures[fixtureId];
			var homeGoals = fixtureDetails["HomeGoals"];
			var awayGoals = fixtureDetails["AwayGoals"];
			if(homeGoals != null && awayGoals != null){
				if(homeGoals > awayGoals){
					//Home Win
					winners[fixtureId] = fixtureDetails["HomeId"];
					losers[fixtureId] = fixtureDetails["AwayId"];
				}
				else if (awayGoals > homeGoals){
					//Away win
					winners[fixtureId] = fixtureDetails["AwayId"];
					losers[fixtureId] = fixtureDetails["HomeId"];
				}
				else{
					//Penalty win. Supported? maybe not
					console.log("draw detected");
					draws.push(fixtureId);
				}
			}
			else{
				//Fill teams if set in winners dictionary
				var homeClassifier = fixtureDetails["Home"].split("-");
				var awayClassifier = fixtureDetails["Away"].split("-");
				
				//Check the classifier is the winner of a previous game or a loser
				if(homeClassifier[0] == "W" && homeClassifier[2] in winners){
					fixtureDetails["HomeId"] = winners[homeClassifier[2]];
				}
				else if (homeClassifier[0] == "L" && homeClassifier[2] in losers){
					fixtureDetails["HomeId"] = losers[homeClassifier[2]];
				}

				//Check the classifier is the winner of a previous game or a loser
				if(awayClassifier[0] == "W" && awayClassifier[2] in winners){
					fixtureDetails["AwayId"] = winners[awayClassifier[2]];
				}
				else if(awayClassifier[0] == "L" && awayClassifier[2] in losers){
					fixtureDetails["AwayId"] = losers[awayClassifier[2]];
				}
			}
		}
	}
	RefreshKnockouts();
}

//Refresh teams in knockout games html
function RefreshKnockouts(){
	var rounds = knockouts["Fixtures"];
	for (roundId in rounds){
		var round = rounds[roundId];
		for (fixtureId in round){
			RefreshKnockoutFixture(roundId, fixtureId);
		}
	}
}

//Called when the groups model has changed
function GroupsModelChanged(groupId, forceRefreshTable = false){
	var groupData = groups[groupId];
	var teams = groupData["Teams"];
	var fixtureChange = false;
	for (teamId in teams){
		teams[teamId] = {P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0};
	}

	//Use fixtures to update teamData
	var fixtures = groupData["Fixtures"];
	for(fixtureId in fixtures){
		var fixture = fixtures[fixtureId];
		if(fixture["HomeGoals"] != null && fixture["AwayGoals"] != null){
			fixtureChange = true;
			//Update home and away team data
			//Home, played, GF, GA, GD
			var homeTeam = teams[fixture["Home"]]
			homeTeam.P++;
			homeTeam.GF += fixture["HomeGoals"];
			homeTeam.GA += fixture["AwayGoals"];
			homeTeam.GD = homeTeam.GF - homeTeam.GA;
			//Away Team played, GF, GA, GD
			var awayTeam = teams[fixture["Away"]];
			awayTeam.P++;
			awayTeam.GF += fixture["AwayGoals"];
			awayTeam.GA += fixture["HomeGoals"];
			awayTeam.GD = awayTeam.GF - awayTeam.GA;
			//W, L, D
			if(fixture["HomeGoals"] > fixture["AwayGoals"]){
				homeTeam.W++;
				awayTeam.L++;
			}
			else if (fixture["HomeGoals"] < fixture["AwayGoals"]){
				awayTeam.W++;
				homeTeam.L++;
			}
			else{
				homeTeam.D++;
				awayTeam.D++;
			}
			//Pts
			homeTeam.Pts = (homeTeam.W*3) + homeTeam.D;
			awayTeam.Pts = (awayTeam.W*3) + awayTeam.D;

			//Set the model again
			teams[fixture["Home"]] = homeTeam;
			teams[fixture["Away"]] = awayTeam;
		}		
	}
	groupData["Teams"] = teams;
	groups[groupId] = groupData;
	//If a fixture did change, refresh the table
	if(fixtureChange == true || forceRefreshTable == true){
		RefreshTable(groupId);
	}
}

//Refresh a specific group table
function RefreshTable(groupId){
	var tableRows = $("#group-"+groupId+"-table-rows");
	tableRows.empty();
	var tableArray = [];
	var teams = groups[groupId]["Teams"];	
	tableArray = SortTeamTable(teams, tableArray);
	//Print table array to table
	for (var i = 0; i < tableArray.length; i++) {
		var teamData = tableArray[i];
		if(teamData.name in map){
			teamData.name = map[teamData.name];
		}
		var name = "<td>"+teamData.name+"</td>";
		var p = "<td>"+teamData.p+"</td>";
		var w = "<td>"+teamData.w+"</td>";
		var d = "<td>"+teamData.d+"</td>";
		var l = "<td>"+teamData.l+"</td>";
		var gf = "<td>"+teamData.gf+"</td>";
		var ga = "<td>"+teamData.ga+"</td>";
		var gd = "<td>"+teamData.gd+"</td>";
		var pts = "<td>"+teamData.pts+"</td>";
		var htmlRow = "<tr>"+name+p+w+d+l+gf+ga+gd+pts+"</tr>";
		tableRows.append(htmlRow);
	}
}

//Sorts into table according to pts,gd,gf....
function SortTeamTable(teams, tableArray){
	for(var teamId in teams){
		var teamData = teams[teamId];
		var teamArrayObj = {
			name: teamId, 
			p: teamData.P,
			w: teamData.W,
			d: teamData.D,
			l: teamData.L,
			gf: teamData.GF,
			ga: teamData.GA,
			gd: teamData.GD,
			pts: teamData.Pts
		};
		tableArray[tableArray.length] = teamArrayObj;
	}
	//Sort table array
	tableArray.sort(function(a,b){
		return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf;
	});
	return tableArray;
}

//Submit group fixtures button clicked
function SubmitGroupFixtures(){
	if(ValidateGroupFixtures()){
		HideGroupStage();
		//Fill first round games with winners and runners up
		var roundId = "Round1";
		var round1Fixtures = knockouts["Fixtures"][roundId];
		var sortedTables = {};
		for(fixtureId in round1Fixtures){
			var fixtureDetails = round1Fixtures[fixtureId];
			//Get home team
			var classifier = fixtureDetails["Home"];	
			var classifierResult = GetWinnerOrRunnerUpUsingClassifier(sortedTables, groupId, classifier);		
			fixtureDetails["HomeId"] = classifierResult[0];
			sortedTables = classifierResult[1];
			//Get aay team
			classifier = fixtureDetails["Away"];
			classifierResult = GetWinnerOrRunnerUpUsingClassifier(sortedTables, groupId, classifier);
			fixtureDetails["AwayId"] = classifierResult[0];
			sortedTables = classifierResult[1];
			RefreshKnockoutFixture(roundId,fixtureId);
		}
		ShowKnockoutStage();
	}
	else{
		alert("Please fill al group fixtures in");
	}
}

//Returns the winner or the runner up of the group depending on the classifier
function GetWinnerOrRunnerUpUsingClassifier(sortedTables, groupId, classifier){
	var splitClassifier = classifier.split("-");
	var selector = splitClassifier[0];
	var groupId = splitClassifier[2];
	//If we've not already sorted them in a previous fixture
	if(!(groupId in sortedTables)){
		var tableArray = [];
		var teams = groups[groupId]["Teams"];
		tableArray = SortTeamTable(teams, tableArray);
		sortedTables[groupId] = tableArray;
	}
	var teamId = null;
	if(selector == "W"){
		teamId = sortedTables[groupId][0];
	}
	else if (selector == "R"){
		teamId = sortedTables[groupId][1];
	}
	else{
		console.log("Err: round 1 fixture parsing");
	}
	return [teamId.name, sortedTables];
}

//Check all group fixtures have been filled
function ValidateGroupFixtures(){
	for(groupId in groups){
		var groupFixtures = groups[groupId]["Fixtures"];
		for(fixtureId in groupFixtures){
			var fixtureDetails = groupFixtures[fixtureId];
			if(fixtureDetails["HomeGoals"] == null || fixtureDetails["AwayGoals"] == null){
				return false;
			}
		}
	}
	return true;
}

//Refresh the teams in a specific knockout fixture
function RefreshKnockoutFixture(roundId, fixtureId){
	var homeDiv = $($("#K-"+roundId+"-"+fixtureId).find("div.home-team")[0]);
	var awayDiv = $($("#K-"+roundId+"-"+fixtureId).find("div.away-team")[0]);
	var homeTeamId = knockouts["Fixtures"][roundId][fixtureId]["HomeId"];
	var awayTeamId = knockouts["Fixtures"][roundId][fixtureId]["AwayId"];
	if(homeTeamId in map){
		homeTeamId = map[homeTeamId];
	}
	if(awayTeamId in map){
		awayTeamId = map[awayTeamId];
	}
	homeDiv.html(homeTeamId);
	awayDiv.html(awayTeamId);
}

function HideGroupStage(){
	$("#group-content").hide();
	$("#submit-groups-button").hide();
}

function ShowGroupStage(){
	$("#group-content").show();
	$("#submit-groups-button").show();
}

function HideKnockoutStage(){
	$("#knockout-content").hide();
	$("#knockouts-back-button").hide();
	$("#submit-knockouts-button").hide();
}

function ShowKnockoutStage(){
	$("#knockout-content").show();
	$("#knockouts-back-button").show();
	$("#submit-knockouts-button").show();
}














