<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $query = "SELECT r.*, a.nombre as alumno_nombre 
                      FROM recibos r
                      JOIN alumnos a ON r.id_alumno = a.id_alumno
                      WHERE r.id_recibo = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            $query = "SELECT r.*, a.nombre as alumno_nombre 
                      FROM recibos r
                      JOIN alumnos a ON r.id_alumno = a.id_alumno
                      ORDER BY r.fecha_emision DESC";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO recibos SET 
                  id_alumno = :id_alumno,
                  mes = :mes,
                  importe = :importe,
                  estado = :estado,
                  fecha_emision = NOW(),
                  fecha_pago = :fecha_pago";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id_alumno', $data->id_alumno);
        $stmt->bindParam(':mes', $data->mes);
        $stmt->bindParam(':importe', $data->importe);
        $estado = isset($data->estado) ? $data->estado : 'PENDIENTE';
        $stmt->bindParam(':estado', $estado);
        $fecha_pago = ($estado == 'PAGADO') ? date('Y-m-d H:i:s') : NULL;
        $stmt->bindParam(':fecha_pago', $fecha_pago);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            echo json_encode(array(
                "success" => true,
                "message" => "Recibo creado",
                "id_recibo" => $lastId
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al crear recibo"));
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE recibos SET 
                  id_alumno = :id_alumno,
                  mes = :mes,
                  importe = :importe,
                  estado = :estado,
                  fecha_pago = :fecha_pago
                  WHERE id_recibo = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':id_alumno', $data->id_alumno);
        $stmt->bindParam(':mes', $data->mes);
        $stmt->bindParam(':importe', $data->importe);
        $stmt->bindParam(':estado', $data->estado);
        $fecha_pago = ($data->estado == 'PAGADO') ? date('Y-m-d H:i:s') : NULL;
        $stmt->bindParam(':fecha_pago', $fecha_pago);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Recibo actualizado"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al actualizar"));
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM recibos WHERE id_recibo = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Recibo eliminado"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al eliminar"));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Método no permitido"));
        break;
}
?>