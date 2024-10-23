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

    $geonamesUsername = $_ENV['USERNAME_GEONAMES_API_KEY'];

    // GeoNames CountryCodeJSON API URL
    $url = "http://api.geonames.org/countryCodeJSON?lat=$lat&lng=$lon&username=$geonamesUsername";


    // $userEmail = $_ENV['USER_EMAIL'];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    
    
    $response = curl_exec($ch);
    
    // We check whether an error occurred during the execution of the request
    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        $countryData = json_decode($response, true);
        if (isset($countryData['countryCode'])) {
            $output = [
                'countryISO' => strtoupper($countryData['countryCode']),
                'countryName' => $countryData['countryName']
            ];
            echo json_encode($output);
        } else {
            echo json_encode(['error' => 'Invalid data from GeoNames API']);
        }
    }
    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid coordinates']);
}
?>