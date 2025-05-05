<?php
require_once 'db_connect.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// Fonction bech nloggu el errors w el debug info
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => 'OPTIONS request handled']);
    exit;
}

// LOG MT3 CHAT ll error 
function debugLog($message) {
    file_put_contents('debug.log', date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
}
// Nrecupériw el méthode mta3 el request 
$request_method = $_SERVER['REQUEST_METHOD'];
// Nrecupériw l''url
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_segments = explode('/', trim($uri, '/'));
$resource = end($uri_segments);
// Nrecupériw les paramètres GET (id category w fazet)
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$category = isset($_GET['category']) ? $_GET['category'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;
// POST Request - Ajout d'un nouveau waste entry
if ($request_method === 'POST') {
     // Nrecupériw les données mta3 el request
    $data = json_decode(file_get_contents('php://input'), true);
    // verif el données
    if (!$data || !isset($data['user_id']) || !isset($data['waste_type_id']) || !isset($data['waste_category'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }
    // Traitement mta3 el location
    $location_id = $data['location_id'];
    // Nvérifiw ken el location existe déja
    if ($location_id === 'new' && isset($data['location_name']) && !empty($data['location_name'])) {
        $stmt = $pdo->prepare("SELECT location_id FROM locations WHERE location_name = :location_name");
        $stmt->execute(['location_name' => $data['location_name']]);
        $existing_location = $stmt->fetch();

        if ($existing_location) {
            $location_id = $existing_location['location_id'];
        } else {
            // N'insériw nouvelle location
            $stmt = $pdo->prepare("INSERT INTO locations (location_name) VALUES (:location_name)");
            $stmt->execute(['location_name' => $data['location_name']]);
            $location_id = $pdo->lastInsertId();
        }
    }
    // Nvérifiw ken el location valide
    if (!$location_id || $location_id === 'new') {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid location']);
        exit;
    }
 // insert  el waste entry jdida
    $stmt = $pdo->prepare("INSERT INTO waste_entries (user_id, waste_type_id, location_id, quantity, date, waste_category, household_waste, non_household_waste, controlled_facility, status, submission_date, waste_subtype) VALUES (:user_id, :waste_type_id, :location_id, :quantity, :date, :waste_category, :household_waste, :non_household_waste, :controlled_facility, 'Submitted', NOW(), :waste_subtype)");
    $stmt->execute([
        'user_id' => $data['user_id'],
        'waste_type_id' => $data['waste_type_id'],
        'location_id' => $location_id,
        'quantity' => $data['quantity'],
        'date' => $data['date'],
        'waste_category' => $data['waste_category'],
        'household_waste' => $data['household_waste'] ?? null,
        'non_household_waste' => $data['non_household_waste'] ?? null,
        'controlled_facility' => isset($data['controlled_facility']) ? (int)$data['controlled_facility'] : 0,
        'waste_subtype' => $data['waste_subtype'] ?? null
    ]);
    echo json_encode(['message' => 'Entry added successfully']);
}
// l prepeate 3al SQL IJNECTION TANASAHECH (a3ml tala 3al document)!!!!!!!
// REc waste entries b get 
elseif ($request_method === 'GET') {
    // Ken fama category w status spécifiés
    if ($category && $status) {
        if ($category === 'normal') {
            // Récupération des entries household w non_household§!!!!!!!!
            $stmt = $pdo->prepare("SELECT * FROM waste_entries WHERE waste_category IN ('household', 'non_household') AND status = :status");
        } else {
            // Récupération selon category spécifique
            $stmt = $pdo->prepare("SELECT * FROM waste_entries WHERE waste_category = :category AND status = :status");
            $stmt->bindParam(':category', $category);
        }
        // Mapping mta3 el status (pending -> Submitted)
        $mappedStatus = $status === 'pending' ? 'Submitted' : 'Approved';
        $stmt->bindParam(':status', $mappedStatus);
        $stmt->execute();
        $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 3adi requete w result ll log
        debugLog("GET Request - Category: $category, Status: $status, Mapped Status: $mappedStatus");
        debugLog("Entries Fetched: " . json_encode($entries));
    } else {
        $stmt = $pdo->prepare("SELECT * FROM waste_entries WHERE status = 'Submitted'");
        $stmt->execute();
        $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 3adi requete w result ll log 2!!
        debugLog("GET Request - Default Query (Submitted)");
        debugLog("Entries Fetched: " . json_encode($entries));
    }
    echo json_encode($entries);
}
// PUT req - modifi waste entry
elseif ($request_method === 'PUT' && $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }
// Préparation des champs à modifier(best practices doc)!!!!!!
// Préparation des champs

    $fields = [];
    $params = ['id' => $id];
     // Ken fama modification de status
    if (isset($data['status'])) {
        $fields[] = 'status = :status';
        $fields[] = 'validator_id = :validator_id';
        $fields[] = 'validation_date = :validation_date';
        $params['status'] = $data['status'];
        $params['validator_id'] = $data['validator_id'];
        $params['validation_date'] = date('Y-m-d H:i:s');
    }
     // Modification de quantity
    if (isset($data['quantity'])) {
        $fields[] = 'quantity = :quantity';
        $params['quantity'] = $data['quantity'];
    }
     // Modification de date
    if (isset($data['date'])) {
        $fields[] = 'date = :date';
        $params['date'] = $data['date'];
    }
     // Modification de waste category
    if (isset($data['waste_category'])) {
        $fields[] = 'waste_category = :waste_category';
        $params['waste_category'] = $data['waste_category'];
    }
     // Modification household
    if (isset($data['household_waste'])) {
        $fields[] = 'household_waste = :household_waste';
        $params['household_waste'] = $data['household_waste'];
    }
    if (isset($data['non_household_waste'])) {
        $fields[] = 'non_household_waste = :non_household_waste';
        $params['non_household_waste'] = $data['non_household_waste'];
    }
    // modif control facitly 
    if (isset($data['controlled_facility'])) {
        $fields[] = 'controlled_facility = :controlled_facility';
        $params['controlled_facility'] = (int)$data['controlled_facility'];
    }
    //modif detailles l waste
    if (isset($data['waste_subtype'])) {
        $fields[] = 'waste_subtype = :waste_subtype';
        $params['waste_subtype'] = $data['waste_subtype'];
    }
  // Ken mafama champs à modifier (json)
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit;
    }
    // Exécution de la requête de modification
    $query = "UPDATE waste_entries SET " . implode(', ', $fields) . " WHERE waste_entry_id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    echo json_encode(['message' => 'Entry updated successfully']);
}
// DELd'un waste entry
elseif ($request_method === 'DELETE' && $id) {
    $stmt = $pdo->prepare("DELETE FROM waste_entries WHERE waste_entry_id = :id");
    $stmt->execute(['id' => $id]);
    echo json_encode(['message' => 'Entry deleted successfully']);
}
// ken method 8alta wla famch
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>