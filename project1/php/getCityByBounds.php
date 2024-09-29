<?php
// getCityByBounds.php

// API GeoNames
$north = $_GET['north'] ?? '';
$south = $_GET['south'] ?? '';
$east = $_GET['east'] ?? '';
$west = $_GET['west'] ?? '';

$username = 'yuriipetrovskyi';
$url = "http://api.geonames.org/citiesJSON?north=$north&south=$south&east=$east&west=$west&maxRows=100&username=$username";
// $url = "http://api.geonames.org/citiesJSON?north=56.60169574495618&south=56.58963926529135&east=-3.3143621535820915&west=-3.346832031384309&maxRows=100&username=yuriipetrovskyi";
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: Gazetter/1.0 (yurakarpaty@gmail.com)' // Замініть на свій додаток та email
]);

$result = curl_exec($ch);
// // Діагностика у разі проблем
// if (curl_errno($ch)) {
//     echo 'Error:' . curl_error($ch);
// }

curl_close($ch);

// $cities = json_decode($result, true)['geonames'] ?? [];
// Перевіряємо, чи правильний формат JSON
$cities = json_decode($result, true);
// if (json_last_error() !== JSON_ERROR_NONE) {
//     echo 'JSON Decode Error: ' . json_last_error_msg();
//     exit;
// }

// Повертаємо масив міст з іменем, широтою та довготою
// $output = [];
// foreach ($cities as $city) {
//     $output[] = [
//         'name' => $city['name'],
//         'lat' => $city['lat'],
//         'lng' => $city['lng']
//     ];
// }

header('Content-Type: application/json');
// echo json_encode($output);
echo json_encode($cities);

