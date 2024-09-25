<?php
// getCountryBorders.php

// Включення відображення помилок
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Отримуємо код країни (ISO-код) з параметрів GET-запиту
$isoCode = $_GET['iso'] ?? '';

if (!$isoCode) {
    // Якщо код країни не надано, повертаємо помилку
    http_response_code(400);
    echo json_encode(['error' => 'No country code specified']);
    exit;
}

// Завантажуємо JSON файл з даними про країни
$jsonFile = file_get_contents(__DIR__ . '/../data/countryBorders.geo.json');
$countryData = json_decode($jsonFile, true);

// Шукаємо країну за ISO-кодом
$countryBorder = null;
foreach ($countryData['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $isoCode) {
        $countryBorder = $feature;
        break;
    }
}

// Якщо знайдено, повертаємо кордон країни у форматі GeoJSON
if ($countryBorder) {
    header('Content-Type: application/json');
    echo json_encode($countryBorder['geometry']);
} else {
    // Якщо країну не знайдено
    http_response_code(404);
    echo json_encode(['error' => 'Country not found']);
}

?>

