<?php
// getCurrencyRates.php

// Підключення .env для отримання API ключа
require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$apiKey = $_ENV['EXCHANGE_RATES_API_KEY']; // Ключ Open Exchange Rates

$currencyCode = $_GET['currencyCode'] ?? 'USD';
$baseCurrency = $_GET['baseCurrency'] ?? 'USD';

$url = "https://openexchangerates.org/api/latest.json?app_id=$apiKey&base=$baseCurrency&symbols=USD,EUR,GBP,CNY,JPY,INR,CAD,$currencyCode";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    echo $response;
} else {
    echo json_encode(['error' => 'Cannot retrieve exchange rates']);
}
