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

  $query = $conn->prepare('INSERT INTO location (name) VALUES (?)');
  
  $query->bind_param("s", $_POST['name']);
  
  $query->execute();

  if ($query->affected_rows > 0) { //checks whether the query was successful by checking the number of changed rows.
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
  } else {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";
  }

  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  $output['data'] = [];

  $query->close();
  $conn->close();

  echo json_encode($output);
?>
