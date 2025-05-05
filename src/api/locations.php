<?php
require_once 'db_connect.php';
//Cross 3al react js ch ye5dem API with front 
header('Access-Control-Allow-Origin: http://localhost:5173');
//corss endpoints ll methid l mawjoudin
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
//cross content type l json 3al ffront m3a  react
header('Access-Control-Allow-Headers: Content-Type');
//chouf ken request wahda ml methos allowed tab3eth msg confirmation haja zeyda ama ena 3amltha l 7a9 who knows (haja kemla)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => 'OPTIONS request handled']);
    exit;
}
//ahki 3al method heeeehi+ ne5dho request f var request method ch ne5dmo 3leha (best practices ll 5emda b php)!!
$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'GET') {
    //preparer requette SQL+ execution
    $stmt = $pdo->prepare("SELECT * FROM locations");
    $stmt->execute();
    //fetch l tables location
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($locations);
} else {
    // fazet 3al json 3al consloe (best parctices)
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>