<?php
// ============================================
// UniSync - Backend (MVC Architecture)
// Config + Model + Controller in one file
//
// Study Task Management — Added by: Umama Samiha
//
// REQUIRED SQL — run once:
// CREATE TABLE IF NOT EXISTS users (
//     id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
//     email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
// );
// INSERT IGNORE INTO users (name, email, password)
//   VALUES ('Umama Samiha', 'umamasamiha@gmail.com', MD5('12345678'));
//
// CREATE TABLE IF NOT EXISTS study_tasks (
//     id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL,
//     description TEXT NULL, deadline DATETIME NULL,
//     plan_name VARCHAR(255) NULL, priority ENUM('high','medium','low') DEFAULT 'medium',
//     created_by VARCHAR(100) DEFAULT 'Umama Samiha',
//     is_completed TINYINT(1) DEFAULT 0, completed_at DATETIME NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
// );
//
// If table already exists, add the priority column:
// ALTER TABLE study_tasks ADD COLUMN priority ENUM('high','medium','low') DEFAULT 'medium' AFTER plan_name;
// ============================================

session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// ============================================
// CONFIG
// ============================================
class Database {
    private $host = "localhost"; private $db_name = "unisync";
    private $username = "root"; private $password = ""; private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) { echo json_encode(["error" => "Connection failed: " . $e->getMessage()]); exit; }
        return $this->conn;
    }
}

// ============================================
// MODEL - User
// ============================================
class User {
    private $conn; private $table = "users";
    public function __construct($db) { $this->conn = $db; }

    public function login($email, $password) {
        $stmt = $this->conn->prepare("SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1");
        $stmt->bindParam(":email", $email); $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return ($row && md5($password) === $row['password']) ? $row : false;
    }

    public function signup($name, $email, $password) {
        $check = $this->conn->prepare("SELECT id FROM " . $this->table . " WHERE email = :email LIMIT 1");
        $check->bindParam(":email", $email); $check->execute();
        if ($check->rowCount() > 0) return false;
        $stmt = $this->conn->prepare("INSERT INTO " . $this->table . " (name, email, password, created_at) VALUES (:name, :email, :password, NOW())");
        $hashed = md5($password);
        $stmt->bindParam(":name", $name); $stmt->bindParam(":email", $email); $stmt->bindParam(":password", $hashed);
        return $stmt->execute();
    }
}

// ============================================
// MODEL - Task — Umama Samiha
// ============================================
class Task {
    private $conn; private $table = "study_tasks";
    public $id; public $user_id; public $title; public $description; public $deadline;
    public $plan_name; public $priority = "medium"; public $created_by = "Umama Samiha";
    public $is_completed; public $completed_at;

    public function __construct($db) { $this->conn = $db; }

    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM " . $this->table . " WHERE user_id = :user_id ORDER BY is_completed ASC, FIELD(priority,'high','medium','low'), deadline ASC");
        $stmt->bindParam(":user_id", $this->user_id, PDO::PARAM_INT);
        $stmt->execute(); return $stmt;
    }

    public function getUpcoming() {
        $stmt = $this->conn->prepare("SELECT * FROM " . $this->table . " WHERE user_id = :user_id AND is_completed = 0 AND deadline IS NOT NULL AND deadline >= NOW() ORDER BY deadline ASC");
        $stmt->bindParam(":user_id", $this->user_id, PDO::PARAM_INT);
        $stmt->execute(); return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . "
                    (user_id, title, description, deadline, plan_name, priority, created_by, is_completed, created_at)
                  VALUES (:user_id, :title, :description, :deadline, :plan_name, :priority, :created_by, 0, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id",     $this->user_id, PDO::PARAM_INT);
        $stmt->bindParam(":title",       $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":deadline",    $this->deadline);
        $stmt->bindParam(":plan_name",   $this->plan_name);
        $stmt->bindParam(":priority",    $this->priority);
        $stmt->bindParam(":created_by",  $this->created_by);
        if ($stmt->execute()) { $this->id = $this->conn->lastInsertId(); return true; }
        return false;
    }

    public function toggleComplete() {
        $stmt = $this->conn->prepare("UPDATE " . $this->table . " SET is_completed = NOT is_completed, completed_at = CASE WHEN is_completed = 0 THEN NOW() ELSE NULL END WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(":id",      $this->id,      PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $this->user_id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete() {
        $stmt = $this->conn->prepare("DELETE FROM " . $this->table . " WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(":id",      $this->id,      PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $this->user_id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}

// ============================================
// CONTROLLER
// ============================================
$database  = new Database();
$db        = $database->getConnection();
$task      = new Task($db);
$userModel = new User($db);
$action    = isset($_GET['action']) ? $_GET['action'] : '';

// Inject logged-in user's ID into task model for all task actions
$task->user_id = isset($_SESSION['user']['id']) ? (int)$_SESSION['user']['id'] : 0;

function rowToTask($row) {
    return [
        "id"           => (int) $row['id'],
        "title"        => $row['title'],
        "description"  => $row['description'],
        "deadline"     => $row['deadline'],
        "plan_name"    => isset($row['plan_name'])  ? $row['plan_name']  : null,
        "priority"     => isset($row['priority'])   ? $row['priority']   : 'medium',
        "created_by"   => isset($row['created_by']) ? $row['created_by'] : 'Umama Samiha',
        "is_completed" => (bool) $row['is_completed'],
        "completed_at" => $row['completed_at'],
        "created_at"   => $row['created_at']
    ];
}

switch ($action) {

    case 'login':
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->email) || empty($data->password)) { http_response_code(400); echo json_encode(["status"=>"error","message"=>"Email and password are required."]); break; }
        $result = $userModel->login(trim($data->email), $data->password);
        if ($result) { $_SESSION['user'] = $result; echo json_encode(["status"=>"success","user"=>["id"=>$result['id'],"name"=>$result['name'],"email"=>$result['email']]]); }
        else { http_response_code(401); echo json_encode(["status"=>"error","message"=>"Invalid email or password."]); }
        break;

    case 'signup':
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->name) || empty($data->email) || empty($data->password)) { http_response_code(400); echo json_encode(["status"=>"error","message"=>"All fields are required."]); break; }
        if (strlen($data->password) < 6) { http_response_code(400); echo json_encode(["status"=>"error","message"=>"Password must be at least 6 characters."]); break; }
        $result = $userModel->signup(trim($data->name), trim($data->email), $data->password);
        if ($result) echo json_encode(["status"=>"success","message"=>"Account created! You can now log in."]);
        else { http_response_code(409); echo json_encode(["status"=>"error","message"=>"This email is already registered."]); }
        break;

    case 'logout':
        session_destroy(); echo json_encode(["status"=>"success"]); break;

    case 'list':
        $stmt = $task->getAll(); $tasks = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) $tasks[] = rowToTask($row);
        echo json_encode(["status"=>"success","data"=>$tasks]); break;

    case 'upcoming':
        $stmt = $task->getUpcoming(); $tasks = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) $tasks[] = rowToTask($row);
        echo json_encode(["status"=>"success","data"=>$tasks,"meta"=>["added_by"=>"Umama Samiha"]]); break;

    case 'create':
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->title) || trim($data->title) === '') { http_response_code(400); echo json_encode(["status"=>"error","message"=>"Task title is required."]); break; }
        $task->title       = trim($data->title);
        $task->description = isset($data->description) ? trim($data->description) : null;
        $task->plan_name   = isset($data->plan_name)   ? trim($data->plan_name)   : null;
        $task->priority    = isset($data->priority) && in_array($data->priority, ['high','medium','low']) ? $data->priority : 'medium';
        $task->user_id     = isset($_SESSION['user']['id']) ? (int)$_SESSION['user']['id'] : 0;
        $task->created_by  = isset($_SESSION['user']['name']) ? $_SESSION['user']['name'] : "Umama Samiha";
        $task->deadline    = null;
        if (!empty($data->deadline)) { $ts = strtotime($data->deadline); $task->deadline = $ts ? date('Y-m-d H:i:s', $ts) : null; }
        if ($task->create()) echo json_encode(["status"=>"success","message"=>"Task created.","id"=>$task->id,"created_by"=>"Umama Samiha"]);
        else { http_response_code(500); echo json_encode(["status"=>"error","message"=>"Unable to create task."]); }
        break;

    case 'toggle':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id)) { $task->id = $data->id; echo $task->toggleComplete() ? json_encode(["status"=>"success"]) : (http_response_code(500) && json_encode(["status"=>"error"])); }
        else { http_response_code(400); echo json_encode(["status"=>"error","message"=>"Task ID required."]); }
        break;

    case 'delete':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id)) { $task->id = $data->id; echo $task->delete() ? json_encode(["status"=>"success"]) : (http_response_code(500) && json_encode(["status"=>"error"])); }
        else { http_response_code(400); echo json_encode(["status"=>"error","message"=>"Task ID required."]); }
        break;

    default:
        http_response_code(400);
        echo json_encode(["status"=>"error","message"=>"Invalid action."]);
        break;
}
?>
