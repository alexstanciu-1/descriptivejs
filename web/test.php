<?php

interface ICascade_To_Code
{
	function Cascade_To_Code_get_props();
}

trait Cascade_To_Code
{
	public function Cascade_To_Code(object $object = null, array $array = null, int $depth = 0)
	{
		$tabs = str_repeat("\t", $depth);
		$loop = null;
		if ($object !== null)
		{
			if (get_class($object) !== 'stdClass')
				throw new \Exception('Only standard classes are supported!');
			echo "(object)[";
			$loop = $object;
		}
		else if ($array !== null)
		{
			echo "[";
			$loop = $array;
		}
		else
		{
			echo get_class($this), "::Cascade_To_Code_wakeup([";
			$loop = $this->Cascade_To_Code_get_props();
		}
		foreach ($loop as $k => $v)
		{
			if (($object !== null) || ($array !== null))
			{
				$prop = $k;
				$val = $v;
			}
			else
			{
				$prop = $v;
				$val = $this->$prop;
			}
			
			echo "\n\t", $tabs, var_export($prop, true) , ' => ';
			if ($val instanceof ICascade_To_Code)
				$val->Cascade_To_Code(null, null, $depth + 1);
			else if (is_array($val))
				$this->Cascade_To_Code(null, $val, $depth + 1);
			else if (is_object($val))
				$this->Cascade_To_Code($val, null, $depth + 1);
			else
				var_export($val);
			echo ",";
		}
		if (($object !== null) || ($array !== null))
			echo "]";
		else
			echo "])";
	}
}

class Test_Cascade implements ICascade_To_Code
{
	use Cascade_To_Code;
	
	/**
	 * @var int
	 */
	protected $Id;
	/**
	 * @var string
	 */
	protected $Code;
	/**
	 * @var string
	 */
	protected $Name;
	/**
	 * @var string
	 */
	protected $Text;
	/**
	 * @var string[]
	 */
	protected $Attrs;
	/**
	 * @var Test_Cascade[]
	 */
	protected $Children;
	/**
	 * @var Test_Cascade
	 */
	protected $Parent;
	
	function Cascade_To_Code_get_props()
	{
		return ["Id", "Code", "Name", "Text", "Attrs", "Children"];
	}
	
	function Cascade_To_Code_wakeup(array $props)
	{
		$class_n = static::class;
		$obj = new $class_n;
		foreach ($obj->Cascade_To_Code_get_props() as $prop)
			$obj->$prop = $props[$prop];
		// restore children
		foreach ($obj->Children ?: [] as $child)
			$child->Parent = $obj;
		return $obj;
	}
	
	public static function Create_Test(int $id, Test_Cascade $parent = null)
	{
		$node = new Test_Cascade();
		$node->Id = $id;
		$node->Name = "Node #{$id}";
		$node->Text = "This is some piece of text @{$id}";
		$node->Attrs = [];
		$attrs = rand(1, 4);
		for ($i = 0; $i < $attrs; $i++)
			$node->Attrs["attr-".$i] = "Attribute #{$i} data text";
		if ($parent)
		{
			$node->Parent = $parent;
			$parent->Children[] = $node;
		}
		return $node;
	}
	
	public function count_nodes()
	{
		$count = 1; // this one
		foreach ($this->Children ?: [] as $child)
			$count += $child->count_nodes();
		return $count;
	}
}

// @TODO ... do not export defaults !

/*
$root = Test_Cascade::Create_Test(10);

$node_1 = Test_Cascade::Create_Test(21, $root);
$node_2 = Test_Cascade::Create_Test(22, $root);
$node_3 = Test_Cascade::Create_Test(23, $root);
$node_4 = Test_Cascade::Create_Test(24, $root);

$node_3_1 = Test_Cascade::Create_Test(31, $node_3);
$node_3_2 = Test_Cascade::Create_Test(32, $node_3);
$node_3_3 = Test_Cascade::Create_Test(33, $node_3);
*/

if (false)
{
	$test_depth = 12;
	$max_nodes_per_level = 512;
	$max_nodes_per_child = 12;
	$max_nodes = 16384;

	$node_id = 1;
	$root = Test_Cascade::Create_Test($node_id++);
	$parents_stack = [$root];

	for ($lvl = 0; $lvl < $test_depth; $lvl++)
	{
		$new_ps = [];
		$per_levl_count = 0;
		foreach ($parents_stack as $parent)
		{
			$rnd_children = rand(($test_depth - $lvl), $max_nodes_per_child);
			for ($i = 0; $i < $rnd_children; $i++)
			{
				$new_ps[] = Test_Cascade::Create_Test($node_id++, $parent);
				$per_levl_count++;
				if (($per_levl_count > $max_nodes_per_level) || ($node_id >= $max_nodes))
					break;
			}
			if (($per_levl_count > $max_nodes_per_level) || ($node_id >= $max_nodes))
				break;
		}
		$parents_stack = $new_ps;
		if ($node_id >= $max_nodes)
			break;
	}

	ob_start();
	$root->Cascade_To_Code();
	$code = ob_get_clean();
	// echo $code;

	file_put_contents("test_gen.php", "<?php\n\n\$_DATA = ".$code.";");
}

$t1 = microtime(true);
include("test_gen.php");
$t2 = microtime(true);

var_dump($t2 - $t1); // 5ms ! yeee !

var_dump($_DATA->count_nodes()); // 5280 

