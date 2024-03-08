<?php

declare(strict_types=1);

# disk table
const Q_DT_Type_Integer = 1;
const Q_DT_Type_String = 2;
const Q_DT_Type_Bool = 3;

const Q_TAB_Products = 1;

$structures = [
	[], # some meta will go here
	[ # position #1 is products
		['products', 128],
		['id', Q_DT_Type_Integer, 4, ],
		['code', Q_DT_Type_String, 16, ],
		['name', Q_DT_Type_String, 64, ],
	],
];

$file_ptr = null;
$cache = new SplFixedArray(1024);
$cache_pos = 0;

$m0 = memory_get_usage();

# pointer : via alignment / repeating id (+index|optional)

q_dt_begin();
$struct = $structures[Q_TAB_Products];

$t1 = microtime(true);
for ($i = 1; $i <= 100000; $i++)
{
	q_dt_write($struct, $i, "#idf{$i}", "Some stupid name like {$i}");
}
q_dt_commit();
$t2 = microtime(true);

$m1 = memory_get_usage();

echo "<pre>";
var_dump((($t2 - $t1)*1000)." ms", ($m1 - $m0));

function q_dt_begin()
{
	global $file_ptr;
	if ($file_ptr === null)
		$file_ptr = fopen("test_data.bin", "wb");
}

function q_dt_flush(string $write_str = null, bool $final_flush = false)
{
	global $cache, $cache_pos, $file_ptr;
	
	$flush = false;
	if ($final_flush || ($flush = ($cache_pos === 1024)))
	{
		# $cnt = $cache_pos;
		for ($i = 0; $i < $cache_pos; $i++)
			fwrite($file_ptr, $cache[$i]);
		unset($cache);
		
		if ($flush)
		{
			$cache = new \SplFixedArray(1024);
			$cache_pos = 0;
		}
	}
	if ($write_str !== null)
		$cache[$cache_pos++] = $write_str;
}

function q_dt_write(array $structure, ...$cols)
{
	global $file_ptr;
	if ($file_ptr === null)
		return false;
	
	list($t_name,) = $structure[0];
	$write_str = "";
	foreach ($structure as $k => $struct_v)
	{
		if ($k === 0)
			continue;
		list($c_name, $c_type, $c_bytes) = $struct_v;
		$value = $cols[$k - 1];
		switch ($c_type)
		{
			case Q_DT_Type_Integer:
			{
				$write_str .= pack("L", $value);
				break;
			}
			case Q_DT_Type_String:
			{
				$write_str .= str_pad($value, $c_bytes, "\x00");
				break;
			}
			case Q_DT_Type_Bool:
			{
				$write_str .= pack("C", $value);
				break;
			}
			default:
				break;
		}
	}
	
	q_dt_flush($write_str);
}

function q_dt_commit()
{
	global $file_ptr;
	
	q_dt_flush(null, true);
	if ($file_ptr)
		fclose($file_ptr);
}