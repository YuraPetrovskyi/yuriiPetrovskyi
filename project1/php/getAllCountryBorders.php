<?php
// getAllCountryBorders.php

// Встановлюємо заголовок для JSON відповіді
header('Content-Type: application/json');

// Читання файлу з кордонами країн
$geojsonFilePath = '../data/countries.geojson';

if (file_exists($geojsonFilePath)) {
    // Читаємо вміст файлу
    $geojsonData = file_get_contents($geojsonFilePath);
    
    // Виводимо JSON дані
    echo $geojsonData;
} else {
    // Якщо файл не знайдено, повертаємо помилку
    echo json_encode(['error' => 'GeoJSON file not found']);
}
?>
