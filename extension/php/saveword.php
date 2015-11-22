<?php
require 'connect.php';

if(isset($_POST['jsonString'])){
	$content = $_POST['jsonString'];
	$json = json_decode($content, false);	
	$id = $json->{'id'};
	$text = $json->{'text'};
	$language = $json->{'language'};

	$query = "Insert into words values ('',".$id.",'".$text."','".$language."')";
	$query_run = mysqli_query($link, $query);
	echo $query;
	if($query_run){
		error_log("Saved langauger word");
	}else{
		error_log("Error inserting save word");
		die('Invalid query: ' . mysql_error());		
	}
}

?>