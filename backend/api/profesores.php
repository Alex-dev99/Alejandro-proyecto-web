<?php
// === IMPORTANTE: NO DEBE HABER NADA ANTES DE ESTA LÍNEA ===
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=UTF-8');

// Configuración de errores - IMPORTANTE para evitar output no deseado
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(0);

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

// Función para enviar respuesta JSON consistente
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Función para manejar excepciones
function handleException($e, $message = "Error en el servidor") {
    error_log("ERROR en profesores.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    sendJsonResponse([
        "success" => false,
        "message" => $message
    ], 500);
}

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener un profesor específico
                $query = "SELECT id_profesor, nombre, apellidos, alias, fecha_nacimiento, 
                                 materias_imparte, email, cuenta_bancaria, activo, administrador 
                          FROM profesores WHERE id_profesor = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                
                if ($stmt->rowCount() > 0) {
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);
                    sendJsonResponse($result);
                } else {
                    sendJsonResponse([
                        "success" => false,
                        "message" => "Profesor no encontrado"
                    ], 404);
                }
            } else {
                // Obtener todos los profesores
                $query = "SELECT id_profesor, nombre, apellidos, alias, fecha_nacimiento, 
                                 materias_imparte, email, cuenta_bancaria, activo, administrador 
                          FROM profesores ORDER BY nombre";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                sendJsonResponse($results);
            }
            break;
            
        case 'POST':
            // Crear nuevo profesor
            $input = file_get_contents("php://input");
            
            if (empty($input)) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "No se recibieron datos"
                ], 400);
            }
            
            $data = json_decode($input);
            
            if (!$data) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "JSON inválido"
                ], 400);
            }
            
            // Validar campos requeridos
            if (empty($data->nombre) || empty($data->email) || empty($data->password)) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Faltan campos requeridos (nombre, email, password)"
                ], 400);
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
            
            // Valores por defecto
            $apellidos = isset($data->apellidos) ? $data->apellidos : '';
            $alias = isset($data->alias) ? $data->alias : $data->nombre;
            $fecha_nacimiento = isset($data->fecha_nacimiento) ? $data->fecha_nacimiento : null;
            $materias_imparte = isset($data->materias_imparte) ? $data->materias_imparte : '';
            $cuenta_bancaria = isset($data->cuenta_bancaria) ? $data->cuenta_bancaria : '';
            $administrador = isset($data->administrador) ? ($data->administrador ? 1 : 0) : 0;
            $activo = isset($data->activo) ? ($data->activo ? 1 : 0) : 1;
            
            $stmt->bindParam(':nombre', $data->nombre);
            $stmt->bindParam(':apellidos', $apellidos);
            $stmt->bindParam(':alias', $alias);
            $stmt->bindParam(':fecha_nacimiento', $fecha_nacimiento);
            $stmt->bindParam(':materias_imparte', $materias_imparte);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':cuenta_bancaria', $cuenta_bancaria);
            $stmt->bindParam(':administrador', $administrador);
            $stmt->bindParam(':activo', $activo);
            
            // Hashear password
            $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
            $stmt->bindParam(':password', $password_hash);
            
            if ($stmt->execute()) {
                $lastId = $db->lastInsertId();
                sendJsonResponse([
                    "success" => true,
                    "message" => "Profesor creado correctamente",
                    "id_profesor" => $lastId
                ]);
            } else {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Error al crear profesor"
                ], 500);
            }
            break;
            
        case 'PUT':
            // Actualizar profesor existente
            if (!$id) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "ID de profesor requerido"
                ], 400);
            }
            
            $input = file_get_contents("php://input");
            
            if (empty($input)) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "No se recibieron datos para actualizar"
                ], 400);
            }
            
            $data = json_decode($input);
            
            if (!$data) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "JSON inválido"
                ], 400);
            }
            
            // Verificar que el profesor existe
            $checkQuery = "SELECT id_profesor FROM profesores WHERE id_profesor = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() == 0) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Profesor no encontrado"
                ], 404);
            }
            
            // Construir la consulta UPDATE dinámicamente
            $updateFields = [];
            $params = [':id' => $id];
            
            // Campos que se pueden actualizar
            if (isset($data->nombre)) {
                $updateFields[] = "nombre = :nombre";
                $params[':nombre'] = $data->nombre;
            }
            
            if (isset($data->apellidos)) {
                $updateFields[] = "apellidos = :apellidos";
                $params[':apellidos'] = $data->apellidos;
            }
            
            if (isset($data->alias)) {
                $updateFields[] = "alias = :alias";
                $params[':alias'] = $data->alias;
            }
            
            if (isset($data->fecha_nacimiento)) {
                $updateFields[] = "fecha_nacimiento = :fecha_nacimiento";
                $params[':fecha_nacimiento'] = $data->fecha_nacimiento;
            }
            
            if (isset($data->materias_imparte)) {
                $updateFields[] = "materias_imparte = :materias_imparte";
                $params[':materias_imparte'] = $data->materias_imparte;
            }
            
            if (isset($data->email)) {
                $updateFields[] = "email = :email";
                $params[':email'] = $data->email;
            }
            
            if (isset($data->cuenta_bancaria)) {
                $updateFields[] = "cuenta_bancaria = :cuenta_bancaria";
                $params[':cuenta_bancaria'] = $data->cuenta_bancaria;
            }
            
            if (isset($data->administrador)) {
                $updateFields[] = "administrador = :administrador";
                $params[':administrador'] = $data->administrador ? 1 : 0;
            }
            
            if (isset($data->activo)) {
                $updateFields[] = "activo = :activo";
                $params[':activo'] = $data->activo ? 1 : 0;
            }
            
            // Password opcional (solo si se envía)
            if (isset($data->password) && !empty($data->password)) {
                $updateFields[] = "password = :password";
                $params[':password'] = password_hash($data->password, PASSWORD_DEFAULT);
            }
            
            if (empty($updateFields)) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "No hay datos para actualizar"
                ], 400);
            }
            
            $query = "UPDATE profesores SET " . implode(', ', $updateFields) . " WHERE id_profesor = :id";
            $stmt = $db->prepare($query);
            
            // Bind de todos los parámetros
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            if ($stmt->execute()) {
                $affectedRows = $stmt->rowCount();
                sendJsonResponse([
                    "success" => true,
                    "message" => "Profesor actualizado correctamente",
                    "affected_rows" => $affectedRows
                ]);
            } else {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Error al actualizar profesor"
                ], 500);
            }
            break;
            
        case 'DELETE':
            // Eliminar profesor
            if (!$id) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "ID de profesor requerido"
                ], 400);
            }
            
            // Verificar que existe
            $checkQuery = "SELECT id_profesor FROM profesores WHERE id_profesor = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() == 0) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Profesor no encontrado"
                ], 404);
            }
            
            $query = "DELETE FROM profesores WHERE id_profesor = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                sendJsonResponse([
                    "success" => true,
                    "message" => "Profesor eliminado correctamente"
                ]);
            } else {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Error al eliminar profesor"
                ], 500);
            }
            break;
            
        default:
            sendJsonResponse([
                "success" => false,
                "message" => "Método no permitido"
            ], 405);
            break;
    }
    
} catch (PDOException $e) {
    // Error de base de datos
    handleException($e, "Error de base de datos");
} catch (Exception $e) {
    // Otros errores
    handleException($e, "Error en el servidor");
}

// === IMPORTANTE: NO DEBE HABER NADA DESPUÉS DE ESTA LÍNEA ===
?>