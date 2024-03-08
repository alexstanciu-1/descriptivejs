
import {DProxy, DProxyHdl, DDelete_Sym, DAnyProp_Sym} from './data-proxy.js';
import {$} from './functions.js';

export const $url_from = function ($url_def, $path)
{
	for (var $url_tag in $path)
	{
		var $args = $path[$url_tag];
		// progress via the URL
		alert('@TODO // progress via the URL DEFINITION');
	}
};

export const $url = function ($path)
{
	return $url_from(D_Url.$default_def, $path);
};

export class D_Url
{
	static $default_def = null;
	
	static get_url($url_def)
	{
		if (!$url_def)
			$url_def = D_Url.$default_def;
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
		D_Url.run_url_def($, $url_def, $url, 0); // , true
	}
	
	static async run_url_def($, $url_def, $url, $pos) // , $is_first
	{
		var $processed = false;
		var $c_url = ($pos < $url.length) ? $url[$pos] : null;
		
		if ($url_def.init)
		{
			$url_def.init($);
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
						const $tmp_imp = await import($sub_url_def.src);
						$sub_url_def = $tmp_imp.$url_def ? $tmp_imp.$url_def : $sub_url_def;
					}
					
					const $tmp = D_Url.run_url_def($, $sub_url_def, $url, $pos);
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

