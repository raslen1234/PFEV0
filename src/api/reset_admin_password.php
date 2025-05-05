<?php
require_once 'db_connect.php';

$username = 'admin';
$newPassword = 'admin';
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("UPDATE users SET password = :password WHERE username = :username");
    $stmt->execute([
        'password' => $hashedPassword,
        'username' => $username,
    ]);
    echo "Password for user 'admin' updated successfully!";
} catch (PDOException $e) {
    echo "Error updating password: " . $e->getMessage();
}
?>