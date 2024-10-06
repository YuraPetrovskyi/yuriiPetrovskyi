<?php
// getCountries.php

// download the JSON file
$jsonFile = file_get_contents(__DIR__ . '/../data/countryBorders.geo.json');
$countryData = json_decode($jsonFile, true);


$countries = [];
foreach ($countryData['features'] as $feature) {
    $name = $feature['properties']['name'];
    $isoCode = $feature['properties']['iso_a2'];
    $countries[] = ['name' => $name, 'iso' => $isoCode];
}

// sort the countries
usort($countries, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

// output the array in JSON format
header('Content-Type: application/json');
echo json_encode($countries);

// ?>
