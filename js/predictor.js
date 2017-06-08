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
		mainContent.append(groupRow);
	}
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

//Update model with result changes
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

//Called when the groups model has changed
function ModelChanged(){

}















