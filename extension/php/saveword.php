<?php
require 'connect.php';

if(isset($_POST['jsonString'])){
	$content = $_POST['jsonString'];
	$json = json_decode($content, false);	
	$id = $json->{'id'};
	$text = $json->{'text'};
	$language = $json->{'language'};

	$check_query = "Select * from words where userid=".$id." and word='".$text."' and language='".$language."'";
	$check_query_run = mysqli_query($link, $check_query);
	if($check_query_run){
		$check_query_num_rows = $check_query_run->num_rows;
		if($check_query_num_rows == 0){
			date_default_timezone_set("America/Chicago");
			$lastmodified = date("Y-n-j H:i:s");
			$query = "Insert into words values ('',".$id.",'".$text."','".$language."',0,'".$lastmodified."')";
			$query_run = mysqli_query($link, $query);
			echo $query;
			if($query_run){
				error_log("Saved langauger word");
			}else{
				error_log("Error inserting save word");
				die('Invalid query: ' . mysql_error());		
			}
		}
	}	
}

?>