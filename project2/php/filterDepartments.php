<?php
  // Enable error display for development
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

  $query = 'SELECT d.id, d.name AS departmentName, l.name AS locationName
            FROM department d
            LEFT JOIN location l ON d.locationID = l.id';

  // Dynamic conditions
  $conditions = [];
  $params = [];
  $types = '';

  // Add conditions for filtering by location
  if (!empty($_POST['locations'])) {
    $locationIDs = implode(',', array_fill(0, count($_POST['locations']), '?'));
    $conditions[] = "l.id IN ($locationIDs)";
    $params = array_merge($params, $_POST['locations']);
    $types .= str_repeat('i', count($_POST['locations']));
  }

  // Add conditions to the request
  if (!empty($conditions)) {
    $query .= ' WHERE ' . implode(' AND ', $conditions);
  }

  $stmt = $conn->prepare($query);

  if ($types) {
    $stmt->bind_param($types, ...$params);
  }

  $stmt->execute();
  
  $result = $stmt->get_result();

  $data = [];

  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }

  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  $output['data'] = $data;

  mysqli_close($conn);

  echo json_encode($output);

?>
