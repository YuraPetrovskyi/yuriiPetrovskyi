<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/getDepartmentByID.php?id=<id>

	// remove next two lines for production	

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	include("config.php");

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

	// SQL statement accepts parameters and so is prepared to avoid SQL injection.
	// $_REQUEST used for development / debugging. Remember to change to $_POST for production

	// $query = $conn->prepare('SELECT id, name, locationID FROM department WHERE id =  ?');
	$query = $conn->prepare('SELECT d.id, d.name as departmentName, d.locationID, l.name as locationName 
		FROM department d 
		LEFT JOIN location l ON d.locationID = l.id 
		WHERE d.id = ?'
	);

	$query->bind_param("i", $_POST['id']);

	$query->execute();
	
	if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		echo json_encode($output); 
	
		mysqli_close($conn);
		exit;

	}

	$departmentResult = $query->get_result();
	$departmentData = [];

	while ($row = mysqli_fetch_assoc($departmentResult)) {
		array_push($departmentData, $row);
	}

	// Second query: Get all locations for options in the dropdown
	$locationsQuery = 'SELECT id, name FROM location ORDER BY name';
	$locationsResult = $conn->query($locationsQuery);

	if (!$locationsResult) {
		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";
		$output['data'] = [];
		mysqli_close($conn);
		echo json_encode($output);
		exit;
	}

	$locationsData = [];

	while ($row = mysqli_fetch_assoc($locationsResult)) {
		array_push($locationsData, $row);
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data']['department'] = $departmentData;
	$output['data']['locations'] = $locationsData;

	echo json_encode($output);

	mysqli_close($conn);

?>