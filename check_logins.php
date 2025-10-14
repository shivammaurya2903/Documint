<?php
include 'db.php';

$sql = "SELECT * FROM logins";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id"]. " - User ID: " . $row["user_id"]. " - Email: " . $row["email"]. " - Login Time: " . $row["login_time"]. " - IP: " . $row["ip"]. " - User Agent: " . $row["user_agent"]. "<br>";
    }
} else {
    echo "No logins found";
}

$conn->close();
?>
