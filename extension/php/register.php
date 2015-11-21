<?php
require 'connect.php';

if(isset($_POST['jsonString'])){
	$content = $_POST['jsonString'];
	$json = json_decode($content, false);	
	$firstName = $json->{'firstName'};
	$lastName = $json->{'lastName'};
	$email = $json->{'email'};
	$password = $json->{'password'};
	
	$check_username_query = "SELECT id FROM users WHERE email = '".$email."'";	
	$check_username_query_run = mysqli_query($link, $check_username_query);
	error_log($check_username_query);
	if($check_username_query_run){
		$query_num_rows = $check_username_query_run->num_rows;
		error_log($query_num_rows);
		if($query_num_rows != 0){
			header("Content-type: application/json");
			$returnArray = [];				
			$errorObject = new stdClass();
			$errorObject->status = 'Error';
			$errorObject->reason = 'Username already exists.';				
			array_push($returnArray, $errorObject);				
			$returnJSON = json_encode($errorObject);
			error_log($returnJSON);
			echo $returnJSON;		
		}else{
			$query = "Insert into users values ('','".$firstName."','".$lastName."','".$email."','".$password."')";
			$query_run = mysqli_query($link, $query);
			echo $query;
			if($query_run){
				error_log("Registered user");
			}else{
				error_log("Error inserting user");
				die('Invalid query: ' . mysql_error());		
			}
		}
	}	
}
?>