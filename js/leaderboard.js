$(window).ready(function(){
	GetAllUsersScores();
});

function HandleResults(jsonData){
	var counter = 1;
	for (var i = 0; i < jsonData.length; i++) {
		var userData = jsonData[i];
		var row = ConstructRow(counter, userData["name"].replace(".json",""), userData["score"]);
		$("#leader-table-body").append(row);
		counter++;
	}	
}

function ConstructRow(position, user, points){
	var row = "<tr>";
	row += "<td>"+position+"</td>";
	row += "<td>"+user+"</td>";
	row += "<td>"+points+"</td>";
	row += "</tr>";
	return row;
}