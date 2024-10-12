<?php
// getCity.php

// Enable error display for diagnostics
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Connect autoload Composer to load libraries
require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');

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

$username = $_ENV['USERNAME_GEONAMES_API_KEY'];
$isoCode = isset($_GET['isoCode']) ? $_GET['isoCode'] : '';

if (empty($isoCode)) {
    echo json_encode(['error' => 'Country ISO code is missing']);
    exit;
}

$url = "http://api.geonames.org/searchJSON?country={$isoCode}&cities=cities15000&maxRows=200&featureCode=PPLC&featureCode=PPLA&featureCode=PPLA2&orderby=population&username={$username}";

// Initialize curl for the request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Execution of the request
$response = curl_exec($ch);

if ($response === false) {
    echo json_encode(['error' => 'Failed to fetch cities']);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

// Division into categories PPLC (capital cities), PPLA (city administration) and PPLA2 (simple cities)
$pplcCities = [];
$pplaCities = [];
$ppla2Cities = [];

foreach ($data['geonames'] as $city) {
    if (isset($city['name'], $city['lat'], $city['lng'], $city['population'], $city['fcode'])) {
        $cityData = [
            'name' => $city['name'],
            'lat' => $city['lat'],
            'lng' => $city['lng'],
            'population' => $city['population'],
            'fcode' => $city['fcode']
        ];

        switch ($city['fcode']) {
            case 'PPLC':
                $pplcCities[] = $cityData;
                break;
            case 'PPLA':
                $pplaCities[] = $cityData;
                break;
            case 'PPLA2':
                $ppla2Cities[] = $cityData;
                break;
        }
    }
}

echo json_encode([
    'pplc' => $pplcCities,
    'ppla' => $pplaCities,
    'ppla2' => $ppla2Cities
]);
?>
