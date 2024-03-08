<?php

declare(strict_types=1);

const Q_NO_OF_UPDATES = 50000;
#q_create_table();
#die;

echo "<pre>";

$host = ':/var/run/mysqld/mysqld.sock';
$user = 'alex';
$db = 'alex';
$password = null;

/*$db = new MySQLi('localhost', 'kamil', '***', '', 0, 
                              '/var/run/mysqld/mysqld.sock')
*/

$conn = new mysqli('localhost', $user, $password, $db, 0, '/var/run/mysqld/mysqld.sock');
# var_dump($conn->error, $conn->errno, $conn->connect_errno, $conn->connect_error);

# now a select test ?!
$t1 = microtime(true);
/*$conn->query("BEGIN;");
foreach ($queries as $q)
{
	$rc = $conn->query($q);
	if (!$rc)
		throw new \Exception($conn->error);	
}
$conn->query("COMMIT;");*/
# INSERT INTO `test_table` (data_1,data_2,data_3,data_4,data_5,data_6,data_7,data_8,data_9,data_10,data_11,data_12,data_13,data_14,data_15,data_16) VALUES

$data = [];

/*
$stmt = $conn->prepare("SELECT data_1,data_2,data_3,data_4,data_5,data_6,data_7,data_8,data_9,data_10,data_11,data_12,data_13,data_14,data_15,data_16 FROM test_table WHERE id=?");

for ($i = 1; $i < Q_NO_OF_UPDATES; $i++)
{
	$id = random_int(10000, 40000);
	$stmt->bind_param("i", $id);
	$res = $stmt->execute();
	
	if (!$res)
		throw new \Exception($conn->error);
	
	$stmt->bind_result($data_1, $data_2, $data_3, $data_4, $data_5, $data_6, $data_7, $data_8, $data_9, $data_10, $data_11, $data_12, $data_13, $data_14, $data_15, $data_16);
	
	$rc = $stmt->fetch();
	if (!$rc)
		throw new \Exception($conn->error);
	# $res->free();
}
*/

for ($i = 1; $i < Q_NO_OF_UPDATES; $i++)
{
	$ids = [];
	for ($k = 0; ($k < 2000) AND ($i < Q_NO_OF_UPDATES); $k++, $i++)
	{
		$ids[] = random_int(10000, 40000);
	}
	$res = $conn->query("SELECT SQL_NO_CACHE data_1,data_2,data_3,data_4,data_5,data_6,data_7,data_8,data_9,data_10,data_11,data_12,data_13,data_14,data_15,data_16 
					FROM test_table WHERE id IN (".implode(",", $ids).");");
	
	if (!$res)
		throw new \Exception($conn->error);
	$data = [];
	while (($row = $res->fetch_row()))
		$data[] = $row;
	$res->free();
}

$t2 = microtime(true);
echo (Q_NO_OF_UPDATES/($t2 - $t1)), " ops/sec";
die;

$uid = uniqid("", true);

# $queries = q_get_update_queries($uid);
$queries = q_get_insert_queries($uid);

$t1 = microtime(true);
$conn->query("BEGIN;");
foreach ($queries as $q)
{
	$rc = $conn->query($q);
	if (!$rc)
		throw new \Exception($conn->error);	
}
$conn->query("COMMIT;");
$t2 = microtime(true);

# Q_NO_OF_UPDATES / sec

# Q_NO_OF_UPDATES ... ($t2 - $t1)
# ?				  ... 1

echo (Q_NO_OF_UPDATES/($t2 - $t1)), " ops/sec";

# 13.000 updates/sec

# die("<pre>notes only");


function q_create_table()
{
	$cols_str = [];
	for ($i = 1; $i <= 16; $i++)
		$cols_str[] = "data_{$i} VARCHAR(255) NOT NULL";

	$create_table_stmt = "CREATE TABLE IF NOT EXISTS `test_table` (
	   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	   ".implode(",\n", $cols_str)."
	) ENGINE=InnoDB;";
	
	var_dump($create_table_stmt);
}

function q_get_insert_queries(string $uid)
{
	$q = [];
	
	for ($i = 0; $i < Q_NO_OF_UPDATES; $i++)
	{
		$insert_str = "INSERT INTO `test_table` (data_1,data_2,data_3,data_4,data_5,data_6,data_7,data_8,data_9,data_10,data_11,data_12,data_13,data_14,data_15,data_16) VALUES ";
	
		for ($k = 0; ($k < 2000) AND ($i < Q_NO_OF_UPDATES); $k++, $i++)
		{
			$insert_str .= ($k > 0 ? ',' : '')."\n('{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}')";
		}

		$insert_str .= ";";

		/*
		$insert_str = "INSERT INTO `test_table` (data_1,data_2,data_3,data_4,data_5,data_6,data_7,data_8,data_9,data_10,data_11,data_12,data_13,data_14,data_15,data_16) VALUES ('".

	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."','".
	uniqid("", true)."');";
		*/
		
		$q[] = $insert_str;
	}
	
	return $q;
}

function q_get_update_queries(string $uid)
{
	$q = [];
	
	for ($i = 0; $i < Q_NO_OF_UPDATES; $i++)
	{
		
	$update_str = "INSERT INTO `test_table` (id,data_1,data_2,data_3,data_4,data_5,data_6,data_7,data_8,data_9,data_10,data_11,data_12,data_13,data_14,data_15,data_16) VALUES ";
	
	for ($k = 0; ($k < 256) AND ($i < Q_NO_OF_UPDATES); $k++, $i++)
	{
		$update_str .= ($k > 0 ? ',' : '')."\n(".($i + 10000).",'{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}')";
	}
	
	$update_str .= "\n ON DUPLICATE KEY UPDATE 
data_1=VALUES(data_1),data_2=VALUES(data_2),data_3=VALUES(data_3),data_4=VALUES(data_4), 
data_5=VALUES(data_5),data_6=VALUES(data_6),data_7=VALUES(data_7),data_8=VALUES(data_8), 
data_9=VALUES(data_9),data_10=VALUES(data_10),data_11=VALUES(data_11),data_12=VALUES(data_12), 
data_13=VALUES(data_13),data_14=VALUES(data_14),data_15=VALUES(data_15),data_16=VALUES(data_16);
";
	
	/*
	$update_str = "UPDATE `test_table` SET data_1='".
		$uid."',data_2='".
		$uid."',data_3='".
		$uid."',data_4='".
		$uid."',data_5='".
		$uid."',data_6='".
		$uid."',data_7='".
		$uid."',data_8='".
		$uid."',data_9='".
		$uid."',data_10='".
		$uid."',data_11='".
		$uid."',data_12='".
		$uid."',data_13='".
		$uid."',data_14='".
		$uid."',data_15='".
		$uid."',data_16='".
		$uid."' WHERE `id`='".($i + 10000)."';";
		*/
		$q[] = $update_str;
	}
	
	return $q;
}

