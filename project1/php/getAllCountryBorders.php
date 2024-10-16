<?php
// getAllCountryBorders.php

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

header('Content-Type: application/json'); // set the header for the JSON response

$geojsonFilePath = '../data/countries.geojson';

if (file_exists($geojsonFilePath)) {
    $geojsonData = file_get_contents($geojsonFilePath); // read the contents of the file
    echo $geojsonData;
} else {
    echo json_encode(['error' => 'GeoJSON file not found']);
}
?>
