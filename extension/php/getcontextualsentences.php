<?php

require 'connect.php';

if(isset($_GET['jsonString'])){
	$content = $_GET['jsonString'];
	$json = json_decode($content, false);	
	$word = $json->{'word'};
	$language = $json->{'language'};
	
	$query = "SELECT * FROM sentence where lang_id='".$language."' and text RLIKE '[[:<:]]".$word."[[:>:]]' ORDER BY RAND() LIMIT 3";
	$query_run = mysqli_query($link, $query);
	$return_array = [];
	if($query_run){
		$query_num_rows = $query_run->num_rows;
		if($query_num_rows != 0){
			while($row = mysqli_fetch_array($query_run)) {
				array_push($return_array, $row['text']);
			}																
			$returnJSON = json_encode(utf8ize($return_array));
			echo $returnJSON;	
		}
	}
}

function utf8ize($d) {
    if (is_array($d)) {
        foreach ($d as $k => $v) {
            $d[$k] = utf8ize($v);
        }
    } else if (is_string ($d)) {
        return utf8_encode($d);
    }
    return $d;
}

?>