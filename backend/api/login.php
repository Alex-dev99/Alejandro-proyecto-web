<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id_profesor as id, nombre, email, 'PROFESOR' as rol, administrador 
              FROM profesores 
              WHERE email = :email AND password = :password AND activo = 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':password', $data->password);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
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
    }
    
    $query = "SELECT id_alumno as id, nombre, email, 'ALUMNO' as rol 
              FROM alumnos 
              WHERE email = :email AND password = :password AND activo = 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':password', $data->password);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $response = array(
            "success" => true,
            "message" => "Login exitoso",
            "usuario" => array(
                "id" => $row['id'],
                "nombre" => $row['nombre'],
                "email" => $row['email'],
                "rol" => $row['rol'],
                "administrador" => false
            )
        );
        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Credenciales incorrectas"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Datos incompletos"));
}
?>