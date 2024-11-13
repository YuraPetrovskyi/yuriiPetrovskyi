<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/searchAll.php?txt=<txt>

	include("config.php");

  if ($environment === 'development') {
		ini_set('display_errors', 'On');
		error_reporting(E_ALL);
  } else {
		ini_set('display_errors', 'Off');
		error_reporting(0);
  }

	$executionStartTime = microtime(true);

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

  $likeText = "%" . $_POST['txt'] . "%";
	$departmentID = isset($_POST['departmentID']) ? $_POST['departmentID'] : 0;
	$locationID = isset($_POST['locationID']) ? $_POST['locationID'] : 0;
	
	// Base SQL query
	$sql = 'SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, 
					`d`.`id` as `departmentID`, `d`.`name` AS `departmentName`, 
					`l`.`id` as `locationID`, `l`.`name` AS `locationName`
					FROM `personnel` `p`
					LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`)
					LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`)
					WHERE (`p`.`firstName` LIKE ? OR `p`.`lastName` LIKE ? OR `p`.`email` LIKE ? OR `p`.`jobTitle` LIKE ? OR `d`.`name` LIKE ? OR `l`.`name` LIKE ?)';
	
	// Adding filter conditions
	$params = [$likeText, $likeText, $likeText, $likeText, $likeText, $likeText];
	
	if ($departmentID > 0) {
		$sql .= ' AND `d`.`id` = ?';
		$params[] = $departmentID;
	}

	if ($locationID > 0) {
		$sql .= ' AND `l`.`id` = ?';
		$params[] = $locationID;
	}

	// Ordering
	$sql .= ' ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`';

	$query = $conn->prepare($sql);
	if ($departmentID > 0 && $locationID > 0) {
		$query->bind_param("ssssssii", ...$params);
	} elseif ($departmentID > 0 || $locationID > 0) {
		$query->bind_param("ssssssi", ...$params);
	} else {
		$query->bind_param("ssssss", ...$params);
	}

	$query->execute();
	
	if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
    
	$result = $query->get_result();

  $found = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($found, $row);

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data']['found'] = $found;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>