<?php
// getCityByBounds.php

// API GeoNames
$north = $_GET['north'] ?? '';
$south = $_GET['south'] ?? '';
$east = $_GET['east'] ?? '';
$west = $_GET['west'] ?? '';
$fcode = $_GET['fcode'] ?? ''; 

$username = 'yuriipetrovskyi';
$url = "http://api.geonames.org/citiesJSON?north=$north&south=$south&east=$east&west=$west&maxRows=100&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: Gazetter/1.0 (yurakarpaty@gmail.com)' // Замініть на свій додаток та email
]);

$result = curl_exec($ch);
curl_close($ch);

// $cities = json_decode($result, true);
$cities = json_decode($result, true)['geonames'] ?? [];

// Якщо є параметр fcode, фільтруємо міста
if (!empty($fcode)) {
    $cities = array_filter($cities, function($city) use ($fcode) {
        return isset($city['fcode']) && $city['fcode'] !== $fcode;
    });
}

// Формуємо вихідний масив з потрібними даними тільки якщо всі властивості існують
$output = [];
foreach ($cities as $city) {
    if (isset($city['name'], $city['lat'], $city['lng'], $city['population'])) {
        $output[] = [
            'name' => $city['name'],
            'lat' => $city['lat'],
            'lng' => $city['lng'],
            'population' => $city['population']
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($output);

// echo json_encode($cities);

