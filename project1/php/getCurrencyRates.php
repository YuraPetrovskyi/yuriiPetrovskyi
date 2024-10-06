<?php
// getCurrencyRates.php

// Enable error display for diagnostics
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Connect autoload Composer to load libraries
require __DIR__ . '/../vendor/autoload.php';

error_log('Failed to load .env file');
// Loading environment variables from .env
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
  // Log an error if there is no .env file
    error_log('Failed to load .env file: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to load .env file']);
    exit;
}

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
