
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

$storeName = $_POST['storeName'];
$note = $_POST['note'];

$sql = "INSERT INTO notes (uid,store_name,note) VALUES ('$uid','$storeName','$note')";

if ($connection->query($sql) === TRUE) {
    echo 'record successfully created';
} else {
    echo "Error" . $sql . "<br>" . $connection->error;
}

echo json_encode($uid);
?>