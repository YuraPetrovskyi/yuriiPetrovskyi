<?php
// getCountryDetails.php

$countryName = isset($_GET['countryName']) ? urlencode($_GET['countryName']) : '';

if (!$countryName) {
    http_response_code(400);
    echo json_encode(['error' => 'Country name is missing']);
    exit;
}

$apiUrl = "https://restcountries.com/v3.1/alpha/{$countryName}";


// execute a request to the API
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $apiUrl);
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

// return the result in JSON format
header('Content-Type: application/json');
echo $response;
?>
