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

$query = $conn->prepare('SELECT d.name AS departmentName, COUNT(p.id) AS personnelCount
                        FROM department d
                        LEFT JOIN personnel p ON p.departmentID = d.id
                        WHERE d.id = ?');

// Checking the ID parameter and binding to the request
$query->bind_param("i", $_POST['id']);

// Execution of the request
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

// Getting the query result
$result = $query->get_result();

// Get all query results from the database and store them in the $data array
$data = $result->fetch_all(MYSQLI_ASSOC);

// Formation of the answer
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $data;

// Closing the connection
mysqli_close($conn);

// Return a JSON response
echo json_encode($output);

?>
