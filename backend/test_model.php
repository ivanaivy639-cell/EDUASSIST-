<?php
$key = 'AQ.Ab8RN6KdTzrM91cvmC8hzYvAFG9r6j4AyF3R5aDKAdpyv7FJug';
$model = 'gemini-2.0-flash-lite';
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}";
$payload = json_encode([
    'contents' => [['parts' => [['text' => 'dis bonjour en une phrase']]]],
]);
$ctx = stream_context_create(['http' => [
    'method' => 'POST',
    'header' => "Content-Type: application/json\r\n",
    'content' => $payload,
    'ignore_errors' => true,
]]);
$result = file_get_contents($url, false, $ctx);
echo $result . PHP_EOL;
