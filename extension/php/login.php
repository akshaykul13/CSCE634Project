<?php

require 'connect.php';

if(isset($_GET['jsonString'])){
	$content = $_GET['jsonString'];
	$json = json_decode($content, false);	
	$email = $json->{'email'};
	$password = $json->{'password'};	
	error_log("INFO: Login request from: ".$username);
	
	if(!empty($email) && !empty($password)){
		$query = "SELECT id, firstname, lastname FROM users WHERE email = '".$email."' and password = '".$password."'";
		$query_run = mysqli_query($link, $query);		
		if($query_run){
			$query_num_rows = $query_run->num_rows;
			if($query_num_rows == 0){
				header("Content-type: application/json");
				$returnArray = [];				
				$errorObject = new stdClass();
				$errorObject->status = 'Error';
				$errorObject->reason = 'Invalid username/password';				
				array_push($returnArray, $errorObject);				
				$returnJSON = json_encode($errorObject);			
				echo $returnJSON;		
			}else{
				// Create empty array to hold query results
				$returnArray = [];								
				while($row = mysqli_fetch_array($query_run)){			
					$row['status'] = "Success";
					error_log("INFO: Successful login for ".$username." with role: ".$role);
					// Loop through query and push results into $returnArray;				
					array_push($returnArray, $row);
				}												
				// Convert the Array to a JSON String and echo it
				$returnJSON = json_encode($returnArray);
				echo $returnJSON;				
			}			
		}else{
			echo "Error finding user<br/>";			
			die('Invalid query: ' . mysql_error());		
		}				
	}else{
		echo "Please enter fields";
	}	
}
?>