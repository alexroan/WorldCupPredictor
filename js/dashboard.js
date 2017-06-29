$(window).ready(function(){	
	alert(localStorage.Name);
});

var serverAddress = "http://worldcup.dev/server";

var user = null;
var groupPredictions = null;
var knockoutPredictions = null;
var realModel = null;

//Called when logged into facebook
function UserModelChanged(){

}	

function GetUserPredictions(){
	var path = serverAddress+"/userpredictions.php";
	console.log(path, JSON.stringify(user["Email"]));
	$.post(
		path,
		{Email: user["Email"]},
		function(result){
			groupPredictions = result["Groups"];
			knockoutPredictions = result["Knockouts"];
			console.log(groupPredictions, knockoutPredictions);
		}
	);	
}


function GetRealModel(){
	$.getJSON(serverAddress+"/realmodel.json", function(data){
		realModel = data;	
		console.log(realModel);
	});
	
}
