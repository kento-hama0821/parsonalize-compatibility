<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // 開発中は全てのオリジンからのアクセスを許可。本番環境では特定のオリジンに限定することを推奨。

// MBTIタイプの辞書順ソートキーを生成する関数
function getSortedTypeKey($type1, $type2) {
    $types = [$type1, $type2];
    sort($types); // 辞書順にソート
    return implode('-', $types);
}

// リクエストからタイプを取得
$person1Type = isset($_GET['type1']) ? $_GET['type1'] : '';
$person2Type = isset($_GET['type2']) ? $_GET['type2'] : '';

$response = []; // レスポンスデータ

if (empty($person1Type) || empty($person2Type)) {
    $response = [
        'error' => '両方のタイプを選択してください。'
    ];
} else {
    // JSONファイルから相性データを読み込む
    $jsonFilePath = 'compatibility_data.json'; // JSONファイルのパスを適切に設定
    if (!file_exists($jsonFilePath)) {
        $response = [
            'error' => '相性データファイルが見つかりません。'
        ];
    } else {
        $jsonData = file_get_contents($jsonFilePath);
        $compatibilityData = json_decode($jsonData, true);

        // キーを生成してデータを取得
        $key = getSortedTypeKey($person1Type, $person2Type);

        if (isset($compatibilityData[$key])) {
            $response = $compatibilityData[$key];
        } else {
            // 定義されていない組み合わせの場合のデフォルトメッセージ
            $response = $compatibilityData['default'] ?? [
                'title' => 'この組み合わせのデータはまだありません。',
                'summary' => '異なる性格タイプが織りなす関係は、互いに新しい発見と成長の機会をもたらします。違いを理解し、尊重することが鍵です。',
                'strengths' => '多様な視点、お互いを刺激し合う、未知の可能性。',
                'weaknesses' => '誤解が生じやすい、価値観の衝突、コミュニケーションのすれ違い。',
                'tips' => 'オープンなコミュニケーションを心がけ、お互いの違いをポジティブに捉えましょう。'
            ];
            // デフォルトメッセージにもタイプ名を付与する
            $response['title'] = $person1Type . 'と' . $person2Type . 'の相性: ' . $response['title'];
        }
    }
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>