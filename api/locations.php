<?php
require_once 'db_connect.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => 'OPTIONS request handled']);
    exit;
}

$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM locations");
    $stmt->execute();
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($locations);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>