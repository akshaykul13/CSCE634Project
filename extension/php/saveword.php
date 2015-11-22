<?php
require 'connect.php';

if(isset($_POST['jsonString'])){
	$content = $_POST['jsonString'];
	$json = json_decode($content, false);	
	$id = $json->{'id'};
	$text = $json->{'text'};

	echo $id;
	echo $text;
	echo "Saving Word";
}

?>