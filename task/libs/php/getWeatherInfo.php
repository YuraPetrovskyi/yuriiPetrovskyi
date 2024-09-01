<?php
$executionStartTime = microtime(true);
$latitude = isset($_POST['lat']) ? urlencode($_POST['lat']) : '';
$longitude = isset($_POST['lng']) ? urlencode($_POST['lng']) : '';
$username = 'yuriipetrovskyi';
$url = "http://api.geonames.org/findNearByWeatherJSON?lat={$latitude}&lng={$longitude}&username={$username}";

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
    $output['data'] = $decode;
}

$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>
