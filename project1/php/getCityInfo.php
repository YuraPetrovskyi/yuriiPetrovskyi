<?php
// getCityInfo.php

$executionStartTime = microtime(true);
$cityName = isset($_POST['city']) ? urlencode($_POST['city']) : '';
$username = 'yuriipetrovskyi';
$url = "http://api.geonames.org/searchJSON?name_equals={$cityName}&maxRows=5&featureCode=PPLC&username={$username}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decode = json_decode($result, true);

if (isset($decode['status']) && isset($decode['status']['message'])) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "error";
    $output['status']['description'] = $decode['status']['message'];
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data'] = $decode['geonames'];
}

$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>
