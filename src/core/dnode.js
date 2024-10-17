
import {DLib, DConfig, D_key_none} from './main.js';
import {DProxy, DProxyHdl, DDelete_Sym, DAnyProp_Sym} from './data-proxy.js';

// import {DApiData} from './api-data.js';

import {$} from './functions.js';
import DModel from './model.js';
import {$Regex} from './regex.js';

export const regex_ext = /(?:\.([^\.]+))?$/;

export class DNode
{
	id;
	dom;
	parent;
	children = [];
	attrs;
	is_loop = false;
	root = null;
	is_tpl = false;
	inside_tpl = false;
	data;
	data_key;
	local_vars;
	// expressions as functions
	exps = {};
	level;
	
	#_new_ctx;
	#_obj;
	
	constructor()
	{
		this.id = ++DLib._id;
		DLib.nodes[this.id] = this;
		// this.dom = undefined;
		// this.parent = undefined;
		// this.children = [];
		// this.attrs = undefined;
		// this.is_loop = false;
		// this.root = null;
		// this.is$k_tpl = false;
		// this._new_ctx = undefined;
		// this.inside_tpl = false;
		// this.data = undefined;
		// this._obj = undefined;
		// this.data_key = undefined;
		// this.local_vars = undefined;
		// expressions as functions
		// this.exps = {};
		// this.level;
	}
	
	/**
	 * 
	 * @param {HTMLElement} $dom
	 * @param {DNode} $parent
	 * @param {object} $attrs
	 * @param {String} $role
	 * 
	 * @returns {undefined}
	 */
	init ($dom, $parent, $attrs, $run, $setup_root, $init_data, $init_def)
	{
		// update idx_dom
		if ($dom)
		{
			$dom.__ctx = this;
			this.dom = $dom;
			this.is_tpl = ($dom.tagName === 'TEMPLATE');
			if ($attrs === undefined)
				$attrs = this.dom_get_attrs($dom);
		}
		if (!this.attrs)
			this.attrs = ($attrs || {});
		// parent init here
		this.root = ($parent ? $parent.root : this);
		this.parent = $parent ? $parent : null;
		$parent ? $parent.children.push(this) : null;
		if (this.level === undefined)
			this.level = $parent ? ($parent.level + 1) : 0;
		
		if ($init_data || $init_def)
		{
			if (this._new_ctx)
				throw new Error('$init_data || $init_def on existing ctx');
			this._new_ctx = true;
		}
		else if (this._new_ctx === undefined)
			this._new_ctx = (this.root === this) || (!this.parent);
		if (this._new_ctx && (!this.local_vars))
			this.local_vars = {};
		
		// in contex only data init
		this.init_data(false, undefined, $init_def);
		if ($setup_root)
			$setup_root.data = this.data;
		
		// setup the expressions
		this.init_exps();
		
		if (this.exps.call)
		{
			var $func_args = this.func_args ? this.func_args : DLib.functions[this.call_method].func_args;
			if ($func_args && ($func_args.length > 0))
			{
				this._obj.$a = {};
				for (var $ii = 0; $ii < $func_args.length; $ii++)
					this._obj.$a[$func_args[$ii]] = true;
			}
		}
		
		// scan dom for more mvvm
		if (this.dom)
			this.init_dom(this.dom);
		
		// set data
		var $q_data_str = (!this.is_tpl) ? this.attrs['q-data'] : null;
		if ($q_data_str)
		{
			var $q_data = eval("( " + $q_data_str + " )"); // because it can be an expression
			this.setData($q_data);
		}
		else
			this.setData({});
		
		if ($init_data)
		{
			const $t1 = new Date();
			DModel.import(this.data, $init_data, $init_def);
			const $t2 = new Date();
			console.log('DNode::DModel.import time=' + ($t2 - $t1));
		}
		
		/* // this is deprecated
		var $q_data_api = this.attrs['q-api-data'] ? eval("( " + this.attrs['q-api-data'] + " )") : null;
		if ($q_data_api)
		{
			for (var $k in $q_data_api)
			{
				// if (this._obj[$k] !== undefined)
					// throw new Error('Variable `' + $k + '` already defined');
				
				// set: function(obj, prop, value, proxy, byRef)
				// [{name: 'panel_01'}, {name: 'panel_02'}, {name: 'panel_03'}]
				if (!this.apis)
					this.apis = {};
				var $api;
				this.apis[$k] = $api = new DApiData($k, $q_data_api[$k], this.data, this);
				// (obj, prop, value, proxy, byRef, $async_handler, $debug
				// DProxyHdl.set(this._obj, $k, [], this.data, false, $api);
				$api.$init();
			}
		}
		*/
		// if (($run === undefined) || $run)
			// this.run_exps(true, true);
	   if ($run)
	   {
			// trigger a recursive data update
			try
			{
				var $commit = DProxy.begin();
				this.flow_exec(true);
			}
			finally
			{
				if ($commit)
					DProxy.commit();
			}
	   }
	}
	
	flow_exec($force)
	{
		// we run the init event first
		if ('@init' in this.exps)
			this.expChanged($force, ['@init']);
		// we run all the expressions
		this.handleChanges(this.exps, $force);

		for (var $i = 0; $i < this.children.length; $i++)
			this.children[$i].flow_exec($force);
	}
		
	dom_get_attrs($node)
	{
		var $ctx_attrs = null;
		for (var $k = 0; $k < $node.attributes.length; $k++)
		{
			// @TODO - make this configurable
			var $attr = $node.attributes[$k];
			var $has_q_prefix = false;
			if (($attr.name[0] === ':') || ($attr.name[0] === '@') || ($has_q_prefix = ($attr.name.substr(0, 2) === 'q-')))
			{
				if (!$ctx_attrs)
					$ctx_attrs = {};
				$ctx_attrs[$attr.name] = $attr.value;
				if ($has_q_prefix && (!DLib.q_attrs_list.includes($attr.name)))
					DLib.warn('unknown attribute name: `' + $attr.name + '` on node: ', $node);
			}
		}
		
		return $ctx_attrs;
	}
	
	/**
	 * 
	 * @param {HTMLElement} $node
	 * @returns {undefined}
	 */
	init_dom($node)
	{
		if ($node.tagName === 'TEMPLATE')
			// no need to init inside a TEMPLATE
			return;

		var $children;
		if (! ($node && (($node.tagName === 'TEMPLATE') ? ($children = $node.content.children) : ($children = $node.children))))
			return;
		
		for (var $i = 0; $i < $children.length; $i++)
		{
			var $el = $children[$i];
			if ($el.__ctx)
				continue;
			var $ctx_attrs = this.dom_get_attrs($el);
			var $el_ctx = $ctx_attrs ? (new DNode()) : null;
			if ($el_ctx)
				// inside init it will continue `init_dom`
				$el_ctx.init($el, this, $ctx_attrs, false);
			else
				this.init_dom($el);
		}
	}

	expChanged($force, $args, $exp_return)
	{
		var $what = $args[0];
		var $has_exp = (arguments.length > 2);
		
		if ($what[0] === '@')
		{
			if (!$has_exp)
			{
				// we execute without `watching`
				// alert('is anyone watching ?! ' + $what + " | " + this.exps[$what] + " | val: " + event.target.value);
				$exp_return = this.executeExp($what, false, $args[1]);
			}
		}
		else if ($what === 'dom-model')
		{
			// dom to model
			if (!$has_exp)
				$exp_return = this.executeExp($what);
			if ($exp_return instanceof Error)
			{
				// @TODO - decide what to do here
			}
		}
		else if ($what === 'model')
		{
			if (!$has_exp)
				$exp_return = this.executeExp($what);
			if ($exp_return instanceof Error)
			{
				// @TODO - decide what to do here
			}
			
			if ((this.dom.tagName === 'INPUT') || (this.dom.tagName === 'TEXTAREA'))
			{
				var $inp_type = (this.dom.tagName === 'TEXTAREA') ? 'textarea' : this.dom.getAttribute('type');
				if (($inp_type === 'text') || ($inp_type === 'hidden') || ($inp_type === 'textarea') || ($inp_type === 'email') || ($inp_type === 'number') || ($inp_type === 'password') || ($inp_type === 'search') || ($inp_type === 'url') || ($inp_type === 'week'))
					this.dom.value = (($exp_return === undefined) || ($exp_return === null)) ? "" : $exp_return;
				else if ($inp_type === 'radio')
				{
					this.dom.checked = (this.dom.value === $exp_return);
				}
				else if ($inp_type === 'checkbox')
				{
					this.dom.checked = $exp_return ? true : false;
				}
			}
			else if (this.dom.tagName === 'SELECT')
			{
				this.dom.value = $exp_return;
			}
		}
		else if ($what === 'show')
		{
			if (!$has_exp)
				$exp_return = this.executeExp($what);
			if ($exp_return instanceof Error)
			{
				// @TODO - decide what to do here
				$exp_return = false;
			}
			
			if (($exp_return ? true : false) !== this.__show_result)
			{
				if (this.__show_state === undefined)
					this.__show_state = this.dom.style.display;
				this.dom.style.display = ((this.__show_result = $exp_return ? true : false)) ? this.__show_state : 'none';
			}
			
		}
		else if ($what === 'if')
		{
			if (!$has_exp)
			{
				$exp_return = this.executeExp($what);
			}
			
			if ($exp_return instanceof Error)
			{
				// @TODO - decide what to do here
				$exp_return = false;
			}
			
			if (($exp_return ? true : false) !== this.__if_result)
			{
				this.__if_result = $exp_return ? true : false;
				
				if ($exp_return)
				{
					if (!this.__if_child)
					{
						// things are now positive !
						if (this.dom.tagName === 'TEMPLATE')
						{
							// we need to clone
							var $clone = this.dom.content.cloneNode(true);
							var $first_child = $clone.firstElementChild;
							if (!$first_child)
								throw new Error('IF without elements in is not supported atm!');
							$clone.firstElementChild.__if_tag = this;
							this.dom.parentNode.insertBefore($clone, this.dom.nextSibling);

							var $html_ctx = new DNode();
							$html_ctx.init($first_child, this, undefined, false);
							this.__if_child = $html_ctx;
							// $html_ctx.run_exps(true, true);
							$html_ctx.flow_exec(true);
						}
						else
						{
							// @TODO ... in non-template mode the parent may be 'this' , instead of 'this.parent'
							console.error('in non-template mode @TODO ... in non-template mode the parent may be \'this\' , instead of \'this.parent\'');
							// alert('in non-template mode @TODO ... in non-template mode the parent may be \'this\' , instead of \'this.parent\'');
						}
					}
					else
					{
						// alert('We need to force elements do draw!');
						this.dom.parentNode.insertBefore(this.__if_child.dom, this.dom.nextSibling);
					}
				}
				else
				{
					if (this.__if_child)
					{
						this.__if_child.dom.remove();
						// alert('@TODO - hide on IF NOT');
					}
				}
			}
		}
		else if ($what === 'for')
		{
			this.exp_changed_for($has_exp, $exp_return);
		}
		else if ($what === 'call')
		{
			// this.exp_call | as an array !
			var $func_dom = DLib.functions[this.call_method];
			var $local_vars = {};
			var $call_params = {};
			
			var $args_by_pos = this.executeExp('call');
			
			DLib.log('this.executeExp(call)');
			
			for (var $i = 0; $i < $func_dom.func_args.length; $i++)
			{
				$local_vars[$func_dom.func_args[$i]] = $func_dom.func_args[$i];
				$call_params[$func_dom.func_args[$i]] = $args_by_pos[$i];
			}
			
			var $html_ctx = this._call_node ? this._call_node : null;
			
			DLib.log('QCALL - $call_params', $call_params, $html_ctx);
			
			var $is_new_node = $html_ctx ? false : true;
			
			if ($is_new_node)
			{
				var $clone;
				$html_ctx = new DNode();
				this._call_node = $html_ctx;

				$clone = $func_dom.dom.content.cloneNode(true);
				var $first_child = $clone.firstElementChild;
				$clone.firstElementChild.__call_tag = this;
				
				$html_ctx._new_ctx = true;
				
				$html_ctx.init($first_child, this, undefined, false);
			}
			
			var $commit = DProxy.begin();
			try
			{
				for (var $i in $call_params)
					DProxyHdl.passByRef($html_ctx._obj, $i, $call_params[$i], $html_ctx._obj.$p);
			}
			finally
			{
				if ($commit)
					DProxy.commit();
			}

			if ($is_new_node)
			{
				// $html_ctx.run_exps(true, true);
				this.dom.parentNode.insertBefore($clone, this.dom.nextSibling);
			}
		}
		else if ($what === 'text')
		{
			if (!$has_exp)
				$exp_return = this.executeExp($what);
			// @TODO ... in case of error ...
			if (this.dom.innerText !== $exp_return)
				this.dom.innerText = $exp_return;
		}
		else if ($what === 'html')
		{
			if (!$has_exp)
				$exp_return = this.executeExp($what);
			// @TODO ... in case of error ...
			if (this.dom.innerHTML !== $exp_return)
				this.dom.innerHTML = $exp_return;
		}
		else if ($what[0] === ':') // attribute bind
		{
			var $attr_name = $what.substr(1);
			if (!$has_exp)
				$exp_return = this.executeExp($what);
			
			/*
			var $old_exp;
			if (!this.exp_ret)
				this.exp_ret = {};
			else if (($old_exp = this.exp_ret[$what]) === $exp_return)
				// same value
				return;
			this.exp_ret[$what] = $exp_return ? true : false;
			*/
		   
			if ($exp_return instanceof Error)
			{
				// @TODO - handle error
			}
			else if (($exp_return !== undefined) && ($exp_return !== null))
			{
				if ($attr_name === 'class')
				{
					if (!(typeof($exp_return) === 'object'))
						throw new Error('Only objects supported in :class');
					for (var $i in $exp_return)
					{
						if ($i[0] === '$')
							continue;
						$exp_return[$i] ? this.dom.classList.add($i) : this.dom.classList.remove($i);
					}
				}
				else if ($attr_name === 'style')
				{
					if (!(typeof($exp_return) === 'object'))
						throw new Error('Only objects supported in :style');
					for (var $i in $exp_return)
					{
						if ($i[0] === '$')
							continue;
						this.dom.style[$i] = $exp_return[$i];
					}
				}
				else if (($attr_name === 'checked') || ($attr_name === 'selected') || ($attr_name === 'disabled'))
				{
					if ($exp_return)
						this.dom.setAttribute($attr_name, "");
					else
						this.dom.removeAttribute($attr_name);
				}
				else
				{
					this.dom.setAttribute($attr_name, $exp_return);
					
					// @TODO - we may need to implement for more
					if (($attr_name === 'q-tpl') || ($attr_name === 'q-ctrl'))
						this.ctrl_dynamic($exp_return);
				}
			}
		}
		else if ($what.substr(0, 'api-filter@'.length) === 'api-filter@')
		{
			if (!$has_exp)
				$exp_return = this.executeExp($what);
			this.apis[$what.substr('api-filter@'.length)].expChanged($exp_return);
		}
	}
	
	createLoopNode($index, $dom_frag, $item_data)
	{
		var $i = $index;
		if (this.dom.tagName === 'TEMPLATE')
		{
			// we need to clone
			var $clone = this.dom.content.cloneNode(true);
			var $first_child = $clone.firstElementChild;
			$clone.firstElementChild.__each_tag = this;

			if ($dom_frag)
				$dom_frag.appendChild($clone);

			var $html_ctx = new DNode();
			$html_ctx.is_each_item = true;
			$html_ctx.data_key = $i;
			$html_ctx.local_vars = {};
			// $html_ctx._new_ctx = true;
			// this.forInfo = [$item_name, $key_name, $index_name];
			$html_ctx.local_vars[this.forInfo[0]] = this.forInfo[0];
			if (this.forInfo[1])
				$html_ctx.local_vars[this.forInfo[1]] = this.forInfo[1];
			if (this.forInfo[2])
				$html_ctx.local_vars[this.forInfo[2]] = this.forInfo[2];
			$html_ctx._obj = {};
			// $html_ctx._obj.$c = {changes: {}, in_changes: false, tr: null};
			// $html_ctx._obj[this.forInfo[0]] = $item_data;
			$html_ctx.data = $html_ctx._obj.$p = new Proxy($html_ctx._obj, DProxyHdl);
			// we should not do this here !
			$html_ctx._obj.$n = this._obj;
			
			DProxyHdl.passByRef($html_ctx._obj, this.forInfo[0], $item_data, $html_ctx._obj.$p);
			
			$html_ctx.dom = $first_child;

			$html_ctx.init($first_child, this, undefined, false);
		}
		else
		{
			throw Error('@TODO each clone without a TEMPLATE');
		}
		
		return $html_ctx;
	}
	
	/**
	 * This method will only init the DNode's data object
	 * 
	 * @param {boolean} $force 
	 * @returns {undefined}
	 */
	init_data($force = false, $ini_data = undefined, $init_def = undefined)
	{
		var $q_data_str = (!this.is_tpl) ? this.attrs['q-data'] : null;
				
		if ((!this._obj) || $force)
		{
			if (this._new_ctx || ($q_data_str && (this._new_ctx = true)) || $ini_data)
			{
				this._obj = $ini_data ? $ini_data : {};
				if (this.parent)
					this._obj.$n = this.parent._obj;
				
				this.data = this._obj.$p = new Proxy(this._obj, $init_def ? DProxyHdl._setup($init_def) : DProxyHdl);
				// we need to register the proxy
			}
			else
			{
				this._obj = this.parent._obj;
				this.data = this.parent.data;
			}
		}
	}
	
	/**
	 * Get data
	 * 
	 * @param {string|number|undefined} $key
	 * @returns {object|scalar|array|number|null|undefined}
	 */
	getData($key)
	{
		return ($key !== undefined) ? this.data[$key] : this.data;
	}
	
	/**
	 * Set data
	 * 
	 * @param {object|scalar|array|number|null|undefined} $value
	 * @param {string|number|undefined} $key
	 * @returns {undefined}
	 */
	setData($value, $key)
	{
		if ($key === undefined)
		{
			try
			{
				var $commit = DProxy.begin();
				var $saved_mode = DProxy.mode;
				// var $saved_recursive = DProxy.recursive;
				// var $saved_by_ref = DProxy.byRef;
				
				// DProxy.byRef = false;
				// DProxy.mode = DProxy.MODE_REPLACE;
				// DProxy.recursive = true;
				
				if (($value !== null) && (typeof($value) === 'object') && (!Array.isArray($value)))
				{
					// we cleanup first || are we loosing all the watchers here ?!
					for (var $k in this.data)
					{
						if ($k[0] === '$')
							continue;
						else if (!$k in $value)
							delete this.data[$k];
					}
					for (var $k in $value)
						this.data[$k] = $value[$k];
				}
				else
					throw new Error('Without a key the $value must be a key-value object');
			}
			finally
			{
				DProxy.mode = $saved_mode;
				// DProxy.recursive = $saved_recursive;
				// DProxy.byRef = $saved_by_ref;
				if ($commit)
					DProxy.commit();
			}
		}
		else if ((typeof($key) === 'string') || (!isNaN($key)))
		{
			this.data[$key] = $value;
			/*
			try
			{
				// var $saved_by_ref = DProxy.byRef;
				// DProxy.byRef = false;
				this.data[$key] = $value;
			}
			finally
			{
				// DProxy.byRef = $saved_by_ref;
			}*/
		}
		else
			throw new Error('The $key parameter must be either a string or a number or undefined if you pass a key-value object as $value');
	}
		
	init_exps()
	{
		var $val;
		if (($val = this.attrs['q-func']))
		{
			// Stupid EDGE bug, it will order attributes by name
			var $parts = $val.match(/^\s*([^\(\s]+)\s*\(\s*(.*)\s*\)\s*$/);
			if (!$parts)
				throw new Error('func/call definition error: ' + $val);
			var $method = $parts[1];
			var $expression = $parts[2];
			this.func_method = $method;
			this.func_args = $expression.split(/\s*,\s*/g);
			DLib.functions[$method] = this;
		}
		
		for (var $_k in this.attrs)
		{
			var $val = this.attrs[$_k].trim();
			var $k = (($_k[0] === ':') && ($_k !== ':key')) ? '@attr-bind' : $_k;
			
			switch ($k)
			{
				case 'q-data':
				case 'q-while':
				{
					// @TODO
					break;
				}
				case 'q-ctrl':
				case 'q-tpl':
				{
					this.ctrl_dynamic($val);
					break;
				}
				case 'q-show':
				{
					this.setupExp($val, 'show', true);
					break;
				}
				case 'q-call':
				case 'q-func':
				{
					var $parts = (($val.length === 0) && ($k === 'q-call')) ? [] : $val.match(/^\s*([^\(\s]+)\s*\(\s*(.*)\s*\)\s*$/);
					if (!$parts)
						throw new Error('func/call definition error: ' + $val);
					var $method = $parts[1];
					var $expression = $parts[2];
					
					if ($k === 'q-func')
					{
						// @TODO - parse defauls also: ex: func($arg3 = 12)
						this.func_method = $method;
						this.func_args = $expression.split(/\s*,\s*/g);
						DLib.functions[$method] = this;
					}
					else if ($k === 'q-call')
					{
						if ($val.length === 0)
						{
							// empty call to setup with a q-func
							if (!this.func_method)
								throw new Error('Empty q-call must be paired with a q-func');
							$method = this.func_method;
							$expression = this.func_args.join(',');
						}
						
						this.call_method = $method;
						// setup this expression as an array with the arguments
						this.setupExp("[" + $expression + "]", 'call', true);
					}
					
					break;
				}
				case 'q-if':
				{
					this.setupExp($val, 'if', true);
					break;
				}
				case 'q-for':
				case 'q-each':
				{
					// $Regex.identifier
					var $for_parts = $Regex.parse_for($val);
					if ($for_parts instanceof Error)
						// @TODO : do we stop ?!
						throw $for_parts;
					else
					{
						const [$expression, $item_name, $key_name, $index_name] = $for_parts;
						this.forInfo = [$item_name, $key_name, $index_name];
						this.setupExp($expression, 'for', true);
					}
					
					break;
				}
				case 'q-text':
				case 'q-html':
				{
					// alert('q-html: ' + $val);
					this.setupExp($val, $k.substr(2), true);
					break;
				}
				case 'q-model':
				{
					
					// with event
					// model to DOM
					this.setupExp($val, "model", true);
					// DOM to model
					this.setupExp("if ($node.dom_to_model($event) !== undefined) { " + $val + " = $node.dom_to_model($event) } ", "dom-model", false);
					if ((this.dom.tagName === 'INPUT') || (this.dom.tagName === 'SELECT') || (this.dom.tagName === 'TEXTAREA')) // + textarea + select
					{
						// we need to setup for different DOM elements + a generic one !
						// this.setupExp($val + " = $event.target.value", '@input', false); // + $_k.substr(2));
						DLib.dom_listners["input"].push([this.dom, undefined, 'dom-model']);
					}
					break;
				}
				case '@attr-bind':
				{
					if ($_k[1] === '@')
					{
						// with event
						this.setupExp($val, ":" + $_k.substr(2), true);
						
						if (this.dom.tagName === 'INPUT')
						{
							// we need to setup for different DOM elements + a generic one !
							this.setupExp($val + " = $event ? $event.target.value : undefined", '@input', false); // + $_k.substr(2));
							DLib.dom_listners["input"].push([this.dom]);
						}
					}
					else
						this.setupExp($val, $_k, true);
					break;
				}

				// case ":key":
				// {
				//	alert(':key | ' + $k + ' | ' + $val);
				//	var $key_parts = $val.split(/\s*\,\s*/g);
				//	this.each_key = 'return ' + 
				//				(($key_parts.length > 1) ? $key_parts.join('.$val + "\\n" + ') + '.$val' : 
				//						$val + '.$val') + ';';
				//	this.each_key_obj = 'return ' + (($key_parts.length > 1) ? $key_parts.join(' + "\\n" + ') : $val) + ';';
				//	this.with_key = true;
				//	break;
				// }

				case 'q-init':
				case '@init':
				{
					this.setupExp($val, '@init', false);
					break;
				}
				default:
				{
					if ($k[0] === '@')
					{
						var $parts = $k.split('.');
						if ($parts.length > 1)
						{
							// modifiers
							if (!this.modifs)
								this.modifs = {};
							for (var $z = 1; $z < $parts.length; $z++)
								this.modifs[$parts[$z]] = $z;
						}
						// @TODO - better filter this as an event
						this.setupExp($val, $parts[0], false);
						DLib.dom_listners[$parts[0].substring(1)].push([this.dom, this.modifs]);
					}
					
					break;
				}
			}
		}
	}
	
	setupExp($expression, $type, $with_return, $run_expr, $run_expr_watch, $trigger_changes)
	{
		if (!(typeof($expression) === 'string'))
			return Error('The `$expression` parameter must be a string.');
		
		$expression = $expression.trim();
		var $func = DLib.exprs[$expression];
		if (!$func)
		{
			DLib.exprs[$expression] = $func = new Function('$data, $event, $, $dom, $node', ` with ($data) { ${$with_return ? 'return' : ''} ${$expression}; } `);
		}
		this.exps[$type] = $func;
		if ($run_expr)
		{
			var $ret = this.executeExp($type, $run_expr_watch);
			if (($trigger_changes === undefined) || $trigger_changes)
				this.expChanged(null, [$type], $ret);
			return $ret;
		}
	}
	
	executeExp($type, $with_watch, $event)
	{
		/*if (!DProxy.executeExpCount)
			DProxy.executeExpCount = 0;
		DProxy.executeExpCount++;
		
		var $t1 = window.performance.now();
		*/
		var $func = this.exps[$type];
		var $ret;
		try
		{
			if (($with_watch === undefined) || $with_watch)
			{
				DProxy.wt = [this.id, $type];
			}
			// safer-eval
			// $ret = $func.apply(this, [this.data]);
			DProxy.in_exec = true;
			
			// DLib.exprs[$expression] = $func = new Function('$data, $event, $, $dom, $node', ` with ($data) { ${$with_return ? 'return' : ''} ${$expression}; } `);
			
			$ret = $func(this.data, $event, $, this.dom, this);
			
			if (($type === 'for') || ($type.substr(0, 'api-filter@'.length) === 'api-filter@'))
			{
				// if inside a for, we will need to listen on all the elements/properties
				var $dummy;
				if (($ret === undefined) || ($ret === null)) {} // nothing to do
				else if (Array.isArray($ret) || (typeof($ret) === 'object'))
					// set a any-prop watch, it should do nothing if the object returned is not proxied by us
					$dummy = $ret[DAnyProp_Sym];
				/*else if (Array.isArray($ret))
				{
					for (var $i = 0; $i < $ret.length; $i++)
						$dummy = $ret[$i];
				}
				else if (typeof($ret) === 'object')
				{
					for (var $p in $ret)
						$dummy = $ret[$p];
				}*/
				else
					console.warn('Wrong data type [' + typeof($ret) + '] returned inside of a loop declaration.');
			}
		}
		catch ($ex)
		{
			console.info('executeExp@exception[notice]: ', $ex);
			$ret = $ex;
			// if ($type === 'for') // what do we do ?! do we need to do something ?
		}
		finally
		{
			DProxy.in_exec = false;
			if (($with_watch === undefined) || $with_watch)
				DProxy.wt = null;
		}
		
		return $ret;
	}
	
	handleChanges($changes, $force)
	{
		for (var $k in $changes)
		{
			if ($k[0] !== '@') // avoid events even on force !
				this.expChanged($force, [$k]);
		}
	}
	
	test_get_data()
	{
		return this.data;
	}
	
	find_var()
	{
		// console.log('find_var', arguments);
		// alert('@TODO: DNode . find_var');
		// @TODO ... look up a variable in the parents of this node !
		return false;
	}
	
	dom_event($event, $for)
	{
		// alert(event.target.value);
		this.expChanged(undefined, [($for === undefined ? ('@' + $event.type) : $for), $event]);
	}
	
	dom_to_model($event)
	{
		if ((this.dom.tagName === 'INPUT') || (this.dom.tagName === 'TEXTAREA'))
		{
			var $inp_type = (this.dom.tagName === 'TEXTAREA') ? 'textarea' : this.dom.getAttribute('type');
			if (($inp_type === 'text') || ($inp_type === 'hidden') || ($inp_type === 'textarea') || ($inp_type === 'email') || ($inp_type === 'number') || ($inp_type === 'password') || ($inp_type === 'search') || ($inp_type === 'url') || ($inp_type === 'week'))
				return this.dom.value;
			else if ($inp_type === 'radio')
			{
				// console.log('this.dom.checked: ' + this.dom.checked + ' | this.dom.value=' + this.dom.value);
				return this.dom.checked ? this.dom.value : undefined;
			}
			else if ($inp_type === 'checkbox')
			{
				if (this.dom.checked)
					return this.dom.value ? this.dom.value : 1;
				else
					return 0;
			}
		}
		else if (this.dom.tagName === 'SELECT')
		{
			return this.dom.value;
		}
	}
	
	exp_changed_for($has_exp, $exp_return)
	{
		if (!$has_exp)
			$exp_return = this.executeExp('for');

		/**
		 * Logic should be:
		 *		OPS_DF = new DocumentFragment
		 *		OPS_DF_LEN = 0	// we keep a cache for it
		 *		OPS_DF_FIRST_ELEM = null // we keep a cache for it
		 *		OPS_DF_INSERT_AFTER = null
		 *		Foreach NEW_LIST as POS => NEW_ELEMENT
		 *			IF NEW_ELEMENT.KEY = OLD_LIST[POS].KEY
		 *			{
		 *				IF (OPS_DF_LEN > 0)
		 *				{
		 *					INSERT OPS_DF after LAST_NODE
		 *					LAST_NODE = last element in OPS_DF
		 *				}
		 *				ELSE
		 *					LAST_NODE = OLD_LIST[POS]
		 *			}
		 *			ELSE
		 *				IF OLD_LIST CONTAINS KEY 
		 *						MOVE OLD_LIST[KEY] INSIDE THE OPS_DF 
		 *						SET (OPS_DF_INSERT_AFTER = LAST_NODE)
		 *				ELSE (OLD_LIST DOES NOT CONTAINS KEY)
		 *						CREATE CLONE AND PUSH IT INSIDE THE OPS_DF 
		 *						
		 *		ALL ELEMENTS REMAINING MUST BE CLEANED & REMOVED 
		 */

		if (!this.__each_child)
			this.__each_child = [];
		if (!this._for_objs)
			this._for_objs = [];

		var $virtual_list = $exp_return;
		if (($virtual_list === null) || ($virtual_list === undefined))
			$virtual_list = {length: 0};

		// console.log('exp_changed_for', $virtual_list);

		var $dom_frag = document.createDocumentFragment();
		var $dom_frag_length = 0;
		var $insert_after = this;
		var $exec_nodes = [];
		
		for (var $i = 0; $i < $virtual_list.length; $i++)
		{
			var $item = $virtual_list[$i];
			var $at_pos = this._for_objs[$i];
			if ($item === $at_pos)
			{
				if ($dom_frag_length > 0)
				{
					this.dom.parentNode.insertBefore($dom_frag, $insert_after.dom.nextSibling);
					$dom_frag_length = 0;
					// alert('@TODO - we need to test this code !');
				}
				// we have the same element at the same position
				$insert_after = this.__each_child[$i];
				continue;
			}

			var $found_dom = null;
			var $found_pos = false;
			if (this._for_objs.length > $i)
			{
				$found_pos = this._for_objs.indexOf($item, $i);
				if ($found_pos >= 0)
				{
					$found_dom = this.__each_child[$found_pos];
					if (!$found_dom)
						console.warn('Bad algo. Broken data.');
				}
			}

			if (!$found_dom)
			{
				var $each_node = this.createLoopNode($i, $dom_frag, $item);
				$dom_frag_length++;
				$exec_nodes.push($each_node);
				
				if (this._for_objs.length >= $i) // no search was made because the length is less 
				{
					this._for_objs.splice($i, 0, $item);
					this.__each_child.splice($i, 0, $each_node);
				}
				else
				{
					this._for_objs[$i] = $item;
					this.__each_child[$i] = $each_node;
				}
			}
			else if ($found_pos !== $i)
			{
				$dom_frag.appendChild($found_dom.dom);
				$dom_frag_length++;
				// we're swaping them, @TODO - is it beeter to splice 2x ? (move the current element down by one position instead of splice ?!)
				this._for_objs[$found_pos] = this._for_objs[$i];
				this.__each_child[$found_pos] = this.__each_child[$i];
				this._for_objs[$i] = $item;
				this.__each_child[$i] = $found_dom;
			}
			else
				console.warn('This should never happen!');
		}

		var $commit = DProxy.begin();
		try
		{
			for (var $i = 0; $i < $exec_nodes.length; $i++)
				$exec_nodes[$i].flow_exec(true);
		}
		finally
		{
			if ($commit)
				DProxy.commit();
		}
		
		// @TODO - this code was before `var $commit = DProxy.begin();` we have moved it (big perf improv), we need to see if there are any bugs
		{
			if ($dom_frag_length > 0)
			{
				this.dom.parentNode.insertBefore($dom_frag, $insert_after.dom.nextSibling);
				$dom_frag_length = 0; // just to know about it
			}

			// remove extra elements
			for (var $i = $virtual_list.length; $i < this._for_objs.length; $i++)
				this.__each_child[$i].dom.remove();
			if (this._for_objs.length > $virtual_list.length)
				this.__each_child.length = this._for_objs.length = $virtual_list.length;
		}
	}
	
	/**
	 * @param {string} $val
	 * 
	 * @returns {undefined}
	 */
	async ctrl_dynamic($val)
	{
		// console.log('ctrl_dynamic: ' + $val);
		
		const $ext = regex_ext.exec($val);
		if (!$ext)
			return false;

		if (this._ctrl_link_)
			// release
			this.ctrl_dynamic_release();
		if ((!$val) || (!$val.length))
			return;
		
		var $data_obj = null;
		const $json_possible_url = $val.substring(0, $val.length - 3) + 'json';
		const $data_resp_promise = $.fetch($json_possible_url);

		const $resp_promise = $.fetch($val);
		
		const $load_js = $val.substring(0, $val.length - 3) + 'js';
		const $rbr = ($.request.base_href !== undefined) ? (($.request.base_href === "") ? '/' : $.request.base_href) : null;
		const $import_promise = $.import((($rbr && ($load_js[0] !== '/') && ($load_js[0] !== '.')) ? $rbr : '') + $load_js);
		
		const $load_model = $val.substring(0, $val.length - 3) + 'model.js';
		const $model_promise = $.import((($rbr && ($load_model[0] !== '/') && ($load_model[0] !== '.')) ? $rbr : '') + $load_model);
		
		const $resp = await $resp_promise;
		const $html = await $resp.text();
		// @TODO - if the html is not a single node ... we need to wrap it and loop 
		// to setup the data

		this.dom.insertAdjacentHTML("afterend", $html);

		const $dom = this.dom.nextElementSibling;
		if (!$dom)
		{
			throw new Error('Failed to find inserted element. ' + $html);
		}

		// @TODO ... we do not need to create a reactive node ... we just need to scan !
		// find the parent ... and add it in !!!

		var $model_def;
		if ($model_promise)
			var {default: $model_def} = await $model_promise;
		
		if ($data_resp_promise)
		{
			const $data_resp = await $data_resp_promise;
			try {  $data_obj = await $data_resp.json(); }
			catch ($ex) {console.warn('JSON parse failed for: ' + $json_possible_url); console.log($ex);}
		}

		var $tpl_ctx = this._ctrl_link_ = new DNode();
		// ways to link it to data !
		$tpl_ctx.init($dom, this.parent, $tpl_ctx.dom_get_attrs($dom), true, null, $data_obj, $model_def);

		if ($import_promise)
		{
			const {default: $import_obj} = await $import_promise;
			if ($import_obj)
			{
				$tpl_ctx._jsobj_ = new $import_obj;
				if ($tpl_ctx._jsobj_.boot)
					$tpl_ctx._jsobj_.boot();
			}
		}
		
		// @TODO - how about CSS ?!
		// @TODO - how about images ?! - do we need to do anything ?!
	}
	
	ctrl_dynamic_release()
	{
		if (this._ctrl_link_)
			this._ctrl_link_.remove();
		delete this._ctrl_link_;
	}
	
	remove()
	{
		// @TODO - check if there is more to cleanup !
		if (this.parent?.children)
			this.parent.children.splice(this.parent.children.indexOf(this), 1);
		this.dom.remove();
	}
}
