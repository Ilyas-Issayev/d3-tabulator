<?php
ini_set("display_errors", 1);
ini_set('error_reporting', E_ALL);

include $_SERVER['DOCUMENT_ROOT']."php/phpauth/Config.php";
include $_SERVER['DOCUMENT_ROOT']."php/phpauth/Auth.php";
include $_SERVER['DOCUMENT_ROOT']."expenses_app/api/config/Database.php";

include $_SERVER['DOCUMENT_ROOT']."mysql_conn.php";
$config = new PHPAuth\Config($dbh);
$auth = new PHPAuth\Auth($dbh, $config);

$uid = $auth->getCurrentUser()["uid"];

$sql = "SELECT * FROM notes WHERE uid = $uid";
$result = mysqli_query($connection, $sql);
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($data);