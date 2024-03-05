
import {DNode} from './dnode.js';
import * as $ from './functions.js';
import {$url} from './url-controller.js';

"use strict";

export const DConfig = {
			// ++ ability to link events and misc !!
			sync_selectors: '[q-ctrl],[q-api],[q-init],[q-if],[q-func],[q-each],[q-call],[q-text]'
		};
export const D_key_none = -1;

export const DLib = {
	_id: 0,
	version: '0.8',
	nodes: {},
	_wt: null,
	ctx: function($dom){return $dom.__ctx ? $dom.__ctx : null;},
	isDebug: false,
	log: function () {if (DLib.isDebug) console.log(...arguments);},
	warn: function () {if (DLib.isDebug) console.warn(...arguments);},
	error: function () {/* if (DLib.isDebug) */ console.error(...arguments);},
	trace: function () {if (DLib.isDebug) console.trace(...arguments);},
	functions: {},
	exprs: {},
	$root: null,
	listen_for: ['click', 'change', 'input', 'focus', 'blur', 'mouseover', 'mouseout'],
	dom_listners: {},
	q_attrs_list: ["q-for", "q-each", "q-foreach", "q-while", "q-if", "q-text", "q-data", "q-ctrl", "q-init", "q-func", "q-call"],
	
	boot: function($sender, $event)
	{
		/*
		if (document.getElementById('q-test-play'))
			// @TEST ONLY ... SHOULD BE REMOVED !
			return;
		*/
	   
		var $t1 = this.startDate = new Date();

		var $html_ctx = DLib.$root = new DNode();

		for (let $i = 0; $i < this.listen_for.length; $i++)
		{
			this.dom_listners[this.listen_for[$i]] = [];
			document.addEventListener(this.listen_for[$i], this.dom_event);
		}
		
		$html_ctx.init(document.documentElement, undefined, undefined, true);
		
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
					$node.__ctx.dom_event($event, $evs[$i][2]);
			}
		}
	}
};

// Start from here
if (document.readyState === "complete" || document.readyState === "loaded")
	DLib.boot();
else
	window.addEventListener('DOMContentLoaded', $event => DLib.boot(null, $event));
	
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
