<?php

  require_once('./chargeconfig.php');
  session_start();
  

  try{
    $token  = $_POST['stripeToken'];
    $email = $_POST['stripeEmail'];
    $model = $_POST['predictionModel'];

    $customer = \Stripe\Customer::create(array(
        'email' => $email,
        'card'  => $token
    ));

    $charge = \Stripe\Charge::create(array(
        'customer' => $customer->id,
        'amount'   => 1000,
        'currency' => 'gbp'
    ));

    if($charge->status == "succeeded"){
      file_put_contents("predictions/".$email.".json", $model);
      echo 1;
    }
    else{
      echo 0;
    }
  }
  catch (Exception $e){
    echo $e;
  }

