<?php

/**
 * show off @property, @property-read, @property-write
 *
 * @property int $regular regular read/write property
 * @property-read int $foo the foo prop
 * @property-write string $bar the bar prop
 */
class Magician
{
	private $_thingy;
	private $_bar;
	
	public $direct;
	
	protected $method;

	function __get(string $var)
	{
		switch ($var)
		{
			case 'foo':
				return 45;
			case 'regular':
				return $this->_thingy;
		}
	}

	function __set(string $var, $val)
	{
		switch ($var)
		{
			case 'bar':
			{
				$this->_bar = $val;
				break;
			}
			case 'regular':
			{
				if (is_string($val))
					$this->_thingy = $val;
			}
		}
	}
	
	function set_Property($value)
	{
		$this->method = $value;
	}

	function get_Property()
	{
		return $this->method;
	}
}

# phpinfo();
# die;

function test_mag(Magician $x)
{
	$z = 0;
	for ($i = 0; $i < 1000000; $i++)
		$x->set_Property($i);
}

$x = new Magician();
$x->regular = 1;
	
$t1 = microtime(true);
test_mag($x);
$t2 = microtime(true);
var_dump($t2 - $t1, "aa");

# PHP 8
	// setting it 1000000 times : float(0.0702810287475586) 
	// getting it 1000000 times : float(0.07006096839904785) 

# $x = new Magician();
# $x->regular = 11;

# var_dump($x);
# phpinfo();

