<?php
require_once 'db_connect.php';
// cross ki 3ada
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    //confirmation raw cv hhtp
    http_response_code(200);
    echo json_encode(['message' => 'OPTIONS request handled']);
    exit;
}

$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'GET') {
    //nchfoo l waste m table fl base
    $stmt = $pdo->prepare("SELECT * FROM waste_types");
    $stmt->execute();
    $waste_types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($waste_types);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>