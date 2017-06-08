$(window).ready(function(){
		
	$.getJSON("tournament.json", function(data){
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
	});

	$('#submit-button').click(function(event){
		var i = 1;
		while(true){

			i++;
		}
	});

	//This works for getting events from dynamic elements.
	/*
	$("body").on('click', 'p#33', function(){
		console.log(this);
	});
	*/

	//This also works for finding dynamic elements.
	/*
	$('body').click(function(event){
		console.log($('body').find("p#33")[0]);
	});
	*/
	
});




//Construct the html for a fixture
function ConstructFixture(fixture, homeCode, awayCode, homeName, awayName){
	var homeInput = "<input name=\""+fixture+"-"+homeCode+"\" type=\"number\" min=\"0\" class=\"form-control input-sm\" required>";
	var awayInput = "<input name=\""+fixture+"-"+awayCode+"\" type=\"number\" min=\"0\" class=\"form-control input-sm\" required>";
	var fixtureForm = "<form class=\"form-horizontal fixture\"><div class=\"col-xs-6\"><div class=\"col-xs-6\">"+homeInput+"</div><div class=\"col-xs-6\">"+awayInput+"</div></div></form>";
	if(homeName == ""){	homeName = homeCode; }
	if(awayName == ""){	awayName = awayCode; }
	var fixtureDiv = "<div class=\"form-group row\"><div class=\"col-xs-3\">"+homeName+"</div>"+fixtureForm+"<div class=\"col-xs-3\">"+awayName+"</div></div>";
	return fixtureDiv;
}















