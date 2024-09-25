<?php
// getCountryByCoordinates.php

if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];

    // Запит до Nominatim API для зворотного геокодування
    $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lon";

    // Виконуємо cURL запит до API з додаванням заголовка User-Agent
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: MyCustomApp/1.0 (your-email@example.com)' // Замініть на свій додаток та email
    ]);
    $response = curl_exec($ch);

    // Перевіряємо, чи виникла помилка при виконанні запиту
    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        // Перевіряємо, чи відповідає сервер, і чи отримали ми дані
        if ($response === false) {
            echo json_encode(['error' => 'Failed to fetch data from the API.']);
        } else {
            // Встановлюємо заголовок JSON
            header('Content-Type: application/json');
            echo $response;  // Повертаємо результат у форматі JSON
        }
    }

    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid coordinates']);
}
