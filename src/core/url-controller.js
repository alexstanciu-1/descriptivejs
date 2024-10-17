
import {DProxy, DProxyHdl, DDelete_Sym, DAnyProp_Sym} from './data-proxy.js';
import {$} from './functions.js';

export class D_Url
{
	static $default_def = null;
	
	static get_url($url_def, $what)
	{
		if (!$url_def)
			$url_def = D_Url.$default_def;
		if (!$url_def)
			return false;
		
		var $url = [];
		const $args = $what[0] ?? null;
		Array.isArray($args) ? $url_def.get($url, ...$args) : $url_def.get($url, $args);
		
		if ($what)
		{
			for (var $url_tag in $what)
			{
				if (($url_def = $url_def.urls[$url_tag]))
				{
					if ($url_def.get)
					{
						const $s_args = $what[$url_tag];
						Array.isArray($s_args) ? $url_def.get($url, ...$s_args) : $url_def.get($url, $s_args);
					}
				}
				else
				{
					console.warn("Missing URL definition @" + $url_tag + " | args: " + JSON.stringify($what) );
					// error
					return false;
				}
			}
		}
		
		return $url.join("/");
	}
	
	static set_url($url_def, $what)
	{
		if (!$url_def)
			$url_def = D_Url.$default_def;
		const $str_url = (typeof($what) === 'string') ? $what : D_Url.get_url($url_def, $what);
		$.request.url = $str_url.split(/\//).filter(r => (r !== ''));
		D_Url.run($url_def, $.request.url, $);
		history.pushState({url: $str_url}, "", $str_url);
	}
	
	static setup_request($request)
	{
		var $diff = location.href.substring(document.baseURI.length);
		var $url_parts = $diff.split(/\//).filter(r => (r !== ''));
		
		$request = $request ? $request : {};
		var $reactive_request = new Proxy($request, DProxyHdl);
		$reactive_request.url = $url_parts;
		
		const $br = document.baseURI.substr((location.protocol + "//" + location.host).length);
		$reactive_request.base_href = ($br === '/') ? '' : $br;
		
		return $reactive_request;
	}
	
	static run($url_def, $url, $)
	{
		if (!D_Url.$default_def)
			D_Url.$default_def = $url_def;
		D_Url.run_url_def($, $url_def, $url, 0, null); // , true
	}
	
	static async run_url_def($, $url_def, $url, $pos, $parent_def) // , $is_first
	{
		var $processed = false;
		var $c_url = ($pos < $url.length) ? $url[$pos] : null;
		
		if ($url_def.init)
		{
			$url_def.init($, $url_def.args ? $url_def.args : undefined);
		}
		
		if (($pos === $url.length) && ($url_def.index && $url_def.index($)))
		{
			// index was processed
			$processed = true;
		}
		if ((!$processed) && $url_def.urls)
		{
			for (var $tag in $url_def.urls)
			{
				var $sub_url_def = $url_def.urls[$tag];
				var $tests_ok = null;
				if ($sub_url_def.test)
				{
					const $tmp = $sub_url_def.test($c_url, $url, $pos, $);
					$tests_ok = $tmp[0];
					if (($tmp[1] !== undefined) && ($tmp[1] !== null))
						// move position if asked
						$pos = $tmp[1];
				}
				else if (($c_url !== null) && ($sub_url_def.tag ? ($sub_url_def.tag === $c_url) : ($tag === $c_url)))
				{
					$tests_ok = true;
					$pos++;
				}
				if ($tests_ok)
				{
					if ($sub_url_def.src)
					{
						const $tmp_saved = $sub_url_def;
						const $rbr = ($.request.base_href !== undefined) ? (($.request.base_href === "") ? '/' : $.request.base_href) : null;
						
						const $tmp_imp = await import((($rbr && ($sub_url_def.src[0] !== '/') && ($sub_url_def.src[0] !== '.')) ? $rbr : '') + $sub_url_def.src);
						$sub_url_def = $tmp_imp.$url_def ? $tmp_imp.$url_def : $sub_url_def;
						if ($tmp_saved !== $sub_url_def)
						{
							for (var $t in $tmp_saved)
							{
								if ($sub_url_def[$t] === undefined)
									$sub_url_def[$t] = $tmp_saved[$t];
							}
						}
					}
					
					const $tmp = await D_Url.run_url_def($, $sub_url_def, $url, $pos, $url_def);
					if ($tmp[0])
						$processed = true;
				}
			}
		}
		if ((!$processed) && $url_def.notfound)
		{
			$url_def.notfound($);
		}
		if ($url_def.unload)
		{
			$url_def.unload($);
		}
		
		return [$processed];
	}
}
