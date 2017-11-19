<?php

$directory = "predictions/points/";
$files = glob($directory."*.json");

$data = array();

for ($i=0; $i < count($files); $i++) { 
	$thisfile = $files[$i];
	$json_string = file_get_contents($thisfile);

	$decoded_json = json_decode($json_string);
	$score = $decoded_json->TotalPoints;

	$filedata["user"] = str_replace($directory, "", $thisfile);
	$filedata["score"] = $score;

	array_push($data, $filedata);
}

echo json_encode($data);