<?php
// getCountries.php

// Завантажуємо JSON файл
$jsonFile = file_get_contents(__DIR__ . '/../data/countryBorders.geo.json');  // Вказати правильний шлях до файлу
$countryData = json_decode($jsonFile, true);

// Витягуємо імена країн і їхні ISO-коди
$countries = [];
foreach ($countryData['features'] as $feature) {
    $name = $feature['properties']['name'];
    $isoCode = $feature['properties']['iso_a2'];
    $countries[] = ['name' => $name, 'iso' => $isoCode];
}

// Сортуємо країни за алфавітом
usort($countries, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

// Виводимо масив у форматі JSON
header('Content-Type: application/json');
echo json_encode($countries);


// // Включення відображення помилок
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

// // Отримуємо список країн через Rest Countries API
// $url = "https://restcountries.com/v3.1/all";
// $response = file_get_contents($url);
// $countries = json_decode($response, true);
// curl_setopt($ch, CURLOPT_HTTPHEADER, [
//     'User-Agent: MyCustomApp/1.0 (yurakarpaty@gmail.com)' // Замініть на свій додаток та email
// ]);
// $countryList = [];

// // Обробляємо отримані країни і витягуємо їх англійські назви та ISO-коди
// foreach ($countries as $country) {
//     if (isset($country['cca2']) && isset($country['name']['common'])) {
//         $countryList[] = [
//             'iso' => $country['cca2'],
//             'name' => $country['name']['common']
//         ];
//     }
// }

// // Сортуємо країни за алфавітом
// usort($countryList, function($a, $b) {
//     return strcmp($a['name'], $b['name']);
// });

// // Повертаємо результат у форматі JSON
// header('Content-Type: application/json');
// echo json_encode($countryList);

// ?>
