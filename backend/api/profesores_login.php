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

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id_profesor, nombre, apellidos, email, materias_imparte, administrador, activo 
              FROM profesores 
              WHERE email = :email 
              AND password = :password
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':password', $data->password);
    
    try {
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row['activo'] == 0) {
                http_response_code(403);
                echo json_encode(array(
                    "success" => false, 
                    "message" => "⚠️ Tu cuenta está inactiva. Por favor, contacta al administrador.",
                    "type" => "inactive"
                ));
                exit();
            }
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Login exitoso",
                "usuario" => array(
                    "id" => intval($row['id_profesor']),
                    "nombre" => $row['nombre'],
                    "apellidos" => $row['apellidos'],
                    "email" => $row['email'],
                    "materias_imparte" => $row['materias_imparte'],
                    "administrador" => intval($row['administrador']),
                    "rol" => "PROFESOR"
                )
            ));
            exit();
        } else {
            http_response_code(401);
            echo json_encode(array(
                "success" => false, 
                "message" => "Email o contraseña incorrectos",
                "type" => "invalid_credentials"
            ));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false, 
            "message" => "Error en la base de datos: " . $e->getMessage(),
            "type" => "database_error"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false, 
        "message" => "Email y contraseña son requeridos",
        "type" => "incomplete_data"
    ));
}
?>
