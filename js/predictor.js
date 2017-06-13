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
		alert('RAWR');
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
		FixturesModelChanged(group, true);
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
			roundRow = roundRow+"<div id=\"K-"+round+"-"+fixtureId+"\" class=\"col-sm-"+divSize+"\"><div class=\"form-group row\">";
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
	var groupOrKnockout = target.closest("form").id.charAt(0);
	if(groupOrKnockout == "K"){
		//It's a knockout game
	}
	else{
		//It's a group game
		var groupId = groupOrKnockout;
		//Get match in data structure to change the predicted score
		var match = groups[groupId]["Fixtures"][matchNumber];
		if(homeOrAway == "Home"){
			match["HomeGoals"] = parseInt(value);
		}
		else if(homeOrAway == "Away"){
			match["AwayGoals"] = parseInt(value);
		}
		else{
			alert("Something went wrong trying to update the score");
			console.log("Error updating score for id: "+id);
		}
		FixturesModelChanged(groupId);
	}	
}

//Called when the groups model has changed
function FixturesModelChanged(groupId, forceRefreshTable = false){
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
	//Add teams to table array
	for(var teamId in teams){
		teamData = teams[teamId];
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
















