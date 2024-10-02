<?php
// getHistoricalPlaces.php

// API GeoNames
$lat = $_GET['lat'] ?? '';
$lng = $_GET['lng'] ?? '';
$radius = 20;

$username = 'yuriipetrovskyi';
$url = "https://secure.geonames.org/findNearbyWikipediaJSON?lat=$lat&lng=$lng&radius=$radius&maxRows=50&username=yuriipetrovskyi";
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
// curl_setopt($ch, CURLOPT_HTTPHEADER, [
//     'User-Agent: Gazetter/1.0 (yurakarpaty@gmail.com)' // Замініть на свій додаток та email
// ]);

$result = curl_exec($ch);

curl_close($ch);


$cities = json_decode($result, true);


header('Content-Type: application/json');
// echo json_encode($output);
echo json_encode($cities);

