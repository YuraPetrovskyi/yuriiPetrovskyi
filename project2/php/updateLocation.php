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
        $output['data'] = [];
        echo json_encode($output);
        mysqli_close($conn);
        exit;
    }

    // Preparing a request to update location data
    $query = $conn->prepare('UPDATE location SET name = ? WHERE id = ?');
    $query->bind_param("si", $_POST['name'], $_POST['id']);
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

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "Location updated successfully";

    echo json_encode($output);
    mysqli_close($conn);

?>
