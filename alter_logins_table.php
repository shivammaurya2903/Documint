<?php
include 'db.php';

// Check if columns exist before adding
$columns = $conn->query("SHOW COLUMNS FROM logins LIKE 'ip'");
if ($columns->num_rows == 0) {
    $sql_ip = "ALTER TABLE logins ADD COLUMN ip VARCHAR(45)";
    if ($conn->query($sql_ip) !== TRUE) {
        echo "Error adding ip column: " . $conn->error;
    }
}

$columns = $conn->query("SHOW COLUMNS FROM logins LIKE 'user_agent'");
if ($columns->num_rows == 0) {
    $sql_ua = "ALTER TABLE logins ADD COLUMN user_agent TEXT";
    if ($conn->query($sql_ua) !== TRUE) {
        echo "Error adding user_agent column: " . $conn->error;
    }
}

echo "Table logins checked and altered if necessary";

$conn->close();
?>
