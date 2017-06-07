$(window).ready(function(){
	
	$.getJSON("tournament.json", function(data){
		console.log(data);
	});
	
});