var handler = StripeCheckout.configure({
	key: 'pk_test_6AxSKzSDDN65kzqIiP9FPbMb',
	image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
	locale: 'auto',
	currency: 'gbp',
	token: function(token) {
		alert('charging card, please do not navigate away from page');
		var model = {};
		model["User"] = user;
		model["Groups"] = groups;
		model["Knockouts"] = knockouts;
		$.post("server/charge.php",
		{
			stripeEmail: token.email,
			stripeToken: token.id,
			predictionModel: model
		},
		function(response){
			if (response == 1){
				alert("Yay");
			}
			else{
				alert("Didn't work");
			}
		});
	}
});

$(window).load(function(){
	//Post job submitted
	$('#post-submit-predictions-button').click(function(event){
    	var userEmail = $("#facebook-email-input").val();
		handler.open({
			name: 'World Cup Predictor',
			description: 'Submit your predictions!',
			zipCode: true,
			amount: 1000,
			email: userEmail
		});
		event.preventDefault();
	});
});