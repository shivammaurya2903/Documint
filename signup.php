<?php
session_start();
include 'db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize inputs
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    $errors = [];

    if (empty($name)) {
        $errors['name'] = 'Name is required.';
    }
    if (empty($email)) {
        $errors['email'] = 'Email is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email format.';
    }
    if (empty($password)) {
        $errors['password'] = 'Password is required.';
    }
    if ($password !== $confirm_password) {
        $errors['confirm_password'] = 'Passwords do not match.';
    }

    if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit();
    }

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Check if email already exists
    $check_sql = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($check_sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'errors' => ['general' => 'Database error.']]);
        exit();
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo json_encode(['success' => false, 'errors' => ['email' => 'Email already exists.']]);
        $stmt->close();
        $conn->close();
        exit();
    }
    $stmt->close();

    // Insert new user
    $insert_sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($insert_sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'errors' => ['general' => 'Database error.']]);
        exit();
    }
    $stmt->bind_param("sss", $name, $email, $hashed_password);

    if ($stmt->execute()) {
        // Set user variables
        $_SESSION['user_id'] = $conn->insert_id;
        $_SESSION['user_name'] = $name;

        echo json_encode(['success' => true, 'redirect' => 'home.html']);
        exit();
    } else {
        echo json_encode(['success' => false, 'errors' => ['general' => 'Error creating account.']]);
    }

    $stmt->close();
    $conn->close();
}
?>
