<?php
require_once 'db_connect.php';

try {
    // Fetch users kol
    $stmt = $pdo->query("SELECT user_id, username, password FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Hash password li deja mawjoud
    $updateStmt = $pdo->prepare("UPDATE users SET password = :password WHERE user_id = :user_id");

    foreach ($users as $user) {
        $currentPassword = $user['password'];
        $newHashedPassword = password_hash($currentPassword, PASSWORD_BCRYPT);

        $updateStmt->execute([
            'password' => $newHashedPassword,
            'user_id' => $user['user_id'],
        ]);
        echo "Hashed password for user: {$user['username']} (old: $currentPassword, new: $newHashedPassword)\n";
    }
    echo "All passwords have been forcefully hashed successfully!";
} catch (PDOException $e) {
    echo "Error updating passwords: " . $e->getMessage();
}
?>