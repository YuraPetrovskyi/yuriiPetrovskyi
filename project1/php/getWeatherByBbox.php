<?php
//getWeatherByBbox.php

// Увімкнення відображення помилок для діагностики
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Підключаємо autoload Composer для завантаження бібліотек
require __DIR__ . '/../vendor/autoload.php';

// Завантаження змінних середовища з .env
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
    error_log('Не вдалося завантажити .env файл: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Не вдалося завантажити .env файл']);
    exit;
}

if (isset($_GET['bbox'])) {
    $bbox = $_GET['bbox'];  // bbox format: left,bottom,right,top,zoom
    $apiKey = $_ENV['OPENWEATHER_API_KEY'];

    // Формуємо URL для запиту погоди для bbox
    $url = "https://api.openweathermap.org/data/2.5/box/city?bbox=$bbox&appid=$apiKey&units=metric";

    // Використання cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        echo $response;
    }

    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid request']);
}
