<?php
include 'db.php';

// SQL to create logins table
$sql = "CREATE TABLE IF NOT EXISTS logins (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(6) UNSIGNED,
    email VARCHAR(50) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table logins created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
