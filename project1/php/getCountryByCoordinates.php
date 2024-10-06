<?php
// getCountryByCoordinates.php

header('Content-Type: application/json');

if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];

    $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lon";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: MyCustomApp/1.0 (your-email@example.com)'
    ]);
    
    $response = curl_exec($ch);
    
    // We check whether an error occurred during the execution of the request
    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        $countryData = json_decode($response, true);
        if (isset($countryData['address'])) {
            $output = [
                'countryName' => $countryData['address']['country'],
                'countryISO' => $countryData['address']['country_code'],
            ];
            echo json_encode($output);
        } else {
            echo json_encode(['error' => 'Invalid data from Weather API']);
        }
    }
    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid coordinates']);
}
?>