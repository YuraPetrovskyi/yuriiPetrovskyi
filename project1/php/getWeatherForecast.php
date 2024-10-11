<?php
// getWeatherForecast.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/../vendor/autoload.php';

try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
    error_log('Failed to load .env file: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load .env file']);
    exit;
}

header('Content-Type: application/json');

if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    $apiKey = $_ENV['OPENWEATHER_API_KEY'];

    $url = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lon&appid=$apiKey&units=metric";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        echo $response;
    }

    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid request']);
}
?>
