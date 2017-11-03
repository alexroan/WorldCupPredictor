$(window).ready(function(){

    //Facebook login button clicked
    $("#facebook-login-btn").click(function(){
        FacebookLogin();
    });
});

//Login to facebook and store email, name and facebook id
function FacebookLogin() {
    FB.login(function(response) {
        var userId = response.authResponse.userID;
        FB.api(
        	"/"+userId,
        	function (response){
        		user = {};
        		user["Email"] = response.email;
        		user["Name"] = response.name;
        		user["FacebookId"] = response.id;
        		UserModelChanged();
        	},
        	{fields: 'email,name'}
        );        
    }, {scope: 'public_profile,email'});            
}


//Logout of facebook
function FacebookLogout() {
    FB.logout(function(response) {
        //console.log(response);
    });
}