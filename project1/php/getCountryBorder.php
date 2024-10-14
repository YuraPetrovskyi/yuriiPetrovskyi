<?php
// Вказуємо шлях до файлу countries.geojson
$filePath = '../data/countries.geojson';

// Перевіряємо, чи передано isoCode
if (!isset($_GET['isoCode'])) {
    http_response_code(400);
    echo json_encode(['error' => 'isoCode is required']);
    exit;
}

$isoCode = $_GET['isoCode'];

// Читаємо файл countries.geojson
if (!file_exists($filePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'GeoJSON file not found']);
    exit;
}

$geojson = file_get_contents($filePath);
$geojsonData = json_decode($geojson, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid GeoJSON format']);
    exit;
}

// Фільтруємо країни за кодом ISO
$filteredCountry = array_filter($geojsonData['features'], function($feature) use ($isoCode) {
    return $feature['properties']['ISO_A2'] === $isoCode;
});

if (empty($filteredCountry)) {
    http_response_code(404);
    echo json_encode(['error' => 'Country not found']);
    exit;
}

// Повертаємо країну у форматі GeoJSON
$result = [
    'type' => 'FeatureCollection',
    'features' => array_values($filteredCountry)
];

header('Content-Type: application/json');
echo json_encode($result);
?>
