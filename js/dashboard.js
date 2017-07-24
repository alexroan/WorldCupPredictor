$(window).ready(function(){	
	
	//If user already logged in
	if(localStorage.getItem("Name") != null 
		&& localStorage.getItem("Email") != null
		&& localStorage.getItem("FacebookId") != null){
		SetUser();		
	}

});

var serverAddress = "http://worldcup.dev/server";
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
	console.log(user);
	$("#facebook-login-btn").hide();
	GetUserPredictions();
}	

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
			PrintPredictions();
		}
	);	
}

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

//Loads the user's predictions and compares with real model results
function PrintPredictions(){
	console.log(groupPredictions, knockoutPredictions, realModel, totalPoints, map);
	var actualResults = realModel["Results"];
	for(groupId in groupPredictions){
		$("#predictions-div").append("<h4>Group "+groupId+"</h4>");
		var group = groupPredictions[groupId];
		var groupFixtures = group["Fixtures"];
		for (fixtureId in groupFixtures){
			var fixturePrediction = groupFixtures[fixtureId];
			var actualResult = actualResults[fixtureId];
			var div = DeterminePredictionResult(fixturePrediction, actualResult);
			$("#predictions-div").append(div);
		}
		//TODO Print Table
		$("#predictions-div").append("<h5>Table</h5>");
	}
	$("#score").html(totalPoints);
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
	else if (predictionPoints == 1){
		resultClass = "correct-result";
	}
	else if (predictionPoints == 3){
		resultClass = "correct-score";
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

