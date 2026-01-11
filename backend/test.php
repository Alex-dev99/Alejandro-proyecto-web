<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT 1 as test";
$stmt = $db->prepare($query);
$stmt->execute();

echo json_encode(array(
    "success" => true,
    "message" => "Conexión a MySQL exitosa",
    "timestamp" => date('Y-m-d H:i:s')
));
?>