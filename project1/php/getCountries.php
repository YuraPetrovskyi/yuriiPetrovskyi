<?php
// getCountries.php

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

// download the JSON file
$jsonFile = file_get_contents(__DIR__ . '/../data/countryBorders.geo.json');
$countryData = json_decode($jsonFile, true);


$countries = [];
foreach ($countryData['features'] as $feature) {
    $name = $feature['properties']['name'];
    $isoCode = $feature['properties']['iso_a2'];
    $countries[] = ['name' => $name, 'iso' => $isoCode];
}

// sort the countries
usort($countries, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

// output the array in JSON format
header('Content-Type: application/json');
echo json_encode($countries);

// ?>
