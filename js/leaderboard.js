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
	for (var i = 0; i < jsonData.length; i++) {
		var userData = jsonData[i];
		var row = ConstructRow(userData["user"], userData["score"]);
		$("#leader-table-body").append(row);
	}	
}

function ConstructRow(user, points){
	var row = "<tr>";
	row += "<td>"+user+"</td>";
	row += "<td>"+points+"</td>";
	row += "</tr>";
	return row;
}