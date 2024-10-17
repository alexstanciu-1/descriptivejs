<?php


echo "<pre>";

ini_set("display_errors", 1);
# ini_set("display_errors", 1);

class Xxx
{
	public $_fullName;
	
	public string $fullName {
        get { 
            return $this->__fullName;
        }
		set (string $value) {
			$this->__fullName = $value;
		}
    }
}

class Size_issues_
{
	public $aaaaaaaaaaaaaaaaa_000;
	public $aaaaaaaaaaaaaaaaa_001;
	public $aaaaaaaaaaaaaaaaa_002;
	public $aaaaaaaaaaaaaaaaa_003;
	public $aaaaaaaaaaaaaaaaa_004;
	public $aaaaaaaaaaaaaaaaa_005;
	public $aaaaaaaaaaaaaaaaa_006;
	public $aaaaaaaaaaaaaaaaa_007;
	public $aaaaaaaaaaaaaaaaa_008;
	public $aaaaaaaaaaaaaaaaa_009;
	public $aaaaaaaaaaaaaaaaa_010;
	public $aaaaaaaaaaaaaaaaa_011;
	public $aaaaaaaaaaaaaaaaa_012;
	public $aaaaaaaaaaaaaaaaa_013;
	public $aaaaaaaaaaaaaaaaa_014;
	public $aaaaaaaaaaaaaaaaa_015;
	public $aaaaaaaaaaaaaaaaa_016;
	public $aaaaaaaaaaaaaaaaa_017;
	public $aaaaaaaaaaaaaaaaa_018;
	public $aaaaaaaaaaaaaaaaa_019;
	public $aaaaaaaaaaaaaaaaa_020;
	public $aaaaaaaaaaaaaaaaa_021;
	public $aaaaaaaaaaaaaaaaa_022;
	public $aaaaaaaaaaaaaaaaa_023;
	public $aaaaaaaaaaaaaaaaa_024;
	public $aaaaaaaaaaaaaaaaa_025;
	public $aaaaaaaaaaaaaaaaa_026;
	public $aaaaaaaaaaaaaaaaa_027;
	public $aaaaaaaaaaaaaaaaa_028;
	public $aaaaaaaaaaaaaaaaa_029;
	public $aaaaaaaaaaaaaaaaa_030;
	public $aaaaaaaaaaaaaaaaa_031;
	public $aaaaaaaaaaaaaaaaa_032;
	public $aaaaaaaaaaaaaaaaa_033;
	public $aaaaaaaaaaaaaaaaa_034;
	public $aaaaaaaaaaaaaaaaa_035;
	public $aaaaaaaaaaaaaaaaa_036;
	public $aaaaaaaaaaaaaaaaa_037;
	public $aaaaaaaaaaaaaaaaa_038;
	public $aaaaaaaaaaaaaaaaa_039;
	public $aaaaaaaaaaaaaaaaa_040;
	public $aaaaaaaaaaaaaaaaa_041;
	public $aaaaaaaaaaaaaaaaa_042;
	public $aaaaaaaaaaaaaaaaa_043;
	public $aaaaaaaaaaaaaaaaa_044;
	public $aaaaaaaaaaaaaaaaa_045;
	public $aaaaaaaaaaaaaaaaa_046;
	public $aaaaaaaaaaaaaaaaa_047;
	public $aaaaaaaaaaaaaaaaa_048;
	public $aaaaaaaaaaaaaaaaa_049;
	public $aaaaaaaaaaaaaaaaa_050;
	public $aaaaaaaaaaaaaaaaa_051;
	public $aaaaaaaaaaaaaaaaa_052;
	public $aaaaaaaaaaaaaaaaa_053;
	public $aaaaaaaaaaaaaaaaa_054;
	public $aaaaaaaaaaaaaaaaa_055;
	public $aaaaaaaaaaaaaaaaa_056;
	public $aaaaaaaaaaaaaaaaa_057;
	public $aaaaaaaaaaaaaaaaa_058;
	public $aaaaaaaaaaaaaaaaa_059;
	public $aaaaaaaaaaaaaaaaa_060;
	public $aaaaaaaaaaaaaaaaa_061;
	public $aaaaaaaaaaaaaaaaa_062;
	public $aaaaaaaaaaaaaaaaa_063;
}
/*
$count = 1024;
$arr = [];
for ($i = 0; $i < $count; $i++)
	$arr[$i] = new \stdClass();

$m1 = memory_get_usage();
for ($i = 0; $i < $count; $i++) {
	$arr[$i] = $obj = new Size_issues_();
	
	#for ($x = 0; $x < 64; $x++) {
	#	$p_name = "aaaaaaaaaaaaaaaaa_".str_pad((string)$x, 3, "0", STR_PAD_LEFT);
	#	$obj->$p_name = base64_encode(random_bytes(32));
	#}
}
$m2 = memory_get_usage();

$data_size = 0; # $count * 64 * 80;

echo ("MEM used full: ".($m2 - $m1)." bytes\n");
echo ("MEM used without data: ".($m2 - $m1 - $data_size)." bytes\n");
echo ("MEM per element (without data): ".(($m2 - $m1 - $data_size)/$count)." bytes\n");
echo ("MEM per property (without data): ".(($m2 - $m1 - $data_size)/$count/64)." bytes\n");
echo "Data size: " . $data_size." bytes\n";
die;
*/

$data = [];
for ($i = 1; $i <= 3000; $i++) {
	$d = new Xxx();
	# warm up
	$d->fullName = (string)$i;
	$data[] = $d;
}

$i = 0;
$t1 = microtime(true);
foreach ($data as $d) {
	$d->fullName = "{$i} : My Name is!";
	$i++;
}
$t2 = microtime(true);

echo ('setter: ' . (($t2 - $t1)*1000) . " ms"), "\n";

$i = 0;
$t1 = microtime(true);
foreach ($data as $d) {
	$d->_fullName = "{$i} : My Name is!";
	$i++;
}
$t2 = microtime(true);
echo ('direct: ' . (($t2 - $t1)*1000) . " ms"), "\n";

echo "we are ready!";
die;

