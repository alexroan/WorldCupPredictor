<?php

session_start();

try{
	$filepath = "realmodel.json";
	if(file_exists($filepath)){
		$file = fopen($filepath, "r") or die("unable to read file");
		$json = fread($file, filesize($filepath));
		fclose($file);
		echo $json;
	}
	else{
		echo"{\"Response\":\"Real Model not found\"}";
	}
}
catch(Exception $e){
	echo $e;
}