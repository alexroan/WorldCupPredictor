<?php

session_start();

try{
	$email = filter_var($_POST['Email'], FILTER_SANITIZE_EMAIL);
	$filepath = "predictions/points/".$email.".json";
	if(file_exists($filepath)){
		$file = fopen($filepath, "r") or die("unable to read file");
		$json = fread($file, filesize($filepath));
		fclose($file);
		echo $json;
	}
	else{
		echo "{\"Response\":\"User not found or points not calculated for that user\"}";
	}
}
catch(Exception $e){
	echo $e;
}