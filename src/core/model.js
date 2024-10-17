
import {DProxy,DProxyHdl} from './data-proxy.js';
import {$} from './functions.js';
import {DLib} from './main.js';

export default class DModel {
	
	static import($local, $in, $def, $selector, $mode)
	{
		const $commit = DProxy.begin(); // do it in a transaction
		// const $saved_mode = DProxy.mode;
		// ?? not implemented here !!! DProxy.mode = DProxy.MODE_POPULATE; // @TODO - make DProxy.MODE_POPULATE work !
		
		DProxyHdl.$gp = true;
		const $p_obj = $local.$$qproxy$;
		DProxyHdl.$gp = false;
		/*
		$p_obj[2].$se = $selector;
		// $p_obj[2].$se = $selector;
		console.log($p_obj[2]); // proxy handler
		alert('x');
		*/
		const $saved_dpex = DProxy.exec_queries;
		try
		{
			DProxy.exec_queries = true;
			// @TODO - comply with any merge-by rule
			if (Array.isArray($in)) {
				for (var $i = 0; $i < $in.length; $i++)
					$local[$i] = $in[$i];
			}
			else {
				for (var $prop in $in)
					$local[$prop] = $in[$prop];
			}
		}
		finally
		{
			if ($saved_dpex !== DProxy.exec_queries)
				DProxy.exec_queries = $saved_dpex;
			
			// DProxy.mode = $saved_mode;
			if ($commit)
				DProxy.commit();
		}
	}
	
	static query($query, $obj, $prop, $callback_on_result, $listen)
	{
		if (($listen !== false) && $query?.args)
		{
			DLib.watch($obj.$p[$prop][$query?.args], 
				// debounce !!!
				$.debounce(($changes) => {
					// query again
					DModel.query($query, $obj, $prop, $callback_on_result, false);
					
				}), '**');
		}
		
		// we want to work async
		$.import($query.from).then(($js_export) => {
			
			const {default: $api_conn} = $js_export;
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
					const $commit = DProxy.begin();
					try
					{
						$callback_on_result($r.response);
						// console.log($obj.$p[$prop]);
					}
					finally
					{
						if ($commit)
							DProxy.commit();
					}
				});
			});
		});
	}
	
	/*
	static import_rec ($local, $in, $def, $selector, $mode)
	{
		// please let it as it is ... it needs to work recursive if a $def is present
		const $l_selector = ($selector === undefined) ? true : $selector; // or pick it from model definition 
		const $l_model = ($mode === undefined) ? 'replace' : $mode; // or pick it from model definition
		
		var $empty;
		if ($l_model === 'replace')
		{
			for ($empty in $local) 
				break;
		}
		
		var $query;
		if (($query = $def?.['@query']))
		{
			$.import($query.from).then(function ($resp)
			{
				fetch($resp.default.url).then(function ($api_resp)
				{
					console.log('$resp', $api_resp);
					alert('imported!');
				});

			});
		}
		
		// console.log('$def', $def);
		if (Array.isArray($in))
		{
			// @TODO - comply with any merge-by rule
			for (var $i = 0; $i < $in.length; $i++)
			{
				const $v = $in[$i];
				if (typeof($v) === 'object')
				{
					// @TODO - respect mode : replace/merge/populate
					$local.push(Array.isArray($v) ? [] : {});
					// do not send something like (const $lc = $local[$i] = ...) ... because it will not be a proxy
					this.import($local[$local.length - 1], $v, $def, $l_selector, $mode);
				}
				else
					$local.push($v);
			}
		}
		else
		{
			const $loop_in = ($l_selector === true) ? $in : $l_selector;
			for (var $prop in $loop_in)
			{
				const $v = $in[$prop]; // always pick it from $in
				if (typeof($v) === 'object')
				{
					// @TODO - respect mode : replace/merge/populate
					$local[$prop] = Array.isArray($v) ? [] : {};
					// do not send something like (const $lc = $local[$prop] = ...) ... because it will not be a proxy
					this.import($local[$prop], $v, $def ? $def[$prop] : undefined, ($l_selector === true) ? true : ($l_selector ? $l_selector[$prop] : $l_selector), $mode);
				}
				else
				{
					$local[$prop] = $v;
				}
			}
		}
		
		if ($l_model === 'replace')
		{
			// remove not in `$in`
		}
	}
	*/
}

