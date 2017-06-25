var handler = StripeCheckout.configure({
	key: 'pk_test_6AxSKzSDDN65kzqIiP9FPbMb',
	image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
	locale: 'auto',
	currency: 'gbp',
	token: function(token) {
		alert('charging card, please do not navigate away from page');
		$.post("charge.php",
		{
			stripeEmail: token.email,
			stripeToken: token.id
		},
		function(response){
			console.log(response);
			if(response == 1){
				alert("Charged :) This is where the models get saved");
			}
			else{
				alert('We could not charge you at this time :(');
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
			amount: 500,
			email: userEmail
		});
		event.preventDefault();
	});
});