$(window).ready(function(){	
	
	if(localStorage.getItem("Name") != null 
		&& localStorage.getItem("Email") != null
		&& localStorage.getItem("FacebookId") != null){

		SetUser();
	}

});

var serverAddress = "http://worldcup.dev/server";

var user = null;
var groupPredictions = null;
var knockoutPredictions = null;
var realModel = null;


//Sets user details from localStorage
function SetUser(){
	user = {};
	user["Name"] = localStorage.getItem("Name");
	user["Email"] = localStorage.getItem("Email");
	user["FacebookId"] = localStorage.getItem("FacebookId");
	
	GetUserPredictions();
	GetRealModel();

}

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
			jsonResult = JSON.parse(result);
			groupPredictions = jsonResult["Groups"];
			knockoutPredictions = jsonResult["Knockouts"];
		}
	);	
}


function GetRealModel(){
	var path = serverAddress+"/realmodel.json";
	console.log(path);
	$.ajax({
		url: path,
		data: null,
		dataType: "json",
		success: function(data){
			console.log(data);
		}
	});
	
}
