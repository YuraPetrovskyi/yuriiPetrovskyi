<?php
// getWeather.php

// Enable error display for diagnostics
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Connect autoload Composer to load libraries
require __DIR__ . '/../vendor/autoload.php';

error_log('Не вдалося завантажити .env файл');
// Loading environment variables from .env
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
    // Log an error if there is no .env file
    error_log('Не вдалося завантажити .env файл: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Не вдалося завантажити .env файл']);
    exit;
}

if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    $apiKey = $_ENV['OPENWEATHER_API_KEY'];

    $url = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&appid=$apiKey&units=metric";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    
    header('Content-Type: application/json');

    if (curl_errno($ch)) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        $weatherData = json_decode($response, true);

        if (isset($weatherData['main'])) {
            $output = [
                'temp' => $weatherData['main']['temp'],
                'clouds' => $weatherData['clouds']['all'],
                'humidity' => $weatherData['main']['humidity'],
                'pressure' => $weatherData['main']['pressure'],
                'windSpeed' => $weatherData['wind']['speed'],
                'windDirection' => $weatherData['wind']['deg'],
                'country' => $weatherData['sys']['country'],
                'icon' => $weatherData['weather'][0]['icon'],
                'weatherDescription' => $weatherData['weather'][0]['description'],
                'name' => $weatherData['name']
            ];

            echo json_encode($output);
        } else {
            echo json_encode(['error' => 'Invalid data from Weather API']);
        }
    }

    curl_close($ch);
} else {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid request']);
}
?>
