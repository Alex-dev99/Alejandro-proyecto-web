<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $query = "SELECT h.*, a.nombre as alumno_nombre, p.nombre as profesor_nombre, au.nombre as aula_nombre 
                      FROM horarios h
                      JOIN alumnos a ON h.id_alumno = a.id_alumno
                      JOIN profesores p ON h.id_profesor = p.id_profesor
                      JOIN aulas au ON h.id_aula = au.id_aula
                      WHERE h.id_horario = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            $query = "SELECT h.*, a.nombre as alumno_nombre, p.nombre as profesor_nombre, au.nombre as aula_nombre 
                      FROM horarios h
                      JOIN alumnos a ON h.id_alumno = a.id_alumno
                      JOIN profesores p ON h.id_profesor = p.id_profesor
                      JOIN aulas au ON h.id_aula = au.id_aula
                      ORDER BY h.dia_semana, h.hora_inicio";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO horarios SET 
                  id_alumno = :id_alumno,
                  id_profesor = :id_profesor,
                  id_aula = :id_aula,
                  dia_semana = :dia_semana,
                  hora_inicio = :hora_inicio,
                  hora_fin = :hora_fin,
                  fecha_creacion = NOW()";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id_alumno', $data->id_alumno);
        $stmt->bindParam(':id_profesor', $data->id_profesor);
        $stmt->bindParam(':id_aula', $data->id_aula);
        $stmt->bindParam(':dia_semana', $data->dia_semana);
        $stmt->bindParam(':hora_inicio', $data->hora_inicio);
        $stmt->bindParam(':hora_fin', $data->hora_fin);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            echo json_encode(array(
                "success" => true,
                "message" => "Horario creado",
                "id_horario" => $lastId
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al crear horario"));
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE horarios SET 
                  id_alumno = :id_alumno,
                  id_profesor = :id_profesor,
                  id_aula = :id_aula,
                  dia_semana = :dia_semana,
                  hora_inicio = :hora_inicio,
                  hora_fin = :hora_fin
                  WHERE id_horario = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':id_alumno', $data->id_alumno);
        $stmt->bindParam(':id_profesor', $data->id_profesor);
        $stmt->bindParam(':id_aula', $data->id_aula);
        $stmt->bindParam(':dia_semana', $data->dia_semana);
        $stmt->bindParam(':hora_inicio', $data->hora_inicio);
        $stmt->bindParam(':hora_fin', $data->hora_fin);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Horario actualizado"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al actualizar"));
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM horarios WHERE id_horario = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Horario eliminado"));
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