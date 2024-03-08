<?php

declare(strict_types=1);

# q_create_table();
# die;

$host        = "host = 127.0.0.1";
$port        = "port = 5432";
$dbname      = "dbname = testdb";
$credentials = "user = postgres password=myPassword";

$conn = pg_connect( "$host $port $dbname $credentials"  );
if(!$conn) {
	echo "Error : Unable to open database\n";
} else {
	echo "Opened database successfully\n";
}

$t1 = microtime(true);

$uid = uniqid("", true);

const Q_NO_OF_UPDATES = 20000;

pg_query("BEGIN") or die("Could not start transaction\n");


for ($i = 0; $i < Q_NO_OF_UPDATES; $i++)
{
	/*
	$insert_str = "INSERT INTO test_table (data_1,data_2,data_3,data_4,data_5,data_6,data_7,data_8,data_9,data_10,data_11,data_12,data_13,data_14,data_15,data_16) VALUES ('".

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
		
	$rc = pg_query($insert_str);
	if (!$rc)
		throw new \Exception("INSERT ERROR");
*/
	
	$update_str = "UPDATE test_table as t SET 
data_1=c.c_1,
data_2=c.c_2,
data_3=c.c_3,
data_4=c.c_4,
data_5=c.c_5,
data_6=c.c_6,
data_7=c.c_7,
data_8=c.c_8,
data_9=c.c_9,
data_10=c.c_10,
data_11=c.c_11,
data_12=c.c_12,
data_13=c.c_13,
data_14=c.c_14,
data_15=c.c_15,
data_16=c.c_16

FROM (VALUES \n
";
	
	for ($k = 0; ($k < 200) AND ($i < Q_NO_OF_UPDATES); $k++, $i++)
	{
		$update_str .= ($k > 0 ? ',' : '')."\n(".($i + 10000).",'{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}','{$uid}')";
		/*
		update test as t set
    column_a = c.column_a
from (values
    ('123', 1),
    ('345', 2)  
) as c(column_b, column_a) 
where c.column_b = t.column_b;
		 */
		#  ('123', 1, '---'),
		
	}
	
	$update_str .= "\n ) AS c (c_id,c_1,c_2,c_3,c_4,c_5,c_6,c_7,c_8,c_9,c_10,c_11,c_12,c_13,c_14,c_15,c_16) WHERE t.id=c.c_id;";
	
	/*
	$update_str = "UPDATE test_table SET data_1='".
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
$uid."' WHERE id=".($i + 10000).";";
 */
	$rc = pg_query($update_str);
	# echo $update_str."\n";
	if (!$rc)
		throw new \Exception("UPDATE ERROR");
	
}
# $conn->query("COMMIT;");

($cr = pg_query("COMMIT")) OR die("Transaction commit failed\n");

$t2 = microtime(true);


# Q_NO_OF_UPDATES / sec

# Q_NO_OF_UPDATES ... ($t2 - $t1)
# ?				  ... 1

echo (Q_NO_OF_UPDATES/($t2 - $t1)), " ops/sec";

var_dump($cr);

function q_create_table()
{
	$cols_str = [];
	for ($i = 1; $i <= 16; $i++)
		$cols_str[] = "data_{$i} VARCHAR ( 255 ) NOT NULL";

	$create_table_stmt = "CREATE TABLE IF NOT EXISTS test_table (
		id serial PRIMARY KEY,
	   ".implode(",\n", $cols_str)."
	);";
	
	echo "<pre>", $create_table_stmt;
}
