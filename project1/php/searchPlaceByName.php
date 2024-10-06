<?php
// searchPlaceByName.php

// Enable error display for diagnostics
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Connect autoload Composer to load libraries
require __DIR__ . '/../vendor/autoload.php';

error_log('Failed to load .env file');
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

$cityName = $_GET['cityName'] ?? '';
$username = $_ENV['USERNAME'];

if (empty($cityName)) {
    echo json_encode([]);
    exit;
}

$url = "http://api.geonames.org/searchJSON?q=" . urlencode($cityName) . "&maxRows=10&username=" . $username;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$response = curl_exec($ch);
curl_close($ch);

$cities = json_decode($response, true)['geonames'] ?? [];

$result = [];
foreach ($cities as $city) {
    if (isset($city['name'], $city['countryName'], $city['countryCode'], $city['lat'], $city['lng'])) {
        $result[] = [
            'name' => $city['name'], 
            'countryName' => $city['countryName'],
            'countryCode' => $city['countryCode'],
            'lat' => $city['lat'],
            'lng' => $city['lng']
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($result);
// echo json_encode($cities);

?>