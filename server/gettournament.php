<?php

session_start();

try{
	$filepath = "tournament.json";
	if(file_exists($filepath)){
		$file = fopen($filepath, "r") or die ("unablt to read file");
		$json = fread($file, filesize($filepath));
		fclose($file);
		echo $json;
	}
	else{
		echo "{\"Response\":\"Could not read tournament.json file\"}";
	}
}
catch(Exception $e){
	echo $e;
}