
import {DNode} from './dnode.js';
import {DLib} from './main.js';

export const $ = {
	ajax: async function($request, $data)
	{
		// Default options are marked with *
		const response = await fetch("?:request=" + $request, {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			redirect: 'follow', // manual, *follow, error
			referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: JSON.stringify($data) // body data type must match "Content-Type" header
		});

		return response.json(); // parses JSON response into native JavaScript objects
	},
	
	api: async function($from, $call_data)
	{
		if (!$from)
			$from = 'apis/default.js';
		
		console.log('api $call_data', $call_data);

		// @TODO - here we are ...
		const $js_export = await $.import($from);

		const {default: $api_conn} = $js_export;
			
		console.log('$api_conn', $api_conn);
		/*
			
		const $api_prop_def = $api_conn.props[$query.prop];
		const $call_url = $api_conn.url + $api_prop_def?.url + '?' + $api_prop_def?.get;

		var $send_args;
		if ($query?.args && ($send_args = $obj.$p[$prop][$query?.args]))
		{
			for (var $k in $send_args)
				$api_prop_def.post[$k] = $send_args[$k];
		}

		const $call_args = $api_prop_def?.post ? {
				method: "POST", 
				headers: {"Content-Type": "application/json"}, 
				redirect: "follow",
				body: JSON.stringify($api_prop_def.post),
			} : {};

		fetch($call_url, $call_args).then(($api_resp) => {
			// switch to JSON
			$api_resp.json().then(($r) => {
				// DProxy.mode = DProxy.MODE_POPULATE;

			});
		});
	
		*/
	},
	
	popup: function($html) {return $.before($html, null, document.body);},
	append: function($html, $append_to) {return $.before($html, null, $append_to);},
	prepend: function($html, $prepend_to) {return $.before($html, $prepend_to.firstChild, $prepend_to);},
	after: function($html, $after) {return $.before($html, $after.nextSibling, $after.parentNode);},

	before: function($html, $before, $parent)
	{
		var $tpl = document.createElement('template');
		$tpl.innerHTML = $html;
		if (!$parent) $parent = $before.parentNode;

		var $p_dnode;
		for (var $i = 0; $i < $tpl.content.children.length; $i++)
			(new DNode()).init($tpl.content.children[$i], $p_dnode ? $p_dnode : ($p_dnode = DLib.parentDnode($parent)), undefined, true);

		$parent.insertBefore($tpl.content, $before);
	},

	post: function($request, $data, $new_page)
	{
		var $form = document.createElement('form');
		$form.style.visibility = 'hidden'; // no user interaction is necessary
		$form.method = 'POST'; // forms by default use GET query strings
		if ($new_page)
			$form.setAttribute('target', '_blank');
		$form.action = $request;
		$.post_set_inputs($data, $form);
		document.body.appendChild($form); // forms cannot be submitted outside of body
		$form.submit(); // send the payload and navigate
	},

	post_set_input: function($name, $value, $form, $path)
	{
		if (($value === null) || ($value === undefined))
			return;
		var $ty = typeof($value);
		if (($ty === 'string') || ($ty === 'number') || ($ty === 'boolean') || ($ty === 'bigint'))
		{
			var $input = document.createElement('input');
			$input.type = 'hidden';
			$input.name = ($path !== undefined) ? $path + "[" + $name + "]" : $name;
			$input.value = $value;
			$form.appendChild($input); // add key/value pair to form
		}
		else if (typeof($value) === 'object')
			$.post_set_inputs($value, $form, ($path !== undefined) ? $path + "[" + $name + "]" : $name);
	},

	post_set_inputs: function($data, $form, $path)
	{
		if (($data === null) || ($data === undefined))
			return;
		else if (Array.isArray($data))
		{
			for (var $i = 0; $i < $data.length; $i++)
				$.post_set_input($i, $data[$i], $form, $path);
		}
		else if (typeof($data) === 'object')
		{
			for (var $i in $data)
				$.post_set_input($i, $data[$i], $form, $path);
		}
	},

	toggle: function($new_state, $list, $element)
	{
		if ($new_state)
		{
			if (!$list.includes($element))
			{
				try
				{
					var $commit = DProxy.begin();
					$list.push($element);
				}
				finally
				{
					if ($commit)
						DProxy.commit();
				}
			}
		}
		else
		{
			var $pos = $list.indexOf($element);
			if ($pos >= 0)
			{
				try
				{
					var $commit = DProxy.begin();
					$list.splice($pos, 1);
				}
				finally
				{
					if ($commit)
						DProxy.commit();
				}
			}
		}
	},

	includes: function($list, $element)
	{
		return $list.includes($element);
	},

	live_array: function($array, $conditions)
	{
		// @TODO - return a new array that is linked with the first one via a condition. Ex: {Expand: true}
		// The array is not read-only, and elements that are added to the array will be forced to respect that condition and will also push in the first one
		// elements are passed by reference !
		return $array;
	},

	import: function($path, $base_href)
	{
		if (globalThis.$_files_state_)
		{
			// check that we have it so we don't get errors
			const $vers_path = $._version_path($path);
			if (!$vers_path)
				return null;
		}
		// @TODO - pref cache
		// @TODO - work more at the request level
		return import(($base_href ?? '') + $path);
	},

	fetch: function($path)
	{
		if (globalThis.$_files_state_)
		{
			const $vers_path = $._version_path($path);
			return $vers_path ? fetch($vers_path) : null;
		}
		else
			return fetch($path);
	},
	
	_version_path: function ($path)
	{
		if (($path === undefined) || ($path === null))
			return null;
		const $fd = globalThis.$_files_state_;
		var $mod = null;
		
		if ($path[0] === '/')
			$path = $path.substring(1);
		
		var $prefix = '';
		if (($path[0] === '@') && ($path.length > 1))
		{
			$path = $path.substring(1);
			const $chunks = $path.split(/\//);
			if ($chunks[0].length > 0)
			{
				// console.log($chunks[0]);
		
				$mod = $fd[$chunks[0]]?.files;
				$prefix = '@' + $chunks[0] + '/';
			}
			else
				$mod = $fd[0]?.files;
			$path = $path.substring($chunks[0].length);
			if ($path[0] === '/')
				$path = $path.substring(1);
		}
		else
			$mod = $fd[0].files;
		
		if (($path[0] === '.') && ($path[1] === '/'))
			$path = $path.substring(2);
		
		const $f_info = $mod ? $mod[$path] : null;
		if ($prefix.length > 0)
			$path = $prefix + $path;
		
		if (!$f_info)
			return null;
		else
		{
			const $time_hex = $f_info[0].toString(16);
			const $ext = $._get_ext($path);
			return $ext ? ($path.substring(0, $path.length - $ext.length) + "v_" + $time_hex + "." + $ext) : ($path + ".v_" + $time_hex);
		}
	},
	
	_get_ext: function ($path)
	{
		return $path.substring($path.lastIndexOf('.')+1, $path.length) || $path;
	},
	
	debounce: (func, db_timeout = 500, wait_on_first_call = false) => {
		
		// @TODO - we need to know if it's running and not trigger it again while running, it not that simple if the callback does things async !
		let timer;
		let last_exec;
		return (...args) => {
			var $timeout;
			clearTimeout(timer);
			// on first one wait
			if (($timeout = (!last_exec) ? (wait_on_first_call ? db_timeout : -1) : (db_timeout - ((new Date()) - last_exec))) > 0) {
				timer = setTimeout(() => { last_exec = new Date(); func.apply(this, args); }, $timeout);
			}
			else {
				last_exec = new Date();
				func.apply(this, args); // execute now
				timer = undefined;
			}
		};
	},
	
	first: function ($obj, $return_key = false)
	{
		if (Array.isArray($obj))
			return $obj.length ? ($return_key ? 0 : $obj[0]) : undefined;
		else if (typeof $obj === 'object')
		{
			for (var $k in $obj)
				return ($return_key ? $k : $obj[$k]);
		}
	},
	
	relative: function ($path, $relative_to, $expected_ext)
	{
		if ($path[0] === '/') // absolute path
			return $path;
		if (($path[0] === '.') && ($path[1] === '/'))
			$path = $path.substring(2);
		const $r_ext = $expected_ext ? $relative_to.match(new RegExp("\\." + $expected_ext + "\$")) : $relative_to.match(/\.[^\.^\/]+$/);
		// because it may be web, we can not test if it's a folder or not
		const $r_parts = $relative_to.split(/\//);
		if ($r_ext?.[0])
			$r_parts.pop();
		
		const $parts = $path.split(/\//);
		for (var $i = 0; $i < $parts.length; $i++)
		{
			const $p = $parts[$i];
			if ($p === '..')
				$r_parts.pop(); // remove one element
			else
				$r_parts.push($p); // append one element
		}
		return $r_parts.join('/');
	},
	
	console: globalThis.console
};
