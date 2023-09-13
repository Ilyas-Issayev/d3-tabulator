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
$microsoftSqlConnection = connectToHoltenWebPortal();

// $database = "cdwdzztctx";
// $username = "cdwdzztctx";
// $password = "CwBTc4G2gW";
// $mysqli = new mysqli("localhost", $username, $password, $database);
// // Check connection
// if ($mysqli->connect_error) {
//     die("Connection failed: " . $mysqli->connect_error);
// }

// $sqlExp = "SELECT * FROM store_coordinates";
// $resultExp = mysqli_query($mysqli,$sqlExp);
// $data = $resultExp->fetch_all(MYSQLI_ASSOC);
// $store_coordinates = [];
// foreach($data as $row){

//     $data['store_name'] = [
//       "longitude" => $row['longitude'],
//       "latitude" => $row['latitude']
//     ];
// }

$today = date("Y-m-d");
$current_year = $current_year = date("Y");
$previous_year = date("Y") - 1;
$next_year = date("Y") + 1;

$query = "SELECT
            ArCustomerName,
            Sum(
              CASE WHEN (year(InvoiceDate) = '$previous_year'
                AND MONTH(InvoiceDate) > 7)
                or(year(InvoiceDate) = '$current_year'
                  AND MONTH(InvoiceDate) < 8) THEN
                SaleAmountCDN
              ELSE
                0
              END) AS 'LFY_SUMMARY',
            Sum(
              CASE WHEN (year(InvoiceDate) = '$current_year'
                AND MONTH(InvoiceDate) > 7)
                or(year(InvoiceDate) = '$next_year'
                  AND MONTH(InvoiceDate) < 8) THEN
                SaleAmountCDN
              ELSE
                0
              END) AS 'TFY_SUMMARY',
            Sum(
              CASE WHEN dateadd (year, - 1, '$today') < InvoiceDate
                AND '$today' > InvoiceDate THEN
                SaleAmountCDN
              ELSE
                0
              END) AS 'LY_SUMMARY',
            Sum(
              CASE WHEN month(dateadd (MONTH, - 1, '$today')) = Month(InvoiceDate)
                AND year(dateadd (MONTH, - 1, '$today')) = Year(InvoiceDate) THEN
                SaleAmountCDN
              ELSE
                0
              END) AS 'LM_SUMMARY' FROM [HoltenWebPortal].[dbo].[vw2001SalesDataH]
            WHERE
            ArSalesperson != 'HSE'
            GROUP BY
            [HoltenWebPortal].[dbo].[vw2001SalesDataH].ArCustomerName";

$request = sqlsrv_query($microsoftSqlConnection, $query);

$result = [];

if ($request) {
  while ($row = sqlsrv_fetch_array($request, SQLSRV_FETCH_NUMERIC)) {
    $store = $row["ArCustomerName"];
    $coordinates = $store_coordinates[$store];
    array_push($result, [
      "store_name" => $row["ArCustomerName"],
      "lfy_sum" => $row["LFY_SUMMARY"], //LAST FINANCIAL YEAR SUMMARY
      "tfy_sum" => $row["TFY_SUMMARY"], //THIS FINANCIAL YEAR SUMMARY
      "ly_sum" => $row["LY_SUMMARY"],   //LAST YEAR SUMMARY
      "lm_sum" => $row["LM_SUMMARY"],   //LAST MONTH SUMMARY
      //   // "latitude" => $coordinates["latitude"],
      //   // "latitude" => $coordinates["latitude"],
    ]);
  }
  echo json_encode($result);
} else {
  if (($errors = sqlsrv_errors()) != null) {
    foreach ($errors as $error) {
      echo "SQLSTATE: " . $error['SQLSTATE'] . "<br />";
      echo "Код: " . $error['code'] . "<br />";
      echo "Сообщение: " . $error['message'] . "<br />";
    }
  }
}
