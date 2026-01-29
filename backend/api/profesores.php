<?php
// ESTO DEBE ESTAR AL PRINCIPIO DEL ARCHIVO - SIN ESPACIOS NI SALTOS ANTES
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=UTF-8');

// Para desarrollo - mejor activar los errores para ver qué pasa
ini_set('display_errors', 0);
error_reporting(0);

require_once '../config/database.php';

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Obtener el ID de la URL si existe
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        try {
            if ($id) {
                $query = "SELECT * FROM profesores WHERE id_profesor = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$result) {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Profesor no encontrado"]);
                } else {
                    echo json_encode($result);
                }
            } else {
                $query = "SELECT id_profesor, nombre, apellidos, alias, fecha_nacimiento, 
                                 materias_imparte, email, cuenta_bancaria, activo, administrador 
                          FROM profesores ORDER BY nombre";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($result);
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al obtener profesores",
                "error" => $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        try {
            $input = file_get_contents("php://input");
            $data = json_decode($input);
            
            if (!$data) {
                throw new Exception("Datos JSON inválidos");
            }
            
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
            
            $password = isset($data->password) ? password_hash($data->password, PASSWORD_DEFAULT) : password_hash('default123', PASSWORD_DEFAULT);
            $stmt->bindParam(':password', $password);
            
            if ($stmt->execute()) {
                $lastId = $db->lastInsertId();
                echo json_encode([
                    "success" => true,
                    "message" => "Profesor creado",
                    "id_profesor" => $lastId
                ]);
            } else {
                throw new Exception("Error al ejecutar la consulta");
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al crear profesor",
                "error" => $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        try {
            // Primero verificar si tenemos ID
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID de profesor requerido"]);
                exit();
            }
            
            $input = file_get_contents("php://input");
            $data = json_decode($input);
            
            if (!$data) {
                throw new Exception("Datos JSON inválidos. Error: " . json_last_error_msg());
            }
            
            // Verificar que el profesor existe
            $checkQuery = "SELECT id_profesor FROM profesores WHERE id_profesor = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Profesor no encontrado"]);
                exit();
            }
            
            // Construir la consulta UPDATE dinámicamente
            $updateFields = [];
            $params = [];
            
            $fields = [
                'nombre' => 'nombre',
                'apellidos' => 'apellidos',
                'alias' => 'alias',
                'fecha_nacimiento' => 'fecha_nacimiento',
                'materias_imparte' => 'materias_imparte',
                'email' => 'email',
                'cuenta_bancaria' => 'cuenta_bancaria',
                'administrador' => 'administrador',
                'activo' => 'activo'
            ];
            
            foreach ($fields as $field => $dbField) {
                if (isset($data->$field)) {
                    $updateFields[] = "$dbField = :$field";
                    $params[":$field"] = $data->$field;
                }
            }
            
            // Si se envía password, actualizarlo
            if (isset($data->password) && !empty($data->password)) {
                $updateFields[] = "password = :password";
                $params[':password'] = password_hash($data->password, PASSWORD_DEFAULT);
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "No hay datos para actualizar"]);
                exit();
            }
            
            $query = "UPDATE profesores SET " . implode(', ', $updateFields) . " WHERE id_profesor = :id";
            $params[':id'] = $id;
            
            $stmt = $db->prepare($query);
            
            // Bind de todos los parámetros
            foreach ($params as $key => $value) {
                // Convertir booleano a entero para administrador y activo
                if ($key === ':administrador' || $key === ':activo') {
                    $value = $value ? 1 : 0;
                }
                $stmt->bindValue($key, $value);
            }
            
            if ($stmt->execute()) {
                $affectedRows = $stmt->rowCount();
                echo json_encode([
                    "success" => true,
                    "message" => "Profesor actualizado",
                    "affected_rows" => $affectedRows
                ]);
            } else {
                throw new Exception("Error al ejecutar la actualización");
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al actualizar profesor",
                "error" => $e->getMessage(),
                "trace" => $e->getTraceAsString()
            ]);
        }
        break;
        
    case 'DELETE':
        try {
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID de profesor requerido"]);
                exit();
            }
            
            $query = "DELETE FROM profesores WHERE id_profesor = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                $affectedRows = $stmt->rowCount();
                if ($affectedRows > 0) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Profesor eliminado",
                        "affected_rows" => $affectedRows
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Profesor no encontrado"]);
                }
            } else {
                throw new Exception("Error al eliminar profesor");
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al eliminar profesor",
                "error" => $e->getMessage()
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
        break;
}
?>