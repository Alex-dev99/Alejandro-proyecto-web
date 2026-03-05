<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_recibo)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "id_recibo es requerido"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "UPDATE recibos SET 
              estado = 'Pagado',
              fecha_pago = NOW()
              WHERE id_recibo = :id_recibo";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id_recibo', $data->id_recibo);

    if ($stmt->execute()) {
        echo json_encode(array("success" => true, "message" => "Recibo marcado como pagado"));
    }
    else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Error al actualizar recibo"));
    }
}
catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Error de base de datos: " . $e->getMessage()));
}
?>
