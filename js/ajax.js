var serverAddress = "http://worldcup.local/server";
$(document).ready(function(){
	$(".navbar").load("../header.html");
});

function GetAllUsersScores(){
	var path = serverAddress+"/allusersscores.php";
	$.get(
		path,
		function(data){
			var jsonData = JSON.parse(data);
			HandleResults(jsonData);
		}
	);
}