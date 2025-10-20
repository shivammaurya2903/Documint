<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Step 1: Sanitize input
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($email) || empty($password)) {
        echo "<script>alert('Email and password are required.'); window.location.href='login.html';</script>";
        exit();
    }

    // Step 2: Prepare and execute user lookup
    $sql = "SELECT id, name, password FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        die("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    // Step 3: Verify user and password
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $name, $hashed_password);
        $stmt->fetch();

        if (password_verify($password, $hashed_password)) {
            // Step 4: Set session
            $_SESSION['user_id'] = $id;
            $_SESSION['user_name'] = $name;

            // Step 5: Log login details
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $log_sql = "INSERT INTO logins (user_id, email, ip, user_agent) VALUES (?, ?, ?, ?)";
            $log_stmt = $conn->prepare($log_sql);
            if ($log_stmt) {
                $log_stmt->bind_param("isss", $id, $email, $ip, $user_agent);
                $log_stmt->execute();
                $log_stmt->close();
            } else {
                error_log("Login log prepare failed: " . $conn->error);
            }

            // Step 6: Redirect to home
            header("Location: home.html");
            exit();
        } else {
            echo "<script>alert('Incorrect password.'); window.location.href='login.html';</script>";
            exit();
        }
    } else {
        echo "<script>alert('No user found with that email.'); window.location.href='login.html';</script>";
        exit();
    }

    // Step 7: Cleanup
    $stmt->close();
    $conn->close();
}
?>