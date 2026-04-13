<?php
// ============================================
// UniSync - Backend (MVC Architecture)
// Config + Model + Controller in one file
// ============================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// ============================================
// CONFIG - Database Connection
// ============================================
class Database {
    private $host = "localhost";
    private $db_name = "unisync";
    private $username = "root";
    private $password = "";
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}

// ============================================
// MODEL - Task
// ============================================
class Task {
    private $conn;
    private $table = "study_tasks";

    public $id;
    public $title;
    public $description;
    public $deadline;
    public $is_completed;
    public $completed_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all tasks ordered: pending first, then by deadline
    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY is_completed ASC, deadline ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Toggle task completion status
    public function toggleComplete() {
        $query = "UPDATE " . $this->table . " 
                  SET is_completed = NOT is_completed,
                      completed_at = CASE 
                          WHEN is_completed = 0 THEN NOW() 
                          ELSE NULL 
                      END
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}

// ============================================
// CONTROLLER - Handle Requests
// ============================================
$database = new Database();
$db = $database->getConnection();
$task = new Task($db);

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    // GET: Fetch all tasks
    case 'list':
        $stmt = $task->getAll();
        $tasks = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tasks[] = [
                "id"           => (int) $row['id'],
                "title"        => $row['title'],
                "description"  => $row['description'],
                "deadline"     => $row['deadline'],
                "is_completed" => (bool) $row['is_completed'],
                "completed_at" => $row['completed_at'],
                "created_at"   => $row['created_at']
            ];
        }

        echo json_encode(["status" => "success", "data" => $tasks]);
        break;

    // POST: Toggle task completion
    case 'toggle':
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id)) {
            $task->id = $data->id;

            if ($task->toggleComplete()) {
                echo json_encode([
                    "status"  => "success",
                    "message" => "Task completion status updated."
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    "status"  => "error",
                    "message" => "Unable to update task."
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                "status"  => "error",
                "message" => "Task ID is required."
            ]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Invalid action. Use ?action=list or ?action=toggle"
        ]);
        break;
}
?>
