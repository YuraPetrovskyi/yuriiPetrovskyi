<?php
// getAirports.php

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

$north = $_GET['north'] ?? '';
$south = $_GET['south'] ?? '';
$east = $_GET['east'] ?? '';
$west = $_GET['west'] ?? '';
$countryCode = $_GET['isoCode'] ?? '';

$username = $_ENV['USERNAME_GEONAMES_API_KEY'];

$url = "http://api.geonames.org/searchJSON?north=$north&south=$south&east=$east&west=$west&featureClass=S&featureCode=AIRP&country=$countryCode&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$airports = json_decode($result, true)['geonames'] ?? [];

$output = [];
foreach ($airports as $airport) {
    if (isset($airport['name'], $airport['countryName'], $airport['adminName1'], $airport['lat'], $airport['lng'])) {
        $output[] = [
            'name' => $airport['name'],
            'countryName' => $airport['countryName'],
            'adminName1' => $airport['adminName1'],
            'lat' => $airport['lat'],
            'lng' => $airport['lng']
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($output);
?>