<?php
// getCountryDetails.php

// Перевіряємо, чи передано параметр 'countryName'
$countryName = isset($_GET['countryName']) ? urlencode($_GET['countryName']) : '';

if (!$countryName) {
    http_response_code(400);
    echo json_encode(['error' => 'Country name is missing']);
    exit;
}

// URL для запиту до Rest Countries API
$apiUrl = "https://restcountries.com/v3.1/name/{$countryName}";

// Виконуємо запит до API
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: MyCustomApp/1.0 (your-email@example.com)' // Замініть на свій додаток та email
]);
$response = curl_exec($ch);
curl_close($ch);

// Перевіряємо результат
if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Error fetching country data']);
    exit;
}

// Повертаємо результат у форматі JSON
header('Content-Type: application/json');
echo $response;
?>
