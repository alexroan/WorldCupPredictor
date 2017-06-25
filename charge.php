<?php

  require_once('./chargeconfig.php');
  session_start();
  

  try{
    $token  = $_POST['stripeToken'];
    $email = $_POST['stripeEmail'];

    //print_r($_POST);

    $customer = \Stripe\Customer::create(array(
        'email' => $email,
        'card'  => $token
    ));

    $charge = \Stripe\Charge::create(array(
        'customer' => $customer->id,
        'amount'   => 500,
        'currency' => 'gbp'
    ));

    echo 1; 
  }
  catch (Exception $e){
    echo $e;
    echo 0;
  }

