<?php
// getCountryByCoordinates.php

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

    $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lon";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: MyCustomApp/1.0 (your-email@example.com)'
    ]);
    
    $response = curl_exec($ch);
    
    // We check whether an error occurred during the execution of the request
    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        $countryData = json_decode($response, true);
        if (isset($countryData['address'])) {
            $output = [
                'countryName' => $countryData['address']['country'],
                'countryISO' => strtoupper($countryData['address']['country_code']),
            ];
            echo json_encode($output);
        } else {
            echo json_encode(['error' => 'Invalid data from Weather API']);
        }
    }
    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid coordinates']);
}
?>