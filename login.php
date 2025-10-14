<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Special check for admin user
    if ($email === 'admin@gmail.com' && $password === '123456') {
        $_SESSION['user_id'] = 1;
        $_SESSION['user_name'] = 'Admin User';

        // Log the admin login
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $log_sql = "INSERT INTO logins (user_id, email, ip, user_agent) VALUES (?, ?, ?, ?)";
        $log_stmt = $conn->prepare($log_sql);
        $log_stmt->bind_param("isss", $_SESSION['user_id'], $email, $ip, $user_agent);
        $log_stmt->execute();
        $log_stmt->close();

        echo "<script>window.location.href='home.html';</script>";
        exit();
    }

    // Fetch user from database
    $sql = "SELECT id, name, password FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $name, $hashed_password);
        $stmt->fetch();

        if (password_verify($password, $hashed_password)) {
            $_SESSION['user_id'] = $id;
            $_SESSION['user_name'] = $name;

            // Log the login
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $log_sql = "INSERT INTO logins (user_id, email, ip, user_agent) VALUES (?, ?, ?, ?)";
            $log_stmt = $conn->prepare($log_sql);
            $log_stmt->bind_param("isss", $id, $email, $ip, $user_agent);
            $log_stmt->execute();
            $log_stmt->close();

            echo "<script>window.location.href='home.html';</script>";
            exit();
        } else {
            echo "<script>alert('Incorrect password.'); window.location.href='login.html';</script>";
            exit();
        }
    } else {
        echo "<script>alert('No user found with that email.'); window.location.href='login.html';</script>";
        exit();
    }

    $stmt->close();
    $conn->close();
}
?>
