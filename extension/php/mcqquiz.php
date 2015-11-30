<?php

require 'connect.php';

if(isset($_GET['jsonString'])){
	$content = $_GET['jsonString'];
	$json = json_decode($content, false);	
	$id = $json->{'id'};
	$language = $json->{'language'};

	$query = "SELECT * FROM words where userid=".$id." and language='".$language."' ORDER BY RAND() LIMIT 1";
	$query_run = mysqli_query($link, $query);
	$return_array = [];
	if($query_run){
		$query_num_rows = $query_run->num_rows;
		if($query_num_rows != 0){
			$row = mysqli_fetch_array($query_run);											
			$options_query = "SELECT * FROM words where word<>'".$row["word"]."' ORDER BY RAND() LIMIT 3";
			$options_query_run = mysqli_query($link, $options_query);
			$options_array = [];	
			if($options_query_run) {
				while($option_row = mysqli_fetch_array($options_query_run)){
					array_push($options_array, $option_row);	
				}
			}
			array_push($return_array, $row);
			array_push($return_array, $options_array);
			$returnJSON = json_encode($return_array);
			echo $returnJSON;	
		}
	}
}

?>