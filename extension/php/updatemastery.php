<?php
require 'connect.php';

if(isset($_POST['jsonString'])){
	$content = $_POST['jsonString'];
	$json = json_decode($content, false);	
	$id = $json->{'id'};
	$word = $json->{'word'};
	$language = $json->{'language'};

	$check_query = "Select * from words where userid=".$id." and word='".$word."' and language='".$language."'";
	$check_query_run = mysqli_query($link, $check_query);
	if($check_query_run){
		$check_query_num_rows = $check_query_run->num_rows;
		if($check_query_num_rows != 0){
			$row = mysqli_fetch_array($check_query_run);
			$mastery = $row['mastery'] + 10;
			date_default_timezone_set("America/Chicago");
			$lastmodified = date("Y-n-j H:i:s");
			$query = "Update words set mastery=".$mastery.", lastmodified='".$lastmodified."' where userid=".$id." and word='".$word."' and language='".$language."'";
			$query_run = mysqli_query($link, $query);
			echo $query;
			if($query_run){
				error_log("Updated mastery level");
			}else{
				error_log("Error updating mastery level");
				die('Invalid query: ' . mysql_error());		
			}
		}
	}	
}

?>