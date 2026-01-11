<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $query = "SELECT * FROM alumnos WHERE id_alumno = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            $query = "SELECT id_alumno, nombre, apellidos, email, curso_actual, materia, 
                             cuota_mensual, metodo_pago, fecha_alta, activo 
                      FROM alumnos ORDER BY fecha_alta DESC";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO alumnos SET 
                  nombre = :nombre,
                  apellidos = :apellidos,
                  email = :email,
                  curso_actual = :curso_actual,
                  materia = :materia,
                  cuota_mensual = :cuota_mensual,
                  metodo_pago = :metodo_pago,
                  fecha_alta = NOW(),
                  activo = :activo,
                  password = :password";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nombre', $data->nombre);
        $stmt->bindParam(':apellidos', $data->apellidos);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':curso_actual', $data->curso_actual);
        $stmt->bindParam(':materia', $data->materia);
        $stmt->bindParam(':cuota_mensual', $data->cuota_mensual);
        $stmt->bindParam(':metodo_pago', $data->metodo_pago);
        $activo = isset($data->activo) ? ($data->activo ? 1 : 0) : 1;
        $stmt->bindParam(':activo', $activo);
        
        $password = isset($data->password) ? $data->password : 'default123';
        $stmt->bindParam(':password', $password);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            echo json_encode(array(
                "success" => true,
                "message" => "Alumno creado",
                "id_alumno" => $lastId
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al crear alumno"));
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE alumnos SET 
                  nombre = :nombre,
                  apellidos = :apellidos,
                  email = :email,
                  curso_actual = :curso_actual,
                  materia = :materia,
                  cuota_mensual = :cuota_mensual,
                  metodo_pago = :metodo_pago,
                  activo = :activo";
        
        if (isset($data->password) && !empty($data->password)) {
            $query .= ", password = :password";
        }
        
        $query .= " WHERE id_alumno = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nombre', $data->nombre);
        $stmt->bindParam(':apellidos', $data->apellidos);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':curso_actual', $data->curso_actual);
        $stmt->bindParam(':materia', $data->materia);
        $stmt->bindParam(':cuota_mensual', $data->cuota_mensual);
        $stmt->bindParam(':metodo_pago', $data->metodo_pago);
        $activo = $data->activo ? 1 : 0;
        $stmt->bindParam(':activo', $activo);
        
        if (isset($data->password) && !empty($data->password)) {
            $stmt->bindParam(':password', $data->password);
        }
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Alumno actualizado"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al actualizar"));
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM alumnos WHERE id_alumno = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Alumno eliminado"));
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