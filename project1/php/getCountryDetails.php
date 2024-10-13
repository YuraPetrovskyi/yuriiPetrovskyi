<?php
// getCountryDetails.php

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


$isoCode = isset($_GET['isoCode']) ? urlencode($_GET['isoCode']) : '';

if (!$isoCode) {
    http_response_code(400);
    echo json_encode(['error' => 'Country name is missing']);
    exit;
}

$url = "https://restcountries.com/v3.1/alpha/{$isoCode}";


// execute a request to the API
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: Gazetter/1.0 (yurakarpaty@gmail.com)'
]);

$response = curl_exec($ch);

curl_close($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Error fetching country data']);
    exit;
}

// Decode the API response
$data = json_decode($response, true);

// Filter only the necessary data
$country = $data[0];
$filteredData = [
    'name' => $country['name']['common'] ?? '',
    'officialName' => $country['name']['official'] ?? '',
    'capital' => $country['capital'][0] ?? '',
    'population' => $country['population'] ?? 0,
    'currency' => [
        'name' => $country['currencies'][array_key_first($country['currencies'])]['name'] ?? '',
        'symbol' => $country['currencies'][array_key_first($country['currencies'])]['symbol'] ?? '',
        'currencyCode' => array_key_first($country['currencies']) ?? '',
    ],
    'flag' => $country['flags']['svg'] ?? '',
    'flagAlt' => $country['flags']['alt'] ?? '',
    'coatOfArms' => $country['coatOfArms']['svg'] ?? '',
    'region' => $country['region'] ?? '',
    'languages' => implode(', ', $country['languages'] ?? []),
    'area' => $country['area'] ?? 0,
    'timezones' => implode(', ', $country['timezones'] ?? [])
];

// Return the filtered data as JSON
header('Content-Type: application/json');
echo json_encode($filteredData);

// echo $response;

