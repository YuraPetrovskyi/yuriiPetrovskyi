<?php
// getCountryCities.php

// API GeoNames
$isoCode = $_GET['iso'] ?? '';
$username = 'yuriipetrovskyi';
// $url = "http://api.geonames.org/searchJSON?country=$isoCode&featureCode=PPL&maxRows=20&orderby=population&username=$username";
$url = "http://api.geonames.org/searchJSON?country=$isoCode&featureCode=ADM1&maxRows=50&orderby=population&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$cities = json_decode($result, true)['geonames'] ?? [];

// Повертаємо масив міст з іменем, широтою та довготою
$output = [];
foreach ($cities as $city) {
    $output[] = [
        'name' => $city['name'],
        'lat' => $city['lat'],
        'lng' => $city['lng']
    ];
}

header('Content-Type: application/json');
echo json_encode($output);
