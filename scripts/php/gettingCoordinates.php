<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

include $_SERVER['DOCUMENT_ROOT']."php/phpauth/Config.php";
include $_SERVER['DOCUMENT_ROOT']."php/phpauth/Auth.php";

include $_SERVER['DOCUMENT_ROOT']."expenses_app/api/config/Database.php";

include $_SERVER['DOCUMENT_ROOT']."mysql_conn.php";
$config = new PHPAuth\Config($dbh);
$auth = new PHPAuth\Auth($dbh, $config);

//get categories
$sql = "SELECT * FROM store_coordinates";
$result = mysqli_query($connection,$sql);
$coordinatesData = $result->fetch_all(MYSQLI_ASSOC); 

// Sanitize the data to ensure valid UTF-8 encoding
foreach ($coordinatesData as &$row) {
    foreach ($row as &$value) {
        $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
    }
}

// Encode the sanitized data as JSON
$jsonData = json_encode($coordinatesData, JSON_UNESCAPED_UNICODE);

if ($jsonData === false) {
    http_response_code(500); // Set an appropriate HTTP status code for internal server error
    echo json_encode(array('error' => 'JSON encoding error: ' . json_last_error_msg()));
} else {
    echo $jsonData;
}