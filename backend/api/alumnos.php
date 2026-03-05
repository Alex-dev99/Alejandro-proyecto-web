<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(0);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function handleException($e, $message = "Error en el servidor") {
    error_log("ERROR en alumnos.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    sendJsonResponse([
        "success" => false,
        "message" => $message
    ], 500);
}

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $id = $_GET['id'];
                $query = "SELECT * FROM alumnos WHERE id_alumno = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $id);
            }
            else {
                $query = "SELECT id_alumno, nombre, apellidos, email, curso_actual, materia, 
                                 cuota_mensual, metodo_pago, fecha_alta, activo 
                          FROM alumnos ORDER BY fecha_alta DESC";
                $stmt = $db->prepare($query);
            }

            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendJsonResponse($result);
            break;

        case 'POST':
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
            
            if (empty($data->nombre) || empty($data->email)) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Faltan campos requeridos (nombre, email)"
                ], 400);
            }

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

            $apellidos = isset($data->apellidos) ? $data->apellidos : '';
            $curso_actual = isset($data->curso_actual) ? $data->curso_actual : '';
            $materia = isset($data->materia) ? $data->materia : '';
            $cuota_mensual = isset($data->cuota_mensual) ? $data->cuota_mensual : 0;
            $metodo_pago = isset($data->metodo_pago) ? $data->metodo_pago : '';
            $activo = isset($data->activo) ? ($data->activo ? 1 : 0) : 1;
            
            $stmt->bindParam(':nombre', $data->nombre);
            $stmt->bindParam(':apellidos', $apellidos);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':curso_actual', $curso_actual);
            $stmt->bindParam(':materia', $materia);
            $stmt->bindParam(':cuota_mensual', $cuota_mensual);
            $stmt->bindParam(':metodo_pago', $metodo_pago);
            $stmt->bindParam(':activo', $activo);

            $password_raw = isset($data->password) ? $data->password : 'default123';
            $password_hash = password_hash($password_raw, PASSWORD_DEFAULT);
            $stmt->bindParam(':password', $password_hash);

            if ($stmt->execute()) {
                $lastId = $db->lastInsertId();
                sendJsonResponse([
                    "success" => true,
                    "message" => "Alumno creado correctamente",
                    "id_alumno" => $lastId
                ]);
            } else {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Error al crear alumno"
                ], 500);
            }
            break;

        case 'PUT':
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "ID de alumno requerido"
                ], 400);
            }
            
            $id = $_GET['id'];
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
            
            // Verificar que el alumno existe
            $checkQuery = "SELECT id_alumno FROM alumnos WHERE id_alumno = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() == 0) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Alumno no encontrado"
                ], 404);
            }

            $updateFields = [];
            $params = [':id' => $id];

            if (isset($data->nombre)) {
                $updateFields[] = "nombre = :nombre";
                $params[':nombre'] = $data->nombre;
            }
            
            if (isset($data->apellidos)) {
                $updateFields[] = "apellidos = :apellidos";
                $params[':apellidos'] = $data->apellidos;
            }
            
            if (isset($data->email)) {
                $updateFields[] = "email = :email";
                $params[':email'] = $data->email;
            }
            
            if (isset($data->curso_actual)) {
                $updateFields[] = "curso_actual = :curso_actual";
                $params[':curso_actual'] = $data->curso_actual;
            }
            
            if (isset($data->materia)) {
                $updateFields[] = "materia = :materia";
                $params[':materia'] = $data->materia;
            }
            
            if (isset($data->cuota_mensual)) {
                $updateFields[] = "cuota_mensual = :cuota_mensual";
                $params[':cuota_mensual'] = $data->cuota_mensual;
            }
            
            if (isset($data->metodo_pago)) {
                $updateFields[] = "metodo_pago = :metodo_pago";
                $params[':metodo_pago'] = $data->metodo_pago;
            }
            
            if (isset($data->activo)) {
                $updateFields[] = "activo = :activo";
                $params[':activo'] = $data->activo ? 1 : 0;
            }
            
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
            
            $query = "UPDATE alumnos SET " . implode(', ', $updateFields) . " WHERE id_alumno = :id";
            $stmt = $db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            if ($stmt->execute()) {
                sendJsonResponse([
                    "success" => true,
                    "message" => "Alumno actualizado correctamente"
                ]);
            } else {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Error al actualizar alumno"
                ], 500);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "ID de alumno requerido"
                ], 400);
            }
            
            $id = $_GET['id'];
            
            // Verificar que el alumno existe
            $checkQuery = "SELECT id_alumno FROM alumnos WHERE id_alumno = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() == 0) {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Alumno no encontrado"
                ], 404);
            }
            
            $query = "DELETE FROM alumnos WHERE id_alumno = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                sendJsonResponse([
                    "success" => true,
                    "message" => "Alumno eliminado correctamente"
                ]);
            } else {
                sendJsonResponse([
                    "success" => false,
                    "message" => "Error al eliminar alumno"
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
    handleException($e, "Error en la base de datos");
} catch (Exception $e) {
    handleException($e, "Error en el servidor");
}
?>