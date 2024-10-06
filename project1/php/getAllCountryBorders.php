<?php
// getAllCountryBorders.php

// set the header for the JSON response
header('Content-Type: application/json');

$geojsonFilePath = '../data/countries.geojson';

if (file_exists($geojsonFilePath)) {
    // read the contents of the file
    $geojsonData = file_get_contents($geojsonFilePath);
    
    echo $geojsonData;
} else {
    echo json_encode(['error' => 'GeoJSON file not found']);
}
?>
