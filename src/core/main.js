
import {DNode} from './dnode.js';
import {$} from './functions.js';
import {D_Url} from './url-controller.js';
import {DProxy, DProxyHdl, DDelete_Sym, DAnyProp_Sym} from './data-proxy.js';
import D_Process from './process.js';

export const DConfig = {
			// ++ ability to link events and misc !!
			sync_selectors: '[q-ctrl],[q-tpl],[q-api],[q-init],[q-if],[q-func],[q-each],[q-call],[q-text]'
		};
export const D_key_none = -1;

/*
(async () => {
	console.log(await navigator.storage.getDirectory());
})();
*/

globalThis.$ = $;

// TEST ONLY
if (globalThis.window !== undefined)
{
	window.addEventListener("load", (event) => {

		var $session_id = window.sessionStorage.getItem('sessionid');
		if (!$session_id)
		{
			$session_id = (Math.random().toString(36)).substring(2) + (Math.random().toString(36)).substring(2) + (Math.random().toString(36)).substring(2);
			window.sessionStorage.setItem('sessionid', $session_id);
		}
		console.log($session_id);
		
		// cleanup ... is hard to work when we change the logic
		D_Process.remove('/@e-comm/processes/auth/register', $session_id);
		// run it
		D_Process.run('/@e-comm/processes/auth/register', {session_id: $session_id});
		
		setTimeout(() => {
			
			D_Process.trigger('@process.wait:/@e-comm/processes/auth/register?' + $session_id + '/check_human', {is_human: true});
			
			// fill_reg_form
			setTimeout(() => {
				D_Process.trigger('@process.wait:/@e-comm/processes/auth/register?' + $session_id + '/fill_reg_form', {email: 'ealexs@gmail.com'});
				
				setTimeout(() => {
					D_Process.trigger('@process.wait:/@e-comm/processes/auth/register?' + $session_id + '/confirm', {confirm: 'yes'});
				}, 2000);
				
			}, 2000);
			
		}, 2000);
		
	});
}

export const DLib = {
	_id: 0,
	version: '0.8',
	nodes: {},
	_wt: null,
	ctx ($dom) {return $dom.__ctx ? $dom.__ctx : null;},
	isDebug: false,
	log () {if (DLib.isDebug) console.log(...arguments);},
	warn () {if (DLib.isDebug) console.warn(...arguments);},
	error () {/* if (DLib.isDebug) */ console.error(...arguments);},
	trace () {if (DLib.isDebug) console.trace(...arguments);},
	functions: {},
	exprs: {},
	$root: null,
	listen_for: ['click', 'change', 'input', 'focus', 'blur', 'mouseover', 'mouseout'],
	dom_listners: {},
	q_attrs_list: ["q-for", "q-each", "q-foreach", "q-while", "q-if", "q-text", "q-data", "q-ctrl", "q-tpl", "q-init", "q-func", "q-call"],
	
	async boot ($sender, $event)
	{
		// alert(globalThis.$config.url_ctrl);
		const {$url_def} = await $.import(globalThis.$config.url_ctrl, globalThis.$config.base_href);
		// register it ... maybe configurable in the future ?!
		window.$url_def = $url_def;
		/*
		if (document.getElementById('q-test-play'))
			// @TEST ONLY ... SHOULD BE REMOVED !
			return;
		*/
		$.request = D_Url.setup_request();
		
		// $.url = $.request.url;
		$.ui = new Proxy({}, DProxyHdl);
		if (!$.url)
			$.url = {};
		$.url.get = function (...$args) { return D_Url.get_url(null, ...$args); };
		$.url.set = function (...$args) { return D_Url.set_url(null, ...$args); };
		
		var $t1 = this.startDate = new Date();

		var $html_ctx = DLib.$root = new DNode();

		for (let $i = 0; $i < this.listen_for.length; $i++)
		{
			this.dom_listners[this.listen_for[$i]] = [];
			document.addEventListener(this.listen_for[$i], this.dom_event);
		}
		
		$html_ctx.init(document.documentElement, undefined, undefined, true, $);
				
		if (window.$url_def)
			// run URL controller
			D_Url.run(window.$url_def, $.request.url, $);
		/*
		setTimeout(() => {
			const $data = $html_ctx.children[7]?.data?.sometestdata;
			if ($data)
			{
				// console.log($data);
				DLib.watch($data, 
							($changes) => {console.log('watch: handleChanges', $changes);},
							'**');

				// test with some changes
				// $data.a = 12;
				// $data.a = 15;
				$data.b.push('new');

				console.log('watch :: test :: done', $data);
			}
		}, 1000);
		*/
		var $t2 = new Date();
			
		// @for test only atm
		if ((window.$data_to_test !== undefined) && (typeof($data_to_test === 'object')))
		{
			// DLib.log('START - SET DATA');
			
			// alert('start rec!');
			
			$html_ctx.setData($data_to_test);
			
			// alert('stop rec!');
			
			/*
			var $dom_frag = document.createElement("div");
			$dom_frag.innerHTML = $html;
			document.querySelector('.tree-wrapper').insertBefore($dom_frag, null);
			*/
		   
			DLib.log('END - SET DATA');
			
			// DLib.log('$root DATA', $html_ctx._obj);
			// test-set-data
			// test-show-data
			// DLib.log('DProxy::changes', DProxy.changes);
			// DLib.log('DATA', $html_ctx._obj);
			
			document.getElementById('json_data').value = JSON.stringify($html_ctx.test_get_data(), null, 2);
		}
		
		var $t3 = new Date();
		
		if (document.querySelector('#elapsed-time'))
			document.querySelector('#elapsed-time').textContent = ($t3 - $t1) + " ms";
			
		var $test_set_data = document.getElementById('test-set-data');
		if ($test_set_data)
		{
			$test_set_data.addEventListener('click', function ()
			{
				var $t1 = performance.now();
				$html_ctx.setData(JSON.parse(document.getElementById('json_data').value));
				var $t2 = performance.now();
				document.querySelector('#elapsed-time').textContent = ($t2 - $t1) + " ms";
			});

			document.getElementById('test-show-data').addEventListener('click', function ()
			{
				// console.log($html_ctx.test_get_data());
				document.getElementById('json_data').value = JSON.stringify($html_ctx.test_get_data(), null, 2);
			});
		}
	},
	
	parentDnode: function($dom)
	{
		while ((!$dom.__ctx) && $dom.parentNode)
			$dom = $dom.parentNode;
		return $dom.__ctx;
	},
	
	dom_event($event)
	{
		const $type = $event.type;
		const $evs = DLib.dom_listners[$type];
		if ($evs)
		{
			for (let $i = 0; $i < $evs.length; $i++)
			{
				var $node = $evs[$i][0];
				var $modifs = $evs[$i][1];
				// @TODO - optimise order here
				
				if ($node && $modifs && $modifs.away)
				{
					if (!$node.contains($event.target))
						$node.__ctx.dom_event($event, $evs[$i][2]);
				}
				else if ($node && (($node === $event.target) || ($node === $event.target.parentNode) || $node.contains($event.target)) && $node.__ctx)
				{
					$node.__ctx.dom_event($event, $evs[$i][2]);
				}
			}
		}
	},
	
	watch ($data, $callback, $selector, $compare_mode)
	{
		const $watcher = {id: ++DLib._id, level: 0, handleChanges: $callback};
		DLib.nodes[$watcher.id] = $watcher;
		// alert('watch me!');
		
		function recurse_data($data) {
			// console.log('recurse_data::$data', $data);
			if (Array.isArray($data)) {
				for (var $i = 0; $i < $data.length; $i++) {
					if (typeof($data[$i]) === 'object')
						recurse_data($data[$i]);
				}
			}
			else {
				for (var $k in $data) {
					if (typeof($data[$k]) === 'object')
						recurse_data($data[$k]);
				} 
			}
		};
		
		if (DProxy.wt)
			throw new Error('Already watching.');
		// @TODO - if $compare_mode ... we will save the data for a before/after comparison
		DProxy.wt = [$watcher.id, 'watch'];
		try
		{
			// walk @TODO - go deeper based on the selector
			if (typeof($data) === 'object')
				recurse_data($data);
		}
		finally
		{
			DProxy.wt = null;
		}
		
		return $watcher;
	}
};

/*
self.addEventListener("fetch", (event) => {
  // Let the browser do its default thing
  // for non-GET requests.
  console.log('event', event);
  alert('fetchfetchfetch');
});
*/
/*
window.fetch = new Proxy(window.fetch, {
    apply(actualFetch, that, args) {
        // Forward function call to the original fetch
        const result = Reflect.apply(actualFetch, that, args);

        // Do whatever you want with the resulting Promise
        result.then((response) => {
            console.log("fetch completed!", args, response);
        });

        return result;
    }
});
*/

DLib.boot();
/*
// Start from here
if ((document.readyState === "complete") || (document.readyState === "loaded"))
	DLib.boot();
else
	window.addEventListener('DOMContentLoaded', $event => DLib.boot(null, $event));
*/
	
	/**
	 * In essence there are ? key elements
	 * 
	 * 1. Reference the data correctly, setup the data ok
	 * 2. Prepare the expressions. modify variables to point the data correctly, copy info to __ctx (after the data is set)
	 * 3. Register watchers
	 * 4. Lasy convert expressions from strings to evals
	 * 5. DOM events -> Tick data -> ...
	 */
	
	
	// (new Function(...Object.keys(context), codeYouWantToExecute))(...Object.values(context));
	// (new (Function.bind.apply(Function, [void 0].concat(Object.keys(context), [codeYouWantToExecute])))()).apply(void 0, Object.values(context));


