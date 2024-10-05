<?php
// getHistoricalPlaces.php

// Enable error display for diagnostics
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Connect autoload Composer to load libraries
require __DIR__ . '/../vendor/autoload.php';

error_log('Не вдалося завантажити .env файл');
// Loading environment variables from .env
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
  // Log an error if there is no .env file
    error_log('Не вдалося завантажити .env файл: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Не вдалося завантажити .env файл']);
    exit;
}

$lat = $_GET['lat'] ?? '';
$lng = $_GET['lng'] ?? '';
$radius = 20;

$username = 'yuriipetrovskyi';
$username = $_ENV['USERNAME'];

$url = "https://secure.geonames.org/findNearbyWikipediaJSON?lat=$lat&lng=$lng&radius=$radius&maxRows=100&username=yuriipetrovskyi";
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$cities = json_decode($result, true);

header('Content-Type: application/json');
// echo json_encode($output);
echo json_encode($cities);

