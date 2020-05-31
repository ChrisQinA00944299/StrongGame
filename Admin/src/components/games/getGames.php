<?php
$mysqli = new mysqli("mysql", "strong_bcit", "vt5eQ#3DuVq>>/7c-", "strong_dev");
if($mysqli->connect_error) {
  exit('Could not connect');
}

$sql = "SELECT ID, guid, title, description, questions, teams, timings,
date_created, date_updated, form_items, userID, themeID FROM games WHERE ID = ?";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("s", $_GET['q']);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($ID, $guid, $title, $description, $questions, $teams, $timings,
  $date_created, $date_updated, $form_items, $userID, $themeID);
$stmt->fetch();
$stmt->close();

echo "<table>";
echo "<tr>";
echo "<th>Game ID</th>";
echo "<td>" . $ID . "</td>";
echo "<th>Guid</th>";
echo "<td>" . $guid . "</td>";
echo "<th>Title</th>";
echo "<td>" . $title . "</td>";
echo "<th>Description</th>";
echo "<td>" . $description . "</td>";
echo "<th>Questions</th>";
echo "<td>" . $questions . "</td>";
echo "<th>Teams</th>";
echo "<td>" . $teams . "</td>";
echo "<th>Timings</th>";
echo "<td>" . $timings . "</td>";
echo "<th>Date Created</th>";
echo "<td>" . $date_created . "</td>";
echo "<th>Date Updated</th>";
echo "<td>" . $date_updated . "</td>";
echo "<th>Form Items</th>";
echo "<td>" . $form_items . "</td>";
echo "<th>User ID</th>";
echo "<td>" . $userID . "</td>";
echo "<th>Theme ID</th>";
echo "<td>" . $themeID . "</td>";
echo "</tr>";
echo "</table>";
?>
