<?php
// searchPlaceByName.php

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
    // Перевіряємо, чи є всі необхідні дані
    if (isset($city['name'], $city['countryName'], $city['countryCode'], $city['lat'], $city['lng'])) {
        $result[] = [
            'name' => $city['name'], // Дані перевірено, тому можна використовувати напряму
            'countryName' => $city['countryName'],
            'countryCode' => $city['countryCode'],
            'lat' => $city['lat'],
            'lng' => $city['lng']
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($result);
// echo json_encode($cities);

?>