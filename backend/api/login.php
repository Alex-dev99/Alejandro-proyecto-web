<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    // Primero verificar si existe un profesor con ese email
    $query = "SELECT id_profesor as id, nombre, email, 'PROFESOR' as rol, administrador, activo, password 
              FROM profesores 
              WHERE email = :email";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificar la contraseña cifrada
        if (password_verify($data->password, $row['password'])) {
            // Verificar si el profesor está inactivo
            if ($row['activo'] == 0) {
                http_response_code(403);
                echo json_encode(array(
                    "success" => false, 
                    "message" => "⚠️ Tu cuenta está inactiva. Por favor, contacta al administrador.",
                    "type" => "inactive"
                ));
                exit();
            }
            
            // Verificar si es administrador
            if ($row['administrador'] == 0) {
                http_response_code(403);
                echo json_encode(array(
                    "success" => false, 
                    "message" => "❌ No tienes permisos suficientes. Solo los administradores pueden acceder al sistema.",
                    "type" => "insufficient_permissions"
                ));
                exit();
            }
            
            // Si es administrador y está activo, permitir login
            $response = array(
                "success" => true,
                "message" => "Login exitoso",
                "usuario" => array(
                    "id" => $row['id'],
                    "nombre" => $row['nombre'],
                    "email" => $row['email'],
                    "rol" => $row['rol'],
                    "administrador" => $row['administrador']
                )
            );
            echo json_encode($response);
            exit();
        } else {
            http_response_code(401);
            echo json_encode(array(
                "success" => false, 
                "message" => "Email o contraseña incorrectos",
                "type" => "invalid_credentials"
            ));
            exit();
        }
    }
    
    // Si no es profesor, intentar con alumno
    $query = "SELECT id_alumno as id, nombre, email, 'ALUMNO' as rol, password 
              FROM alumnos 
              WHERE email = :email AND activo = 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificar la contraseña cifrada
        if (password_verify($data->password, $row['password'])) {
            // Alumnos no pueden acceder según los requisitos
            http_response_code(403);
            echo json_encode(array(
                "success" => false, 
                "message" => "❌ No tienes permisos suficientes. Solo los administradores pueden acceder al sistema.",
                "type" => "students_not_allowed"
            ));
        } else {
            http_response_code(401);
            echo json_encode(array(
                "success" => false, 
                "message" => "Email o contraseña incorrectos",
                "type" => "invalid_credentials"
            ));
        }
    } else {
        http_response_code(401);
        echo json_encode(array(
            "success" => false, 
            "message" => "Email o contraseña incorrectos",
            "type" => "invalid_credentials"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false, 
        "message" => "Datos incompletos",
        "type" => "incomplete_data"
    ));
}
?>