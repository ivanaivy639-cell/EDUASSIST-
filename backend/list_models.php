<?php
$data = json_decode(file_get_contents('https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6KdTzrM91cvmC8hzYvAFG9r6j4AyF3R5aDKAdpyv7FJug', false, stream_context_create(['http'=>['ignore_errors'=>true]])), true);
foreach ($data['models'] as $m) {
    if (in_array('generateContent', $m['supportedGenerationMethods'] ?? []) && str_contains($m['name'], 'gemini')) {
        echo $m['name'] . PHP_EOL;
    }
}
