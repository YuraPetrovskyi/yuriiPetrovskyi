<?php
// getWikiData.php

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

if (!isset($_GET['countryName'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Country name is required']);
    exit;
}

$countryName = $_GET['countryName'];

$wikiApiUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/" . urlencode($countryName);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $wikiApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Returns the result as a string instead of direct output
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // We turn off the check of SSL certificates (not recommended in production)

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error fetching data from Wikipedia']);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

if (!isset($data['title']) || !isset($data['extract'])) {
    http_response_code(404);
    echo json_encode(['error' => 'Country information not found']);
    exit;
}

$filteredData = [
    'title' => $data['title'],
    'extract' => $data['extract'],
    'content_urls' => $data['content_urls']['desktop']['page'] ?? '',
    'originalimage' => $data['originalimage']['source'] ?? '',
];

header('Content-Type: application/json');
echo json_encode($filteredData);
?>