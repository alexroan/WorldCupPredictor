$(window).ready(function(){	
	
	//If user already logged in
	if(localStorage.getItem("Name") != null 
		&& localStorage.getItem("Email") != null
		&& localStorage.getItem("FacebookId") != null){
		SetUser();		
	}

});

var user = null;
var groupPredictions = null;
var knockoutPredictions = null;
var map = null;
var realModel = null;


//Sets user details from localStorage
function SetUser(){
	user = {};
	user["Name"] = localStorage.getItem("Name");
	user["Email"] = localStorage.getItem("Email");
	user["FacebookId"] = localStorage.getItem("FacebookId");
	
	UserModelChanged();
}

//Called when logged into facebook
function UserModelChanged(){
	$("#facebook-login-btn").hide();
	GetUserPredictions();
}	

//Get specific user prediction model
function GetUserPredictions(){
	var path = serverAddress+"/userpredictions.php";
	$.post(
		path,
		{Email: user["Email"]},
		function(result){
			var jsonResult = JSON.parse(result);
			groupPredictions = jsonResult["Groups"];
			knockoutPredictions = jsonResult["Knockouts"];
			map = jsonResult["TeamNames"];
			totalPoints = jsonResult["TotalPoints"];
			GetRealModel();
		}
	);	
}

//Get the real model of actual results
function GetRealModel(){
	var path = serverAddress+"/realmodel.php";
	$.get(
		path,
		function(result){
			jsonResult = JSON.parse(result);
			realModel = jsonResult;
			GetMap();
			PrintGroupPredictions();
			PrintKnockoutPredictions();
			$("#score").html(totalPoints);
		}
	);	
}

//Get team map
function GetMap(){
	var path = serverAddress+"/getmap.php";
	$.ajax({
		async: false,
		type: 'GET',
		url: path,
		success: function(data){
			var jsonData = JSON.parse(data);
			map = jsonData["TeamNames"];
		}
	});
}

//Loads the user's group predictions and compares with real model results
function PrintGroupPredictions(){
	var actualResults = realModel["Results"];
	$("#predictions-div").append("<h3>Groups</h3>");
	for(groupId in groupPredictions){
		if(groupId == "Points"){
			break;
		}
		$("#predictions-div").append("<h4>Group "+groupId+"</h4>");
		var group = groupPredictions[groupId];
		var groupFixtures = group["Fixtures"];
		for (fixtureId in groupFixtures){
			var fixturePrediction = groupFixtures[fixtureId];
			var actualResult = actualResults[fixtureId];
			var div = DeterminePredictionResult(fixturePrediction, actualResult);
			$("#predictions-div").append(div);
		}
		//Print Table
		//var table = GetPredictedTableHtml(group["Teams"], group["PositionPoints"]);
		//$("#predictions-div").append(table);	
		var positionHtml = GetPredictionTablePointsHtml(groupId, group["PositionPoints"]);
		$("#predictions-div").append(positionHtml);
	}
}

//Print knockout predictions and compares with real model results
function PrintKnockoutPredictions(){
	var actualResults = realModel["Results"];
	$("#predictions-div").append("<h3>Knockouts</h3>");
	for(roundId in knockoutPredictions["Fixtures"]){
		var round = knockoutPredictions["Fixtures"][roundId];
		$("#predictions-div").append("<h4>"+roundId+"</h4>");
		for (fixtureId in round){
			var fixture = round[fixtureId];
			var actualResult = actualResults[fixtureId];
			var div = DeterminePredictionResult(fixture, actualResult);
			$("#predictions-div").append(div);
		}
	}
}

//Using this instead of printing predicted table
function GetPredictionTablePointsHtml(groupId, positionPoints){
	if (positionPoints == null){
		positionPoints = "-";
	}

	var html = "<div class=\"row\">";
	html += "<div class=\"col-xs-10\">Group "+groupId+" table position prediction points</div>";
	html += "<div class=\"col-xs-2 correct-result\">"+positionPoints+"</div>";
	html += "</div>";
	return html;
}

//Sort and print predicted table positions
function GetPredictedTableHtml(teams, positionPoints){
	var tableArray = [];
	tableArray = SortTeamTable(teams, tableArray);
	var table = "<div class=\"row\"><div class=\"col-xs-10\"><table class=\"table table-striped\">";
	table += "<thead><tr><th>Name</th><th>Pl</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>";
	table += "<tbody>";
	for (var i = 0; i < tableArray.length; i++) {
		var team = tableArray[i];
		var teamName = "";
		if (map != null){
			if(team.name in map){
				teamName = map[team.name];
			}
			else{
				teamName = team.name;
			}
		}
		table += "<tr><td>"+teamName+"</td>";
		table += "<td>"+team.p+"</td>";
		table += "<td>"+team.w+"</td>";
		table += "<td>"+team.d+"</td>";
		table += "<td>"+team.l+"</td>";
		table += "<td>"+team.gf+"</td>";
		table += "<td>"+team.ga+"</td>";
		table += "<td>"+team.gd+"</td>";
		table += "<td>"+team.pts+"</td></tr>";
	}
	table += "</tbody>";
	table += "</table></div>";
	if(positionPoints == null){
		positionPoints = 0;
	}
	table += "<div class=\"col-xs-2 correct-result\">"+positionPoints+"</div></div>";
	return table;
}

//Determine how accurate the prediction was
function DeterminePredictionResult(fixturePrediction, actualResult){
	var homeGoalsPrediction = fixturePrediction["HomeGoals"];
	var awayGoalsPrediction = fixturePrediction["AwayGoals"];
	var predictionPoints = -1;
	if(actualResult != null){
		var actualHomeGoals = actualResult["HomeGoals"];
		var actualAwayGoals = actualResult["AwayGoals"];
		predictionPoints = fixturePrediction["Points"];
	} 
	return ConstructPredictionDiv(fixturePrediction, actualResult, predictionPoints);
}

//Determines winner given home and away goals
function DeterminePoints(homeGoalsPrediction, awayGoalsPrediction, actualHomeGoals, actualAwayGoals){
	var points = 0;

	var predictionResult = DetermineWinner(homeGoalsPrediction, awayGoalsPrediction);
	var actualResult = DetermineWinner(actualHomeGoals, actualAwayGoals);

	if(predictionResult == actualResult){
		points++;
		if(homeGoalsPrediction == actualHomeGoals
			&& awayGoalsPrediction == actualAwayGoals){
			points += 2;
		}
	}
	return points;
}

//Determines winner of a game
function DetermineWinner(homeGoals, awayGoals){
	var result = null;
	var homeGoalsInt = parseInt(homeGoals);
	var awayGoalsInt = parseInt(awayGoals);
	if (homeGoalsInt > awayGoalsInt){
		result = "Home";
	}
	else if (awayGoalsInt > homeGoalsInt){
		result = "Away";
	}
	else{
		result = "Draw";
	}
	return result;
}

//Print the prediction div
function ConstructPredictionDiv(fixturePrediction, actualResult, predictionPoints){
	var resultClass = "";
	if(predictionPoints == 0){
		resultClass = "wrong-result";
	}
	else if (predictionPoints >= 1 && predictionPoints < 3){
		resultClass = "correct-result";
	}
	else if (predictionPoints == 3){
		resultClass = "correct-score";
	}
	else if (predictionPoints > 3){
		resultClass = "super-correct";
	}

	//Map id to name
	var homeTeam = null;
	var awayTeam = null;
	if (fixturePrediction["HomeId"] != null && fixturePrediction["AwayId"]){
		homeTeam = fixturePrediction["HomeId"];
		awayTeam = fixturePrediction["AwayId"];
	}
	else{
		homeTeam = fixturePrediction["Home"];
		awayTeam = fixturePrediction["Away"];
	}

	//TODO make sure map is loaded somehow, ideally from server resource
	if(map != null){
		if(homeTeam in map){
			homeTeam = map[homeTeam];
		}
		if(awayTeam in map){
			awayTeam = map[awayTeam];
		}
	}

	var homeGoalsPrediction = fixturePrediction["HomeGoals"];
	var awayGoalsPrediction = fixturePrediction["AwayGoals"];
	var actualHomeGoals = "";
	var actualAwayGoals = "";
	if(actualResult != null){
		var actualHomeGoals = actualResult["HomeGoals"];
		var actualAwayGoals = actualResult["AwayGoals"];
	}	

	var div = "<div class=\"row "+resultClass+"\">";
	div = div + "<div class=\"col-xs-8\">";
	div = div + "<div class=\"col-xs-4\">"+homeTeam+"</div>";
	div = div + "<div class=\"col-xs-4\">"+homeGoalsPrediction+"-"+awayGoalsPrediction+"</div>";
	div = div +	"<div class=\"col-xs-4\">"+awayTeam+"</div>";
	div = div +	"</div><div class=\"col-xs-4\"><div class=\"col-xs-8\">";
	div = div +	actualHomeGoals+"-"+actualAwayGoals;
	div = div +	"</div><div class=\"col-xs-4\">";
	if(predictionPoints != -1){
		div = div +	predictionPoints;
	}	
	div = div +	"</div></div></div>";
	return div;
}

