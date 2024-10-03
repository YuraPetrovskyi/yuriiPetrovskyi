<?php
// getAirports.php

$north = $_GET['north'] ?? '';
$south = $_GET['south'] ?? '';
$east = $_GET['east'] ?? '';
$west = $_GET['west'] ?? '';

$username = 'yuriipetrovskyi';  // Ваше ім'я користувача GeoNames
$url = "http://api.geonames.org/searchJSON?north=$north&south=$south&east=$east&west=$west&featureClass=S&featureCode=AIRP&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$airports = json_decode($result, true);

header('Content-Type: application/json');
echo json_encode($airports);
?>