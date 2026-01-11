<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host = "localhost";
    private $db_name = "academia";
    private $username = "root";      
    private $password = "";          
    public $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
            
        } catch(PDOException $exception) {
            $errorResponse = array(
                "success" => false,
                "message" => "Error de conexión a la base de datos",
                "error" => $exception->getMessage()
            );
            echo json_encode($errorResponse);
            exit();
        }
        
        return $this->conn;
    }
}

function handleError($message, $code = 500) {
    http_response_code($code);
    echo json_encode(array(
        "success" => false,
        "message" => $message,
        "timestamp" => date('Y-m-d H:i:s')
    ));
    exit();
}

function validateRequiredFields($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (empty($data->$field)) {
            handleError("El campo '$field' es requerido", 400);
        }
    }
    return true;
}
?>