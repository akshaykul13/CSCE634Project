<?php

require 'connect.php';

if(isset($_GET['jsonString'])){
	$content = $_GET['jsonString'];
	$json = json_decode($content, false);	
	$id = $json->{'id'};
	
	$query = "SELECT * FROM words where userid=".$id." ORDER BY lastmodified DESC";
	$query_run = mysqli_query($link, $query);
	$return_array = [];
	if($query_run){
		$query_num_rows = $query_run->num_rows;
		if($query_num_rows != 0){
			while($row = mysqli_fetch_array($query_run)) {
				array_push($return_array, $row);
			}																
			$returnJSON = json_encode($return_array);
			echo $returnJSON;	
		}
	}
}

?>