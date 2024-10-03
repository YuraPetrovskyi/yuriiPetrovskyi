<?php
// getCityByName.php

$cityName = $_GET['cityName'] ?? '';
$username = 'yuriipetrovskyi';

if (empty($cityName)) {
    echo json_encode([]);
    exit;
}

$url = "http://api.geonames.org/searchJSON?q=" . urlencode($cityName) . "&maxRows=10&username=" . $username;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$response = curl_exec($ch);
curl_close($ch);

$cities = json_decode($response, true)['geonames'] ?? [];

$result = [];
foreach ($cities as $city) {
    $result[] = [
        'name' => isset($city['name']) ? $city['name'] : 'Unknown', // Якщо немає 'name', виведе 'Unknown'
        'countryName' => isset($city['countryName']) ? $city['countryName'] : 'Unknown', // Якщо немає 'countryName', виведе 'Unknown'
        'lat' => isset($city['lat']) ? $city['lat'] : null, // Якщо немає 'lat', виведе null
        'lng' => isset($city['lng']) ? $city['lng'] : null // Якщо немає 'lng', виведе null
    ];
}


header('Content-Type: application/json');
echo json_encode($result);
// echo json_encode($cities);

?>