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

$id_profesor = isset($_GET['id_profesor']) ? intval($_GET['id_profesor']) : 0;

if ($id_profesor <= 0) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "id_profesor es requerido"
    ));
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Obtener alumnos únicos que tienen clases con este profesor
    $query = "SELECT DISTINCT 
                a.id_alumno,
                a.nombre,
                a.apellidos,
                a.email,
                a.curso_actual,
                a.materia
              FROM alumnos a
              INNER JOIN horarios h ON a.id_alumno = h.id_alumno
              WHERE h.id_profesor = :id_profesor
              AND a.activo = 1
              ORDER BY a.nombre, a.apellidos";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id_profesor', $id_profesor);
    $stmt->execute();
    
    $alumnos = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $alumnos[] = array(
            "id_alumno" => intval($row['id_alumno']),
            "nombre" => $row['nombre'],
            "apellidos" => $row['apellidos'],
            "email" => $row['email'],
            "curso_actual" => $row['curso_actual'],
            "materia" => $row['materia']
        );
    }
    
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "alumnos" => $alumnos
    ));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error en la base de datos: " . $e->getMessage()
    ));
}
?>
