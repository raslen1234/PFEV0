<?php
require_once 'db_connect.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => 'OPTIONS request handled']);
    exit;
}

function debugLog($message) {
    file_put_contents('debug.log', date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
}

session_start([
    'cookie_httponly' => true,
    'cookie_secure' => false, // Set to false for local testing
    'cookie_samesite' => 'Strict',
    'cookie_path' => '/', // Ensure cookie is available across the app
]);

// Check if the user is an admin for actions other than login
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || (isset($_POST['action']) && $_POST['action'] !== 'login' && $_POST['action'] !== 'add')) {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized: Admin access required']);
        debugLog("Request failed: Unauthorized access attempt");
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input: No data provided']);
        debugLog("POST failed: No data provided");
        exit;
    }

    // Login logic (no action or action=login, requires only username and password)
    if (!isset($data['action']) || $data['action'] === 'login') {
        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input: Username and password are required']);
            debugLog("Login failed: Invalid input");
            exit;
        }

        $username = trim($data['username']);
        $password = $data['password'];

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and password cannot be empty']);
            debugLog("Login failed: Empty username or password");
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT user_id, username, password, role FROM users WHERE username = :username");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            debugLog("User fetched for $username: " . ($user ? json_encode($user) : 'not found'));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
            debugLog("Login failed: Database error - " . $e->getMessage());
            exit;
        }

        if ($user) {
            debugLog("Password verify for $username: input=$password, db_hash=" . $user['password']);
            if (password_verify($password, $user['password'])) {
                session_regenerate_id(true);
                $_SESSION['user'] = [
                    'user_id' => $user['user_id'],
                    'username' => $user['username'],
                    'role' => $user['role'],
                ];

                debugLog("User logged in: user_id={$user['user_id']}, username={$user['username']}, role={$user['role']}");

                echo json_encode([
                    'message' => 'Login successful',
                    'user' => [
                        'user_id' => $user['user_id'],
                        'username' => $user['username'],
                        'role' => $user['role'],
                    ],
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                debugLog("Login failed: Password verification failed for $username");
            }
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            debugLog("Login failed: User $username not found");
        }
    } elseif ($data['action'] === 'add') {
        // Add new user (admin action)
        if (!isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input: Username, password, and role are required']);
            debugLog("Add user failed: Invalid input");
            exit;
        }

        $username = trim($data['username']);
        $password = $data['password'];
        $role = $data['role'];

        if (empty($username) || empty($password) || empty($role)) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required']);
            debugLog("Add user failed: Empty fields");
            exit;
        }

        try {
            // Check if username already exists
            $stmt = $pdo->prepare("SELECT user_id FROM users WHERE username = :username");
            $stmt->execute(['username' => $username]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Username already exists']);
                debugLog("Add user failed: Username $username already exists");
                exit;
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (:username, :password, :role)");
            $stmt->execute([
                'username' => $username,
                'password' => $hashedPassword,
                'role' => $role,
            ]);

            echo json_encode(['message' => 'User added successfully']);
            debugLog("User added: username=$username, role=$role");
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);
            debugLog("Add user failed: Database error - " . $e->getMessage());
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        debugLog("POST failed: Invalid action - " . ($data['action'] ?? 'none'));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch all users (admin only)
    try {
        $stmt = $pdo->query("SELECT user_id, username, role FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
        debugLog("Fetched all users: " . json_encode($users));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
        debugLog("Fetch users failed: Database error - " . $e->getMessage());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete a user (admin only)
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID required']);
        debugLog("Delete failed: User ID not provided");
        exit;
    }

    $user_id = $_GET['id'];
    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $user_id]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'User deleted successfully']);
            debugLog("User deleted: user_id=$user_id");
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            debugLog("Delete failed: User not found - user_id=$user_id");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
        debugLog("Delete failed: Database error - " . $e->getMessage());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update a user (admin only)
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['user_id']) || !isset($data['username']) || !isset($data['role'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input: User ID, username, and role are required']);
        debugLog("Update failed: Invalid input");
        exit;
    }

    $user_id = $data['user_id'];
    $username = trim($data['username']);
    $role = $data['role'];
    $password = isset($data['password']) && !empty($data['password']) ? password_hash($data['password'], PASSWORD_DEFAULT) : null;

    try {
        // Check if the username already exists for a different user
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE username = :username AND user_id != :user_id");
        $stmt->execute(['username' => $username, 'user_id' => $user_id]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Username already exists']);
            debugLog("Update failed: Username $username already exists for another user");
            exit;
        }

        if ($password) {
            $stmt = $pdo->prepare("UPDATE users SET username = :username, password = :password, role = :role WHERE user_id = :user_id");
            $stmt->execute([
                'username' => $username,
                'password' => $password,
                'role' => $role,
                'user_id' => $user_id,
            ]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET username = :username, role = :role WHERE user_id = :user_id");
            $stmt->execute([
                'username' => $username,
                'role' => $role,
                'user_id' => $user_id,
            ]);
        }

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'User updated successfully']);
            debugLog("User updated: user_id=$user_id, username=$username, role=$role");
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            debugLog("Update failed: User not found - user_id=$user_id");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
        debugLog("Update failed: Database error - " . $e->getMessage());
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    debugLog("Request failed: Method not allowed - " . $_SERVER['REQUEST_METHOD']);
}
?>