<?php

declare(strict_types=1);

final class Transaction
{
	public SplObjectStorage $objects;
	
	public static Transaction $current;
	
	public static function begin()
	{
		$ret = new Transaction();
		$ret->objects = new SplObjectStorage();
		return (static::$current = $ret);
	}
	
	public function commit()
	{
		# write down changes
		# 
		# & terminate
	}
	
	public function add(Model $model, int ...$props)
	{
		foreach ($props as $p)
			$this->objects[$model][$p] = $p;
	}
}

abstract class Model
{
	protected int $id;
	# protected int $_id;
	protected string $locks = '';
	protected Transaction $trans;

	public function get_id(): int
	{
		$this->locks[0] = '1';
		return $this->id;
	}
	
	public function set_id(int $id)
	{
		if ($this->id !== $id)
		{
			if ($this->trans !== Transaction::$current)
			{
				$obj = new static;
				$obj->set_id($this->id);
			}
			else
			{
				# $this->locks[0] = '1';
				# $this->_id = $this->id;
				$this->id = $id;
			}
		}
	}
}

final class Product extends Model
{
	protected string $name;
	protected App $app;

	public function get_name(): string
	{
		$this->locks[1] = '1';
		return $this->name;
	}

	public function set_name(string $name)
	{
		if ($this->name !== $name)
		{
			if ($this->trans !== Transaction::$current)
			{
				$obj = new static($this->id, Transaction::$current);
				$obj->set_id($this->id);
				$obj->name = $name;
				Transaction::$current->add($obj, 1);
				return $obj;
			}
			else
			{
				$this->name = $name;
			}
		}
	}
}

final class App extends Model
{
	public array $Products;
	
	public function Products_add(Product $product)
	{
		# when we begin a transaction ... we can have a clean context 
		# as we change data ... 
		#			data needs to be changed on this context only
	}
	
	public function Products_remove(Product $product)
	{
		
	}
}

