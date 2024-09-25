<?php
// getCountryData.php

// Включаємо відображення помилок для діагностики
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Підключаємо autoload Composer для завантаження бібліотек
require __DIR__ . '/../vendor/autoload.php';

error_log('Не вдалося завантажити .env файл');

// Завантаження змінних середовища з .env
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
    // Журналюємо помилку у разі відсутності .env файлу
    error_log('Не вдалося завантажити .env файл: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Не вдалося завантажити .env файл']);
    exit;
}

// Отримуємо вхідні дані
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// вивід даних в терміналі при CLI
// print_r($input);
// print_r($data);
// error_log('Вхідні дані (input): ' . $input);
// error_log('Декодовані дані (data): ' . print_r($data, true));
error_log('Лог у файл: ' . $input, 3, __DIR__ . '/../my_custom_log.log'); // Лог буде записаний у файл my_custom_log.log в поточній директорії


// Перевірка, чи є поле countryName та воно не порожнє
if (isset($data['countryName'], $data['isoCode']) && !empty($data['countryName']) && !empty($data['isoCode'])) {
    $countryName = $data['countryName'];
    $country = urlencode($countryName);
    $isoCode = strtolower($data['isoCode']);
    
    // Отримуємо API ключ з .env файлу
    $apiKey = $_ENV['OPENCAGE_API_KEY'];
    
    $url = "https://api.opencagedata.com/geocode/v1/json?q={$country}&key={$apiKey}&limit=15";

    // Використання cURL для запиту до API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $apiResponse = curl_exec($ch);
    $apiData = json_decode($apiResponse, true);

    error_log('Лог у файл: ' . print_r($apiResponse, true), 3, __DIR__ . '/../my_custom_log2.log');

    // Перевіряємо на помилки cURL
    if (curl_errno($ch)) {
        error_log('Помилка cURL: ' . curl_error($ch));
        http_response_code(500);
        echo json_encode(['error' => 'cURL помилка: ' . curl_error($ch)]);
    } else {
        // Фільтруємо результати за назвою країни та ISO-кодом
        $filteredResults = array_filter($apiData['results'], function($result) use ($countryName, $isoCode) {
            return isset($result['components']['country']) &&
                    isset($result['components']['country_code']) &&
                    stripos($result['components']['country'], $countryName) !== false && // Пошук підрядка
                    strtolower($result['components']['country_code']) === $isoCode;
        });

        if (!empty($filteredResults)) {
            // Повертаємо тільки перший результат, якщо знайдений
            header('Content-Type: application/json');
            echo json_encode(array_values($filteredResults)[0]);
        } else {
            // Якщо не знайдено результату для введеної країни
            http_response_code(404);
            echo json_encode(['error' => "Country {$countryName} with ISO code {$isoCode} not found"]);
        }
    }

    curl_close($ch);
} else {
    // Якщо параметр не надано або він порожній
    http_response_code(400);
    echo json_encode(['error' => 'Country name is missing or empty']);
}