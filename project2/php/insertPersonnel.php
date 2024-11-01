<?php

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

	// Request to add a new employee
	$query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES (?, ?, ?, ?, ?)');

	$query->bind_param("ssssi", $_POST['firstName'], $_POST['lastName'], $_POST['jobTitle'], $_POST['email'], $_POST['departmentID']);

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

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	
	mysqli_close($conn);

	echo json_encode($output); 

?>
