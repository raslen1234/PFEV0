<?php
$host = '127.0.0.1';
$dbname = 'waste_management';
$username = 'root'; 
$password = '';     
// block try wl catch exxetuin
try {
    //object pdo ch nconecti 3alb ase b les info l fou9
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    //mode mt3 eror li yemchi bih pdo
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}
?>