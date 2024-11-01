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

  $query = 'SELECT p.id, p.firstName, p.lastName, p.email, d.name as departmentName, l.name as locationName 
            FROM personnel p
            LEFT JOIN department d ON d.id = p.departmentID
            LEFT JOIN location l ON l.id = d.locationID';

  // Dynamic conditions
  $conditions = [];
  $params = [];
  $types = '';

  // Check filtering by location
  if (!empty($_POST['locations'])) {
    $locations = $_POST['locations'];
    $placeholders = implode(',', array_fill(0, count($locations), '?'));
    $conditions[] = "l.id IN ($placeholders)";
    $params = array_merge($params, $locations);
    $types .= str_repeat('i', count($locations));
  }

  // Check filtering by department
  if (!empty($_POST['departments'])) {
    $departments = $_POST['departments'];
    $placeholders = implode(',', array_fill(0, count($departments), '?'));
    $conditions[] = "d.id IN ($placeholders)";
    $params = array_merge($params, $departments);
    $types .= str_repeat('i', count($departments));
  }

  // Adding filter conditions to the main query
  if (!empty($conditions)) {
    $query .= ' WHERE ' . implode(' AND ', $conditions);
  }

  // Sort by name
  if (!empty($_POST['order']) && in_array($_POST['order'], ['asc', 'desc'])) {
    $query .= ' ORDER BY p.firstName ' . strtoupper($_POST['order']) . ', p.lastName ' . strtoupper($_POST['order']);
  }

  // Preparation and execution of the request
  $stmt = $conn->prepare($query);
  if ($types) {
    $stmt->bind_param($types, ...$params);
  }
  $stmt->execute();
  $result = $stmt->get_result();

  // Collection of results
  $data = [];
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }

  // Output of the result
  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  $output['data'] = $data;

  $stmt->close();
  $conn->close();

  echo json_encode($output);

?>
