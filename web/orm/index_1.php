<?php

declare(strict_types=1);

/*
Category : id | name | code | $parent | $children
Product  : id | name | code | $supplier | $categories
Suppier  : id | name | code
 */

# ini_set('opcache.jit', '0');
# phpinfo();
# die;
# var_dump(opcache_get_status()["jit"]);
# die;

# ini_set('')

# 167 ms

# we need some low level utility ... like ... insert/update/delete to do the write ops

interface I_DB_Model {}

abstract class DB_Model implements I_DB_Model
{
	public function __construct(
		protected int $id,
			) {}

    public function __get(string $property): mixed
    {
        return $this->$property;
    }
}

final class DB_Array extends ArrayObject implements I_DB_Model
{
	protected DB_Model $_parent;
	protected string $_property;
	# protected DB_Model $_parent;
	# a way to catch events
	public function offsetSet(mixed $offset , mixed $value) : void
	{
		$this->_parent->db_insert($value, $this, $this->_property);
		# parent::offsetSet($offset, $value);
	}
	
	public function set_Parent(DB_Model $_parent, string $property) : void
	{
		$this->_parent = $_parent;
		$this->_property = $property;
	}
}

class Category extends DB_Model
{
	public function __construct(
		protected int $id,
		protected string $name,
		protected string $code,
		protected Category $parent,
		/**
		 * @var Category[]
		 */
		protected DB_Array $children
			) {parent::__construct($id);}
}
class Product extends DB_Model
{
	public function __construct(
		protected int $id,
		protected string $name,
		protected string $code,
		protected Suppier $suppier,
		/**
		 * @var Category[]
		 */
		protected DB_Array $categories,
			) {parent::__construct($id);}
}
class Suppier extends DB_Model
{
	public function __construct(
		protected int $id,
		protected string $name,
		protected string $code
			) {parent::__construct($id);}
}

final class DB_Transaction
{
	protected ?array $changes = null;

	public function begin(): bool
	{
		$this->changes = [];
		return true;
	}
	
	public function db_insert(DB_Model $value, I_DB_Model $model, string $property) : int
	{
		$this->changes[] = [$model, 'offsetSet', [null, $value]];
		return 1; # should be some increment
	}
	
	public function commit(): bool
	{
		# do the work
		# $save = [];
		foreach ($this->changes as $change)
		{
			$change[0]->{$change[1]}(...$change[2]);
			# $save[] = $change[2][1];
		}
		/*
		$t1 = microtime(true);
		$ser = serialize($save);
		$t2 = microtime(true);
		var_dump('Serialied: '.(($t2 - $t1)*1000));
		
		$t1 = microtime(true);
		file_put_contents("test_commit.dat", $ser);
		$t2 = microtime(true);
		var_dump('Saved_in: '.(($t2 - $t1)*1000));
		*/
		$this->changes = null;
		return true;
	}
}

final class DB extends DB_Model
{
	protected ?DB_Transaction $transaction = null;
	
	public function __construct(
		protected int $id,
		/**
		 * @var Category[]
		 */
		protected DB_Array $categories,
		/**
		 * @var Suppier[]
		 */
		protected DB_Array $suppliers,
		/**
		 * @var Product[]
		 */
		protected DB_Array $products,
			) 
	{
		parent::__construct($id);

		$this->categories->set_Parent($this, "categories");
		$this->suppliers->set_Parent($this, "suppliers");
		$this->products->set_Parent($this, "products");
	}
	
	public function db_insert(DB_Model $value, I_DB_Model $model, string $property) : int
	{
		$commit = false;
		if ($this->transaction === null)
		{
			$this->begin();
			$commit = true;
		}

		$ret = $this->transaction->db_insert($value, $model, $property);
		
		if ($commit)
			$this->commit();
		
		return $ret;
	}
	
	public function begin(): bool
	{
		if ($this->transaction !== null)
			return false;
		$this->transaction = new DB_Transaction();
		return $this->transaction->begin();
	}
	public function commit(): bool
	{
		if ($this->transaction === null)
			return false;
		$rc = $this->transaction->commit();
		# $this->transaction->close();
		$this->transaction = null;
		return $rc;
	}
}


function run_test()
{
	echo "<pre>";

	$t1 = microtime(true);

	$db = new DB(1, new \DB_Array(), new \DB_Array(), new \DB_Array());
	$db->begin();
	for ($i = 0; $i < 50000; $i++)
	{
		$supplier = new Suppier($i, "Suppllier {$i}", "#{$i}");
		$db->suppliers[] = $supplier;
	}
	$db->commit();

	$t2 = microtime(true);


	var_dump((($t2 - $t1)*1000)." ms");
	echo "</pre>";
}

run_test();

