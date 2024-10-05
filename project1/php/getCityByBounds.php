<?php
// getCityByBounds.php

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

// API GeoNames
$north = $_GET['north'] ?? '';
$south = $_GET['south'] ?? '';
$east = $_GET['east'] ?? '';
$west = $_GET['west'] ?? '';
$fcode = $_GET['fcode'] ?? ''; 

$username = $_ENV['USERNAME'];

$url = "http://api.geonames.org/citiesJSON?north=$north&south=$south&east=$east&west=$west&maxRows=100&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

// $cities = json_decode($result, true);
$cities = json_decode($result, true)['geonames'] ?? [];

// Якщо є параметр fcode, фільтруємо міста
if (!empty($fcode)) {
    $cities = array_filter($cities, function($city) use ($fcode) {
        return isset($city['fcode']) && $city['fcode'] !== $fcode;
    });
}

// Формуємо вихідний масив з потрібними даними тільки якщо всі властивості існують
$output = [];
foreach ($cities as $city) {
    if (isset($city['name'], $city['lat'], $city['lng'], $city['population'])) {
        $output[] = [
            'name' => $city['name'],
            'lat' => $city['lat'],
            'lng' => $city['lng'],
            'population' => $city['population']
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($output);

// echo json_encode($cities);

