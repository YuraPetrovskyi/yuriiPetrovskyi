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

  // Base query selecting specific columns
  $query = 'SELECT p.id, p.firstName, p.lastName, p.email, d.name AS departmentName, l.name AS locationName 
            FROM personnel p
            LEFT JOIN department d ON d.id = p.departmentID
            LEFT JOIN location l ON l.id = d.locationID';

  // Dynamic conditions
  $conditions = [];
  $params = [];
  $types = '';

  // Check for location filter
  if (!empty($_POST['locationID'])) {
    $conditions[] = "l.id = ?";
    $params[] = $_POST['locationID'];
    $types .= 'i';
  }

  // Check for department filter
  if (!empty($_POST['departmentID'])) {
    $conditions[] = "d.id = ?";
    $params[] = $_POST['departmentID'];
    $types .= 'i';
  }

  // Apply conditions to the query
  if (count($conditions) > 0) {
    $query .= " WHERE " . implode(" AND ", $conditions);
  }

  // Ordering - default alphabetical order if no custom order is provided
  $query .= " ORDER BY p.lastName ASC, p.firstName ASC, d.name ASC, l.name ASC";

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
