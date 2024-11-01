<?php
  ini_set('display_errors', 'On');
  error_reporting(E_ALL);

  include("config.php");
  header('Content-Type: application/json; charset=UTF-8');

  $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

  if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
  }

  $id = $_POST['id'];
  $tableType = $_POST['tableType']; // table type: "location", "department" 
  $hasDependencies = false;

  if ($tableType === "location") {
    $query = "SELECT COUNT(*) as count FROM department WHERE locationID = ?";
  } elseif ($tableType === "department") {
    $query = "SELECT COUNT(*) as count FROM personnel WHERE departmentID = ?";
  } elseif ($tableType === "personnel") {
    // Personnel should be removed without additional checks
    $hasDependencies = false;
  }

  if (isset($query)) {
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    if ($row['count'] > 0) {
      $hasDependencies = true;
    }
    $stmt->close();
  }

  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['data']['hasDependencies'] = $hasDependencies;

  $conn->close();

  echo json_encode($output);
?>
