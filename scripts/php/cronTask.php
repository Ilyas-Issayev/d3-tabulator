<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function connectToHoltenWebPortal()
{
    $serverName = "72.142.144.48,1433\MSSQLSERVER"; //serverName\instanceName
    $connectionInfo = array("Database" => "HoltenWebPortal", "UID" => "webadmin", "PWD" => "Improve9-femur1-emits");
    $connection = sqlsrv_connect($serverName, $connectionInfo);
    return $connection;
}

$database = "cdwdzztctx";
$username = "cdwdzztctx";
$password = "CwBTc4G2gW";

$mysqli = new mysqli("localhost", $username, $password, $database);

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}


$microsoftSqlConnection = connectToHoltenWebPortal();
$request = sqlsrv_query($microsoftSqlConnection, "SELECT InvoiceDateChar,TrnBranch,TrnBranchName,TrnSalespersonName,StockCode,TrnProductClassDescription,SaleAmountCDN,CostAmtCDN,ArCustomerName,SupplierName,Series,ArSalesperson FROM vw2001SalesDataH");

$array = [];

if ($request) {
    while ($row = sqlsrv_fetch_array($request, SQLSRV_FETCH_NUMERIC)) {
        array_push($array, $row);
    }
} else {
    if (($errors = sqlsrv_errors()) != null) {
        foreach ($errors as $error) {
            echo "SQLSTATE: " . $error['SQLSTATE'] . "<br />";
            echo "Код: " . $error['code'] . "<br />";
            echo "Сообщение: " . $error['message'] . "<br />";
        }
    }
}

// Define the file path and name
$filePath = $_SERVER['DOCUMENT_ROOT'] . 'analytics/newAnalytic/mainData.csv';

// Open the file in write mode
$file = fopen($filePath, 'w');

$delimiter = '|';

// Write the column headers to the CSV file
$headers = array('InvoiceDateChar', 'TrnBranch', 'TrnBranchName', 'TrnSalespersonName', 'StockCode', 'TrnProductClassDescription', 'SaleAmountCDN', 'CostAmtCDN', 'ArCustomerName', 'SupplierName', 'Series', 'ArSalesperson');
fputcsv($file, $headers, $delimiter);

// Write data rows to the CSV file
foreach ($array as $row) {
    $assocRow = array_values($row); // Convert the associative array to a numeric array
    fputcsv($file, $assocRow, $delimiter);
}

// Close the file
fclose($file);

// Output a success message
echo 'CSV file created successfully at: ' . $filePath;
