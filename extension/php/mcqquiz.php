<?php

require 'connect.php';

if(isset($_GET['jsonString'])){
	$content = $_GET['jsonString'];
	$json = json_decode($content, false);	
	$id = $json->{'id'};

	$query = "SELECT * FROM words where userid=".$id." ORDER BY RAND() LIMIT 1";
	$query_run = mysqli_query($link, $query);
	if($query_run){
		$query_num_rows = $query_run->num_rows;
		if($query_num_rows != 0){
			$row = mysqli_fetch_array($query_run);											
			$returnJSON = json_encode($row);
			echo $returnJSON;	
		}
	}
}

?>