<?php
require_once 'db_connect.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => 'OPTIONS request handled']);
    exit;
}

session_start([
    'cookie_httponly' => true,
    'cookie_secure' => false, // Match users.php setting
    'cookie_samesite' => 'Strict',
    'cookie_path' => '/', // Match users.php setting
]);

function debugLog($message) {
    file_put_contents('debug.log', date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
}
debugLog("Session data: user_id=" . ($_SESSION['user_id'] ?? 'not set') . ", role=" . ($_SESSION['role'] ?? 'not set'));

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: Admin access required']);
    debugLog("Access denied: No user_id or role not admin");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input: Username, password, and role are required']);
        debugLog("Add user failed: Invalid input");
        exit;
    }

    $username = trim($data['username']);
    $password = $data['password'];
    $role = $data['role'];

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password cannot be empty']);
        debugLog("Add user failed: Empty username or password");
        exit;
    }

    $allowedRoles = ['worker', 'municipality_head', 'admin'];
    if (!in_array($role, $allowedRoles)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid role']);
        debugLog("Add user failed: Invalid role - $role");
        exit;
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    if ($stmt->fetchColumn() > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'User already exists']);
        debugLog("Add user failed: Username $username already exists");
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (:username, :password, :role)");
        $stmt->execute([
            'username' => $username,
            'password' => $hashedPassword,
            'role' => $role,
        ]);
        debugLog("User added successfully: username=$username, role=$role");
        echo json_encode(['message' => 'User added successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        debugLog("Add user failed: Database error - " . $e->getMessage());
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    debugLog("Request failed: Method not allowed - " . $_SERVER['REQUEST_METHOD']);
}
?>