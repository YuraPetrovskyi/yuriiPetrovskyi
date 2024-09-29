<?php
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
    // Журналюємо помилку у разі відсутності .env файлу
    error_log('Не вдалося завантажити .env файл: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Не вдалося завантажити .env файл']);
    exit;
}

// Перевіряємо, чи надані координати (широта і довгота)
if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    $apiKey = $_ENV['OPENWEATHER_API_KEY'];

    // Формуємо запит до One Call API
    $url = "https://api.openweathermap.org/data/2.5/onecall?lat=$lat&lon=$lon&appid=$apiKey";
    
    // Використання cURL для запиту
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    } else {
        // Виводимо відповідь з API
        echo $response;
    }

    curl_close($ch);
} else {
    echo json_encode(['error' => 'Invalid request']);
}
?>
