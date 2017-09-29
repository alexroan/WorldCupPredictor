var serverAddress = "http://worldcup.dev/server";

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