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
				var home = fixtures[fixture]["Home"];
				if (home in map){
					home = map[home];
				}
				var away = fixtures[fixture]["Away"];
				if (away in map){
					away = map[away];
				}
				mainContent.append("<p><strong>Match "+fixture+":</strong> "+home+" v "+away+"</p>")
			}
		}
	});
	
});