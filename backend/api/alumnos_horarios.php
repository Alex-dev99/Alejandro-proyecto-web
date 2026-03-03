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
    // Obtener horarios del alumno con info de profesor y aula
    $query = "SELECT 
                h.id_horario,
                h.dia_semana,
                h.hora_inicio,
                h.hora_fin,
                p.id_profesor,
                p.nombre as profesor_nombre,
                p.apellidos as profesor_apellidos,
                au.id_aula,
                au.nombre as aula_nombre,
                a.materia
              FROM horarios h
              INNER JOIN profesores p ON h.id_profesor = p.id_profesor
              INNER JOIN aulas au ON h.id_aula = au.id_aula
              INNER JOIN alumnos a ON h.id_alumno = a.id_alumno
              WHERE h.id_alumno = :id_alumno
              ORDER BY 
                CASE h.dia_semana
                  WHEN 'Lunes' THEN 1
                  WHEN 'Martes' THEN 2
                  WHEN 'Miércoles' THEN 3
                  WHEN 'Jueves' THEN 4
                  WHEN 'Viernes' THEN 5
                  WHEN 'Sábado' THEN 6
                END,
                h.hora_inicio";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id_alumno', $id_alumno);
    $stmt->execute();
    
    $horarios = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $horarios[] = array(
            "id_horario" => intval($row['id_horario']),
            "dia_semana" => $row['dia_semana'],
            "hora_inicio" => $row['hora_inicio'],
            "hora_fin" => $row['hora_fin'],
            "profesor_nombre" => $row['profesor_nombre'],
            "profesor_apellidos" => $row['profesor_apellidos'],
            "aula_nombre" => $row['aula_nombre'],
            "materia" => $row['materia']
        );
    }
    
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "horarios" => $horarios
    ));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error en la base de datos: " . $e->getMessage()
    ));
}
?>
