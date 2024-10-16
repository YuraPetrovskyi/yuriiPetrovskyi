<?php
// getWeatherForecast.php

// Connect autoload Composer to load libraries
require __DIR__ . '/../vendor/autoload.php';

// Loading environment variables from .env
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
  // Log an error if there is no .env file
    error_log('Failed to load .env file: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to load .env file']);
    exit;
}

// Check the environment and configure error display
$environment = $_ENV['ENVIRONMENT'];

if ($environment === 'development') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);  // No error reporting in production
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
        $data = json_decode($response, true);
        
        // Filter and format data to return only necessary information
        $filteredData = [];
        if (isset($data['list'])) {
            foreach ($data['list'] as $item) {
                $filteredData[] = [
                    'dt_txt' => $item['dt_txt'], // Time of forecast
                    'main' => [
                        'temp' => $item['main']['temp'], // Temperature
                        'temp_min' => $item['main']['temp_min'], // Min temperature
                        'temp_max' => $item['main']['temp_max'], // Max temperature
                    ],
                    'weather' => [
                        'icon' => $item['weather'][0]['icon'] // Weather icon
                    ]
                ];
            }
        }

        echo json_encode(['list' => $filteredData]);
    }

    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid request']);
}
?>
