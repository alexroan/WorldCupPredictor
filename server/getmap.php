<?php

session_start();

try{
	$filepath = "map.json";
	if(file_exists($filepath)){
		$file = fopen($filepath, "r") or die ("unablt to read file");
		$json = fread($file, filesize($filepath));
		fclose($file);
		echo $json;
	}
	else{
		echo "{\"Response\":\"Could not read map.json file\"}";
	}
}
catch(Exception $e){
	echo $e;
}