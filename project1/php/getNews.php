<?php
// getNews.php

// Connect autoload Composer to load libraries
require __DIR__ . '/../vendor/autoload.php';

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

// Check the environment and configure error display
$environment = $_ENV['ENVIRONMENT'];

if ($environment === 'development') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);  // No error reporting in production
}

$apiKey = $_ENV['NEWS_API_KEY'];  
$country = 'us';
$category = (!empty($_GET['category'])) ? $_GET['category'] : 'general';
$endpoint = "https://newsapi.org/v2/top-headlines?country=$country&category=$category&apiKey=$apiKey";

// Initialization curl
$ch = curl_init();

// Settings curl
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Returns the result as a string instead of direct output
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // We turn off the check of SSL certificates (not recommended in production)
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' // Title User-Agent
]);

// Execution of the request
$response = curl_exec($ch);

header('Content-Type: application/json');

if ($response === false) {
    $error = ['error' => 'Error: ' . curl_error($ch)];
    echo json_encode($error);
    curl_close($ch);
    exit;
}

// Close the curl connection
curl_close($ch);

$data = json_decode($response, true);

if ($data['status'] === 'ok') {
    $filteredArticles = array_filter($data['articles'], function($article) {
        return !empty($article['title']) && $article['title'] !== '[Removed]' &&
            !empty($article['description']) && $article['description'] !== '[Removed]' &&
            !empty($article['url']) && filter_var($article['url'], FILTER_VALIDATE_URL);
    });

    echo json_encode(array_values($filteredArticles));
} else {
    $error = ['error' => 'Error receiving news: ' . $data['message']];
    echo json_encode($error);
}
?>
