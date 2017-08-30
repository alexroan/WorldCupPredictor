$(window).ready(function(){

	GetAllUsersScores();

});



function GetAllUsersScores(){
	var path = serverAddress+"/allusersscores.php";
	$.get(
		path,
		function(data){
			var jsonData = JSON.parse(data);
			PrintLeaderboard(jsonData);
		}
	);
}

function PrintLeaderboard(jsonData){
	var counter = 1;
	for (var i = 0; i < jsonData.length; i++) {
		var userData = jsonData[i];
		var row = ConstructRow(counter, userData["user"].replace(".json",""), userData["score"]);
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