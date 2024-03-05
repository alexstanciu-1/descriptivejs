
"use strict";

// We use this file to test things

var $data = {
	test: function($str_1, $str_2, $str_3)
	{
		return $str_1 + $str_2 + $str_3;
	},
	prop_1: 'p1',
	// arr: []
};

console.log("init $data: ", $data);

var $expressions = [
						"arr = ['new item #1', 'i #02']",
						"arr.push('I was pushed!')",
						"arr.splice(0, 2)",
						
					]; // ; prop_1 + 12 // "test('a', 'b', 'c');";
var $watcher = [11, 'for'];
var $watchers = [];
var $with_watch = false;

const proxy_hdl = {
	
	$get_proxy: false,
	
	get: function(target, property, receiver)
	{
		// if (property === Symbol.unscopables)
			// return undefined;
		console.log('get::', property, ' | target: ', target, ' | proxy: ', receiver);
		
		// @TODO - setup watches if present
		
		return this.$get_proxy ? [target, receiver] : target[property];
	},
	
	set: function(target, property, value, receiver)
	{
		// if (typeof(prop) === 'symbol')
		// console.log('set:: target, property, value, receiver', target, property, value, receiver);
		console.log('set::', property, ' | value: ', value, ' | target: ', target, ' | proxy: ', receiver);
		
		// test if value is a proxy ?!
		var val_is_obj = (typeof(value) === 'object') && (value !== null);
		var $set_v;
		
		// this will check if the value is a proxy, and if true, it will set value to the actual data
		if (val_is_obj)
		{
			this.$get_proxy = true;
			var $p_obj = value.$$qproxy$;
			this.$get_proxy = false;
			if (!$p_obj)
				// if it's not a proxy, make it
				// @TODO ... do we copy the data ?!, or just wrap it
				$set_v = new Proxy(value, proxy_hdl);
			else
			{
				console.log('already proxy', (value === $p_obj[1]), $p_obj);
				$set_v = $p_obj[1];
			}
			// IF (value === $p_obj[1]) - NO CHANGE !
			{
				// $new.push(new (Object.getPrototypeOf($objs[$i]).constructor));
				// $obj.constructor.name,
			}
		}
		else
			$set_v = value;
		
		// @TODO ... do we copy the data ?!, or just wrap it
		// mark changes
		console.log((target[property] === value) ? 'NO CHANGE' : 'CHANGED');
				
		target[property] = $set_v;
		return true;
	},
	
	// The handler.has() method is a trap for the in operator.
	has: function(target, prop)
	{
		console.log('has::', prop, ' | target: ', target);
		// var $d_none_obj = 'to - be linked';
		return (!((prop[0] === '$') && (prop.length === 2))) && ((prop in target) || (target.$n === undefined) || (!target.$n.find_var(prop)));
	},
	
	apply: function(target, thisArg, argumentsList)
	{
		console.log('apply:: target, thisArg, argumentsList', target, thisArg, argumentsList);
	},
	
	construct(target, args)
	{
		console.log('construct:: target, args', target, args);
	},
	
	deleteProperty: function(target, property)
	{
		console.log('deleteProperty::', property, ' | target: ', target);
		delete target[property];
		return true;
	}
	// has: function(target, prop) { return prop in target; }
	// not used atm
	// ownKeys (target) { return Reflect.ownKeys(target) }
};


var $proxy = new Proxy($data, proxy_hdl);
$data.$p = $proxy;
$data.$n = new DNode();
$data.$w = null;

/**
$proxy.prop_obj = {idata: 88};

console.log('$proxy.prop_obj', $proxy);

var $x = $proxy.prop_obj;

$proxy.prop_obj = $x;

console.log($proxy);
alert('halt');
*/
for (var $e = 0; $e < $expressions.length; $e++)
{
	var $expression = $expressions[$e];
	console.log('########## $expr = ', $expression);

	var $func = new Function('$data', ` with ($data) { return ${$expression}; } `);
	var $ret;
	try
	{
		if ($with_watch)
			DLib._wt = $watcher;
		$ret = $func($proxy);
	}
	catch ($ex)
	{
		$ret = $ex;
	}
	finally
	{
		if ($with_watch)
			DLib._wt = null;
	}

	console.log('$ret = ', $ret);
	console.log('$data = ', $data);
}

// alert('done!');
