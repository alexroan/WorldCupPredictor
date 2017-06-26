<?php

require_once('../vendor/autoload.php');

$secret = getenv('STRIPE_SECRET');

$stripe = array(
  'secret_key'      => $secret,
  'publishable_key' => 'pk_test_6AxSKzSDDN65kzqIiP9FPbMb'
);

\Stripe\Stripe::setApiKey($stripe['secret_key']);