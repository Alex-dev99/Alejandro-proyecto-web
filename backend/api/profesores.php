<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $query = "SELECT * FROM profesores WHERE id_profesor = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            $query = "SELECT id_profesor, nombre, apellidos, alias, fecha_nacimiento, 
                             materias_imparte, email, cuenta_bancaria, activo, administrador 
                      FROM profesores ORDER BY nombre";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO profesores SET 
                  nombre = :nombre,
                  apellidos = :apellidos,
                  alias = :alias,
                  fecha_nacimiento = :fecha_nacimiento,
                  materias_imparte = :materias_imparte,
                  email = :email,
                  cuenta_bancaria = :cuenta_bancaria,
                  administrador = :administrador,
                  activo = :activo,
                  password = :password";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nombre', $data->nombre);
        $stmt->bindParam(':apellidos', $data->apellidos);
        $stmt->bindParam(':alias', $data->alias);
        $stmt->bindParam(':fecha_nacimiento', $data->fecha_nacimiento);
        $stmt->bindParam(':materias_imparte', $data->materias_imparte);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':cuenta_bancaria', $data->cuenta_bancaria);
        $administrador = isset($data->administrador) ? ($data->administrador ? 1 : 0) : 0;
        $stmt->bindParam(':administrador', $administrador);
        $activo = isset($data->activo) ? ($data->activo ? 1 : 0) : 1;
        $stmt->bindParam(':activo', $activo);
        
        $password = isset($data->password) ? $data->password : 'default123';
        $stmt->bindParam(':password', $password);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            echo json_encode(array(
                "success" => true,
                "message" => "Profesor creado",
                "id_profesor" => $lastId
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al crear profesor"));
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE profesores SET 
                  nombre = :nombre,
                  apellidos = :apellidos,
                  alias = :alias,
                  fecha_nacimiento = :fecha_nacimiento,
                  materias_imparte = :materias_imparte,
                  email = :email,
                  cuenta_bancaria = :cuenta_bancaria,
                  administrador = :administrador,
                  activo = :activo";
        
        if (isset($data->password) && !empty($data->password)) {
            $query .= ", password = :password";
        }
        
        $query .= " WHERE id_profesor = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nombre', $data->nombre);
        $stmt->bindParam(':apellidos', $data->apellidos);
        $stmt->bindParam(':alias', $data->alias);
        $stmt->bindParam(':fecha_nacimiento', $data->fecha_nacimiento);
        $stmt->bindParam(':materias_imparte', $data->materias_imparte);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':cuenta_bancaria', $data->cuenta_bancaria);
        $administrador = $data->administrador ? 1 : 0;
        $stmt->bindParam(':administrador', $administrador);
        $activo = $data->activo ? 1 : 0;
        $stmt->bindParam(':activo', $activo);
        
        if (isset($data->password) && !empty($data->password)) {
            $stmt->bindParam(':password', $data->password);
        }
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Profesor actualizado"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al actualizar"));
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM profesores WHERE id_profesor = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Profesor eliminado"));
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