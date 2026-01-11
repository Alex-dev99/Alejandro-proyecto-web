<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $query = "SELECT * FROM aulas WHERE id_aula = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            $query = "SELECT * FROM aulas ORDER BY nombre";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO aulas SET 
                  nombre = :nombre,
                  capacidad = :capacidad,
                  descripcion = :descripcion";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nombre', $data->nombre);
        $stmt->bindParam(':capacidad', $data->capacidad);
        $descripcion = isset($data->descripcion) ? $data->descripcion : '';
        $stmt->bindParam(':descripcion', $descripcion);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            echo json_encode(array(
                "success" => true,
                "message" => "Aula creada",
                "id_aula" => $lastId
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al crear aula"));
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE aulas SET 
                  nombre = :nombre,
                  capacidad = :capacidad,
                  descripcion = :descripcion
                  WHERE id_aula = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nombre', $data->nombre);
        $stmt->bindParam(':capacidad', $data->capacidad);
        $descripcion = isset($data->descripcion) ? $data->descripcion : '';
        $stmt->bindParam(':descripcion', $descripcion);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Aula actualizada"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al actualizar"));
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM aulas WHERE id_aula = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Aula eliminada"));
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