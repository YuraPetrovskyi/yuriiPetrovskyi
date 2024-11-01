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

  // Get locations
  $locationQuery = 'SELECT id, name FROM location ORDER BY name';
  $locationResult = $conn->query($locationQuery);
  
  $locations = [];
  while ($row = mysqli_fetch_assoc($locationResult)) {
    $locations[] = $row;
  }

  // Get departments
  $departmentQuery = 'SELECT id, name FROM department ORDER BY name';
  $departmentResult = $conn->query($departmentQuery);
  
  $departments = [];
  while ($row = mysqli_fetch_assoc($departmentResult)) {
    $departments[] = $row;
  }

  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  $output['data'] = [
    'locations' => $locations,
    'departments' => $departments
  ];

  mysqli_close($conn);
  echo json_encode($output);

?>
