<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');


function getSortedTypeKey(string $t1, string $t2): string {
    $arr = [$t1, $t2];
    sort($arr, SORT_STRING);
    return implode('-', $arr);
}

$type1 = $_GET['type1'] ?? '';
$type2 = $_GET['type2'] ?? '';

if ($type1 === '' || $type2 === '') {
    http_response_code(400);
    echo json_encode(['error' => '両方のタイプを指定してください。']);
    exit;
}

$jsonFile = __DIR__ . '/compatibility_data.json';
if (!file_exists($jsonFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'compatibility_data.json が見つかりません。パス: ' . $jsonFile]);
    exit;
}

$json = @file_get_contents($jsonFile);
if ($json === false) {
    http_response_code(500);
    echo json_encode(['error' => 'ファイルの読み取りに失敗しました。エラー: ' . error_get_last()['message']]);
    exit;
}

$data = json_decode($json, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'JSONのパースに失敗しました。エラー: ' . json_last_error_msg()]);
    exit;
}

$key = getSortedTypeKey($type1, $type2);
if (isset($data[$key])) {
    echo json_encode($data[$key], JSON_UNESCAPED_UNICODE);
} else {
    // default があることを前提に
    $def = $data['default'];
    $def['title'] = "{$type1} と {$type2} の相性: " . $def['title'];
    echo json_encode($def, JSON_UNESCAPED_UNICODE);
}
