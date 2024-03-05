import {DLib, DConfig, D_key_none} from './main.js';

"use strict";

export const DDelete_Sym = Symbol('DDelete_Sym');
export const DAnyProp_Sym = Symbol('DAnyProp_Sym');

export const DProxy = {

	MODE_REPLACE: 2,
	MODE_POPULATE: 16,
	
	wt: null, // current watch, pattern: [$id, $type], ex: [12, 'for']
	wts: null,  // current watches if more , ex: {1: {'for': true, 'if': true}}
	tr: null, // inside a transaction
	max_proc_time: 5000,
	
	
	in_exec: false, // inside an exec op
	
	mode: null,
	byRef: true,
	recursive: false,
	
	begin: function () {return this.tr ? false : (this.tr = true); }, // start a new transaction (not-nested)
	commit: function ()
	{
		this.process_changes();
		this.tr = null;
	},
	changes: {},
	// in_changes: false,
	process_changes: function()
	{
		/*
		 * The flow here is very important, we need to group nodes by their level in the tree , if there are changes triggered , 
		 * we need to re-view the new changes and continue
		 */

		// alert('process_changes: ' + DProxy.executeExpCount + " | " + DProxy.executeExpSum + " ms | Since start: " + (new Date() - DLib.startDate));
		// DLib.log('DProxy::process_changes', JSON.stringify(this.changes));
		// var $s_time = window.performance.now();
		// var $t1 = performance.now();

		var $map = [];
		var $has_elements;

		var $debug = false;

		if ($debug)
			console.log('START process_changes');
		var $flow_count = 0;
		var $hdle_count = 0;
		
		if ($debug)
			console.log('Changes: ', this.changes);
		
		do
		{
			//if ((window.performance.now() - $s_time) > this.max_proc_time)
			//	throw new Error('DProxy.process_changes stopped. Exceeded DProxy.max_proc_time (' + this.max_proc_time + ' ms)');
			$flow_count++;
			
			$has_elements = false; // we always reset it here
			
			for (var $id in this.changes)
			{
				var $node = DLib.nodes[$id];
				if (!$node)
				{
					DLib.warn('Missing node with Id=' + $id);
					continue;
				}
				if (!$map[$node.level])
					$map[$node.level] = {};
				$map[$node.level][$id] = [this.changes[$id], $node];
			}
			
			if ($debug)
			{
				var $dbg_map = [];
				for (var $level = 0; $level < $map.length; $level++)
				{
					var $m_list = $map[$level];
					if ($m_list === undefined)
						continue;
					$dbg_map[$level] = {};

					for (var $id in $m_list)
						$dbg_map[$level] = [$m_list[$id][0], $m_list[$id][1].id, JSON.stringify($m_list[$id][1].attrs)];
				}
				console.log("Flow cycle #" + $flow_count + ":", $dbg_map);
			}
			
			this.changes = {}; // prepare it for the next batch
			
			var $reset = false;
			// 1. Exec/handle in flow control order
			for (var $level = 0; $level < $map.length; $level++)
			{
				var $m_list = $map[$level];
				if ($m_list === undefined)
					continue;
				
				for (var $id in $m_list)
				{
					var [$changes, $node] = $m_list[$id];
					if ($changes === undefined)
						continue;
					if (typeof($changes) !== 'object')
						$changes = {[$changes]: true};
					
					if ($debug)
						console.log('start: handleChanges @' + (++$hdle_count), $changes, $node.id + " :: " +  JSON.stringify($node.attrs));

					$node.handleChanges($changes);
					
					if ($debug)
						console.log('done: handleChanges @' + $hdle_count);
					// resolved (this.changes may put it back, but atm we consider it resolved)
					delete $m_list[$id];
					
					// there are more changes
					if (Object.keys(this.changes).length > 0)
					{
						// @TODO - we could be more efficient here, and if the new changes will not affect our flow, we could just continue 
						//				if max_level(new_changes) >= $level ... just add it in !
						//				it's not a big cost atm 
						$has_elements = true;
						$reset = true;
						break;
					}
				}
				
				if ($reset)
					break;
			}
			
			DLib.log('DProxy::DONE Cycle Changes');
		}
		while ($has_elements);
		
		if ($debug)
			console.log('FINISH process_changes');
		// alert('process_changes: ' + DProxy.executeExpCount + " | " + DProxy.executeExpSum + " ms | Since start: " + (new Date() - DLib.startDate));
		// var $t2 = performance.now();
		// alert(($t2 - $t1));
		// document.querySelector('#elapsed-time').textContent = ($t2 - $t1) + " ms";
	}
};

// @TODO - the set of changes must recurse !

export const DProxyHdl = {

	obj_id_next: 1,
	$gp: false, // get proxy
	
	get: function(obj, prop, proxy)
	{
		// THERE MUST BE A BETTER WAY TO AVOIF THIS STACK OF IF's !!!
		if (prop[0] === '$')
		{
			if (prop === '$')
				return $;
			else if (prop === '$y')
				return obj.$y;
			else if (prop.length === 2)
				return undefined;
			else if ((obj.$y || obj.$t) && ((prop === '$init') || (prop === '$populate')))
				return DApiData.prototype[prop]; // [prop];
			else if (this.$gp)
				return [obj, proxy];
		}
		// this is not the best ... we need to understand !
		if (prop === Symbol.unscopables)
			// console.log('obj[Symbol.unscopables]', obj[Symbol.unscopables]);
			return obj[Symbol.unscopables];// || {$w: true};
		else if (prop === 'console')
			return console;
		else if (prop === DAnyProp_Sym)
		{
			if (DProxy.wt)
			{
				// for must wildcard listen on all the properties
				const $rw = obj.$w || (obj.$w = {});
				($rw[DAnyProp_Sym] || ($rw[DAnyProp_Sym] = {}))[DProxy.wt[0]] = DProxy.wt[1];
			}
			return undefined;
		}
		
		// @TODO - for a function
		
		// @TODO - THIS IS NOT IDEAL !, in a FOR (var $i in ...) loop , it will still `ask` for it!
		//else if ((prop[0] === '$') && (prop.length === 2))
		//	return undefined;
		
		// @TODO - use defineProperty to hide `$w` ? why is it only visible on the first level
		// console.log('get::', prop, ' | obj: ', obj, ' | watch: ', DProxy.wt, ' | proxy: ', proxy);
		
		const $r = obj[prop];
		
		if (($r === undefined) && obj.$n && ((!obj.$a) || (!obj.$a[prop]))) // we also make sure that `prop` is not an argument
		{
			// if a variable is not defined in this context , we look for it up the chain
			return this.get(obj.$n, prop, obj.$n.$p);
		}
		
		const $is_obj = (typeof($r) === 'object') && ($r !== null);
		
		{ // THIS IS A COPY OF THE CODE IN the GET - they should stay identical
			if (DProxy.wt !== null)
			{
				// if ((DLib.$root._obj === obj) && (prop === 'children'))
					// console.log("Before: ", JSON.stringify(obj.$w), DProxy.wt);
				// console.log('watch::', prop, DProxy.wt[1], DProxy.wt[0], ' | obj: ', obj, ' | proxy: ', proxy);
				const $w = obj.$w || (obj.$w = {});
				($w[prop] || ($w[prop] = {}))[DProxy.wt[0]] = DProxy.wt[1];
			}
			// either one or a list
			else if (DProxy.wts !== null)
			{
				// a list of watches
				for (var $i = 0; $i < DProxy.wts.length; $i++)
				{
					var $dw = DProxy.wts[$i];
					var $w = obj.$w || (obj.$w = {});
					var $wp = ($w[prop] || ($w[prop] = {}));
					var $has_el = $wp[$dw[0]];
					if ($has_el) // is an array
						Object.assign($has_el, $dw[1]);
					else
						$wp[$dw[0]] = $dw[1];
				}
			}
		}
		
		return $is_obj ? $r.$p : $r;
	},
	
	set: function(obj, prop, value, proxy, byRef, $async_handler, $debug)
	{
		if ($debug)
			console.log(' ----- set [byRef=' + ((byRef !== undefined) ? byRef : DProxy.byRef) + '] ::' + prop + ' | value: ', value, ' | obj: ', obj, ' | proxy: ', proxy);
		
		// if ((prop === 'length') && (value >= 1)) // the length of an array is undetectable :-(
		//	alert('yooooy: ' + obj[prop]);
		
		var $is_array_len = ((prop === 'length') && Array.isArray(obj)); // array.length is already set to the new value, so we need to fix
		var $old = $is_array_len ? obj._len : obj[prop];
		if (value === $old)
			// no change
			return true;
		else if ((prop[0] === '$') && (prop.length === 2))
			return true; // we will not change these !
		// test if value is a proxy ?!
		var $val_ty = typeof(value);
		var val_is_obj = ($val_ty === 'object') && (value !== null);
		
		var $val;
		var $recursive = DProxy.recursive;
		if (val_is_obj)
		{
			// check for proxy
			this.$gp = true;
			var $p_obj = value.$$qproxy$;
			this.$gp = false;
			$val = $p_obj ? $p_obj[0] : value;
			if ($p_obj)
			{
				if ($val === $old)
					// no changes
					return true;
			}
			else
			{
				// not one of our Proxies, we will need to copy
				$recursive = true;
				byRef = false;
			}
		}
		else if ($val_ty === 'function')
			// @TODO - do we act ?
			return true;
		
		try
		{
			var $commit = DProxy.begin();
			// console.log('DProxy.begin', $commit);
			var $has_changes = true;
			
			// handle objects
			var $new_obj;
			if (val_is_obj)
			{
				if ((byRef === undefined) || (byRef === null))
					// internal object, pass by reference
					byRef = DProxy.byRef;

				var $val_is_arr = Array.isArray($val);
				var $old_is_obj = (typeof($old) === 'object') && ($old !== null);
								
				// if it's not a proxy, make it
				if (byRef === true)
				{
					// console.log('set prop even by ref: ', obj, prop, value, proxy, $val);
					$new_obj = $val;
					obj[prop] = $new_obj;
					$has_changes = true;
				}
				else if ($old_is_obj && (Array.isArray($old) === $val_is_arr))
				{
					$new_obj = $old;
					$has_changes = false;
				}
				else
				{
					$new_obj = $val_is_arr ? [] : {};
					$new_obj.$z = this.obj_id_next++;
					$new_obj.$p = new Proxy($new_obj, DProxyHdl);
					obj[prop] = $new_obj;
					$has_changes = true;
				}
				if ($async_handler)
					$new_obj.$y = $async_handler;
				
				/*console.log(obj, prop, $new_obj, value);
				if ($debug)
					alert('$has_changes = true');*/
				
				if ((obj.$t /* || (obj.$y && (prop === 'items')) */ ) && ((!$new_obj.$t) || $has_changes)) // link it to the parent !
				{
					// @TODO - a bit ugly with the hard-coded `(prop === 'items')` here !
					$new_obj.$t = [obj, prop];
				}
			}
			else if (value === DDelete_Sym)
				// delete
				delete obj[prop];
			else 
			{
				// scalars
				if ($is_array_len)
					obj._len = value; // fix for array.length being already set to the new value when proxy.set is called
				obj[prop] = value;
			}
			
			let $w_prop, $w_any, $ow;
			
			if ($debug)
				console.log(' ----- set | $has_changes: ', $has_changes, obj.$w);
			
			/*if ($debug && (prop == 0))
			{
				// console.log('$ow[DAnyProp_Sym]', obj.$w[DAnyProp_Sym]);
				// alert('yak!');
			}*/
						
			if ($has_changes && ($ow = obj.$w))
			{
				$w_prop = $ow[prop];
				// DLib.log('$watchers before', DProxy.changes);
				for (let $id in $w_prop)
				{
					var $wtch = $w_prop[$id];
					var $dli = DProxy.changes[$id];
					if ($dli)
						(typeof($wtch) === 'object') ? Object.assign($dli, $wtch) : $dli[$wtch] = true;
					else
						DProxy.changes[$id] = $wtch;
				}
				
				$w_any = $ow[DAnyProp_Sym]; 
				for (let $id in $w_any)
				{
					var $wtch = $w_any[$id];
					var $dli = DProxy.changes[$id];
					if ($dli)
						(typeof($wtch) === 'object') ? Object.assign($dli, $wtch) : $dli[$wtch] = true;
					else
						DProxy.changes[$id] = $wtch;
				}
				// DLib.log('$watchers after', DProxy.changes);
			}
			
			if (val_is_obj)
			{
				if ($recursive && (byRef !== true)) //  (... || $has_changes) - I don't think is needed
				{
					var $proxy = $new_obj.$p;
					// @TODO - avoid recursion in here
					// @TODO - proper object matcing in Arrays or Objects
					
					if ($val_is_arr)
					{
						// @TODO :: IN CASE WE REUSE !!! WE NEED TO MAKE THIS SMARTER !!!
						for (var $i = 0; $i < $val.length; $i++)
							// $proxy[$i] = $val[$i];
							// proxy, byRef, $async_handler, $debug
							this.set($new_obj, $i, $val[$i], $proxy, undefined, undefined, $debug);
						
						// @TODO - optimize this | it's just for testing
						if ($val.length < $new_obj.length)
						{
							for (var $i = $val.length; $i < $new_obj.length; $i++)
								this.set($new_obj, $i, DDelete_Sym, $proxy, undefined, undefined, $debug);
							$new_obj.length = $val.length;
						}
					}
					else
					{
						// @TODO :: IN CASE WE REUSE !!! WE NEED TO MAKE THIS SMARTER !!!
						for (var $i in $val)
							// $proxy[$i] = $val[$i];
							this.set($new_obj, $i, $val[$i], $proxy, undefined, undefined, $debug);
						
						if (DProxy.mode === DProxy.MODE_REPLACE)
						{
							for (var $i in $new_obj)
							{
								if (($i[0] === '$') && ($i.length === 2))
									continue;
								else if (!($i in $val))
									this.set($new_obj, $i, DDelete_Sym, $proxy, undefined, undefined, $debug);
							}
						}
					}
				}
			}
		}
		finally
		{
			// console.log('DProxy.commit', $commit);
			if ($commit)
				// we now commit the changes
				DProxy.commit();
		}
		
		return true;
	},
		
	// The handler.has() method is a trap for the in operator.
	/**
	 * This trap can intercept these operations:

			Property query: foo in proxy
			Inherited property query: foo in Object.create(proxy)
			with check: with(proxy) { (foo); }
			Reflect.has()
	 * 
	 * @param {type} obj
	 * @param {type} prop
	 * @returns {Boolean}
	 */
	has: function(obj, prop)
	{
		if ((prop[0] === '$') && (prop.length <= 2))
			return false;
		// console.log('has::', prop, "=", prop in obj, ' | obj: ', obj, obj.$n);
		// var $d_none_obj = 'to - be linked';
		
		{ // THIS IS A COPY OF THE CODE IN the GET - they should stay identical
			if (DProxy.wt !== null)
			{
				// if ((DLib.$root._obj === obj) && (prop === 'children'))
					// console.log("Before: ", JSON.stringify(obj.$w), DProxy.wt);
				// console.log('watch::', prop, DProxy.wt[1], DProxy.wt[0], ' | obj: ', obj, ' | proxy: ', proxy);
				const $w = obj.$w || (obj.$w = {});
				($w[prop] || ($w[prop] = {}))[DProxy.wt[0]] = DProxy.wt[1];
			}
			// either one or a list
			else if (DProxy.wts !== null)
			{
				// a list of watches
				for (var $i = 0; $i < DProxy.wts.length; $i++)
				{
					var $dw = DProxy.wts[$i];
					var $w = obj.$w || (obj.$w = {});
					var $wp = ($w[prop] || ($w[prop] = {}));
					var $has_el = $wp[$dw[0]];
					if ($has_el) // is an array
						Object.assign($has_el, $dw[1]);
					else
						$wp[$dw[0]] = $dw[1];
				}
			}
		}
		
		if (DProxy.in_exec)
		{
			// $data, $event, $, $dom, $node | these are the standard arguments in exec
			if ((prop[0] === '$') && ((prop === '$event') || (prop === '$dom') || (prop === '$node')))
				return false;
			else
				return true;
		}
		else
			return (prop in obj) || ((obj.$n !== undefined) && this.has(obj.$n, prop));
	},
		
	deleteProperty: function(obj, prop)
	{
		return ((prop[0] === '$') && (prop.length === 2)) ? true : this.set(obj, prop, DDelete_Sym);
	},
	
	passByRef: function(obj, prop, value, proxy)
	{
		this.set(obj, prop, value, proxy, true);
	}
	
	/*
	ownKeys: function(obj)
	{
		var $k = Reflect.ownKeys(obj);
		if (($k[0] === '$w') || ($k[0] === '$n'))
			$k.shift();
		return $k;
	}
	*/
};
/*
const DProxyHdl_Array = {
	
	get: DProxyHdl.get,
	set: DProxyHdl.set,
	has: DProxyHdl.has
};*/
