<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$id_alumno = isset($_GET['id_alumno']) ? intval($_GET['id_alumno']) : 0;

if ($id_alumno <= 0) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "id_alumno es requerido"
    ));
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Obtener recibos del alumno
    $query = "SELECT 
                id_recibo,
                mes,
                importe,
                estado,
                fecha_emision,
                fecha_pago
              FROM recibos
              WHERE id_alumno = :id_alumno
              ORDER BY fecha_emision DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id_alumno', $id_alumno);
    $stmt->execute();
    
    $recibos = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $recibos[] = array(
            "id_recibo" => intval($row['id_recibo']),
            "mes" => $row['mes'],
            "importe" => floatval($row['importe']),
            "estado" => $row['estado'],
            "fecha_emision" => $row['fecha_emision'],
            "fecha_pago" => $row['fecha_pago']
        );
    }
    
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "recibos" => $recibos
    ));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error en la base de datos: " . $e->getMessage()
    ));
}
?>
