<?php
// getCountryBorder.php

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

$filePath = '../data/countryBorders.geo.json';

header('Content-Type: application/json');

if (!isset($_GET['isoCode'])) {
    http_response_code(400);
    echo json_encode(['error' => 'isoCode is required']);
    exit;
}

$isoCode = $_GET['isoCode'];

if (!file_exists($filePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'GeoJSON file not found']);
    exit;
}

$geojson = file_get_contents($filePath);
$geojsonData = json_decode($geojson, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid GeoJSON format']);
    exit;
}

$filteredCountry = array_filter($geojsonData['features'], function($feature) use ($isoCode) {
    return strtoupper($feature['properties']['iso_a2']) === strtoupper($isoCode);
});

if (empty($filteredCountry)) {
    http_response_code(404);
    echo json_encode(['error' => 'Country not found']);
    exit;
}

$result = [
    'type' => 'FeatureCollection',
    'features' => array_values($filteredCountry)
];

echo json_encode($result);
?>
