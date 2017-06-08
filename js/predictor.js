$(window).ready(function(){
		
	//Print fixtures on load
	$.getJSON("tournament.json", function(data){
		PrintFixtures(data);		
	});

	//Handle change in predictions by user
	$("body").on("change keyup paste", "input", function(event){
		ResultsChange(event.target);
	});
	
});

var groups = null;
var map = null;

function PrintFixtures(data){
	var mainContent = $("#main-content");
	console.log(data);
	groups = data["Groups"];
	map = data["TeamNames"]
	for (var group in groups){
		fixtures = groups[group]["Fixtures"];
		mainContent.append("<h4>Group "+group+"</h4>")
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
			mainContent.append(ConstructFixture(fixture, homeCode, awayCode, homeName, awayName));
		}
	}
	/*
	//Adding validation to each fixture form
	var fixtureForms = $(".fixture");
	for (var i = 0; i < fixtureForms.length; i++) {
		var fixtureForm = fixtureForms[i];
		$(fixtureForm).validator();
	}
	*/
}

//Construct the html for a fixture
function ConstructFixture(fixture, homeCode, awayCode, homeName, awayName){
	var homeInput = "<input id=\""+fixture+"-"+homeCode+"\" type=\"number\" min=\"0\" class=\"form-control input-sm\" required>";
	var awayInput = "<input id=\""+fixture+"-"+awayCode+"\" type=\"number\" min=\"0\" class=\"form-control input-sm\" required>";
	var fixtureForm = "<form class=\"form-horizontal fixture\"><div class=\"col-xs-6\"><div class=\"col-xs-6\">"+homeInput+"</div><div class=\"col-xs-6\">"+awayInput+"</div></div></form>";
	if(homeName == ""){	homeName = homeCode; }
	if(awayName == ""){	awayName = awayCode; }
	var fixtureDiv = "<div class=\"form-group row\"><div class=\"col-xs-3\">"+homeName+"</div>"+fixtureForm+"<div class=\"col-xs-3\">"+awayName+"</div></div>";
	return fixtureDiv;
}

function ResultsChange(target){
	var id = target.id;
	var value = $(target).val();
	//Get info from id
	var splitId = id.split("-");
	var matchNumber = splitId[0];
	var teamId = splitId[1];
	var groupId = teamId.charAt(0);
	//Get match in data structure to change the predicted score
	var match = groups[groupId]["Fixtures"][matchNumber];
	if(match["Home"] == teamId){
		match["HomeGoals"] = value;
	}
	else if(match["Away"] == teamId){
		match["AwayGoals"] = value;
	}
	else{
		alert("Something went wrong trying to update the score");
		console.log("Error updating score for id: "+id);
	}
	console.log(groups);
}















