
import {$} from './functions.js';
import {DLib} from './main.js';

export default class D_Process {
	// this will handle the process
	
	static async run($process_path, $args, $resume_at, $trigger)
	{
		// @TODO - some locking !
		const {url: $url, id: $proc_id, path: $import_path} = this.#clean_url($process_path);
		const $import = await import($import_path);
		const $proc_def = $import.default;
		$proc_def._$url_ = $url;
		
		const $id = $proc_id ?? ($proc_def.get_id ? $proc_def.get_id($args) : JSON.stringify($args));
		const $key = $url + "?" + $id;

		var $proc;
		// load by idf
		const $ret = $proc_id ? JSON.parse( globalThis.localStorage.getItem('@proc:' + $key) ) : null;
				
		if ($ret)
		{
			$proc = $ret.proc;
			const $path = $ret.path;
			this.#waked($proc, $proc_def);
			if ($path && (!$resume_at))
				$resume_at = $path;
		}
		else {
			$proc = {id: $id, key: $key, def: $proc_def, def_url: $import_path, done: false};
		}
		
		const $run_step = $resume_at ? this.#get_step($proc, $resume_at) : $proc;
		if (!$run_step) {
			console.log($proc, $proc_def);
			throw new Error('Unable to resume at: ' + $resume_at);
		}
		/*
			const $tmp_saved = $sub_def;
			const $rbr = ($.request.base_href !== undefined) ? (($.request.base_href === "") ? '/' : $.request.base_href) : null;

			const $tmp_imp = await import((($rbr && ($sub_def.src[0] !== '/') && ($sub_def.src[0] !== '.')) ? $rbr : '') + $sub_def.src);
			$sub_def = $tmp_imp.$proc_def ? $tmp_imp.$proc_def : $sub_def;
			if ($tmp_saved !== $sub_def)
			{
				for (var $t in $tmp_saved)
				{
					if ($sub_def[$t] === undefined)
						$sub_def[$t] = $tmp_saved[$t];
				}
			}
		 */
		
		if ($args !== undefined)
			$run_step.input = $args;
		
		await D_Process.run_loop($proc, $run_step, $trigger); // , true
		
		console.log('D_Process.run :: fully finished!');
	}
	
	static async run_loop($proc, $step, $trigger) // , $is_first
	{
		var $action = 'run';
		if (($step === undefined) || ($step === null))
			$step = $proc;
		const $initial_step = $step;
				
		do
		{
			console.log("run_loop@" + $action + " : " + this.#path($step));
			
			const $def = $step.def;
			if ($action === 'run')
			{
				var $tmp;
				const $run_it = $def?.test ? (($tmp = $def?.test($step)) && (Array.isArray($tmp) ? $tmp[0] : $tmp)) : true;
				if ($run_it)
				{
					// save just as we start the proc, we save the entire process
					this.#save($proc, $step);
					
					if ($def?.wait && ((!$trigger) || ($initial_step !== $step)))
					{
						this.#wait_setup($step, $def.wait);
						// now halt the execution
						return;
					}

					if ($def?.run) {
						$def.run($step, $proc, $step.input, $);
						if ($trigger && ($initial_step === $step)) { // we need to unset the wait
							this.#wait_setup($step, $def.wait, true);
						}
					}
					
					if ($def?.goto) {
						// better to just boot everything ... and run it
						// @TODO - this step may not have been intialized
						// alert('goto: ' + $def?.goto);
						console.log('goto: ' + $def.goto);
						$step = $step.parent.steps[$def.goto];
						$action = 'run';
					}
					else
					{
						let $first_child;
						if (($def?.steps) && ($first_child = $.first($def.steps, true)))
						{
							// @TODO - run child
							if (!$step.steps)
								$step.steps = {};
							$step = $step.steps?.[$first_child] ?? ($step.steps[$first_child] = await this.#newstep({tag: $first_child, data: {}, def: $def.steps[$first_child], input: {}, 'return': {}, parent: $step, done: false}, $proc));
							$action = 'run';
						}
						else
							// the node/proc is the same
							$action = 'finish';
					}
				}
				else
					$action = 'finish-no-run';
			}
			else if (($action === 'finish') || ($action === 'finish-no-run'))
			{
				// at this point we are done with all the children of this 
				if (($action === 'finish') && $def?.finish) {
					$def.finish($);
				}
				// determine what's to do next
				let $next_tag;
				const $parent = $step?.parent;
				
				if ($parent && ($next_tag = this.#next_sib($parent.def, $step.tag))) // next sib
				{
					if (!$parent.steps)
						$parent.steps = {};
					// next sibling
					$step = $parent.steps?.[$next_tag] ?? ($parent.steps[$next_tag] = await this.#newstep({tag: $next_tag, data: {}, def: $parent.def.steps[$next_tag], input: {}, 'return': {}, parent: $parent, done: false}, $proc));
					console.log("run_loop@" + $action + " next sib & " + this.#path($step));
					$action = 'run';
				}
				else if ($parent) {
					$step = $parent;
					$action = 'finish';
				}
				else {
					// nothing else to do
					$action = $step = null;
				}
			}
		}
		while ($action);
	}
		
	static #next_sib($def, $after_tag)
	{
		var $found = false;
		for (var $k in $def?.steps)
		{
			if ($k === $after_tag)
				$found = true;
			else if ($found)
				return $k;
		}
	}
	
	static #save($proc, $step)
	{
		const $root = this.#root($proc);
		const $str = JSON.stringify({proc: $root, path: this.#path($step)}, ($key, $val) => { return (($key === 'parent') || ($key === 'def')) ? undefined : $val;});
		// console.log('#save :: $str', $root.key, $str);
		return localStorage.setItem('@proc:' + $root.key, $str);
	}
	
	static reset()
	{
		// @TODO
	}
		
	static #waked($proc, $proc_def)
	{
		if ($proc_def)
			$proc.def = $proc_def;
		const $s = $proc?.steps;
		const $sd = $proc_def?.steps;
		if (!$s)
			return;
		for (var $k in $s)
		{
			const $step = $s[$k];
			if ($step) {
				$step.parent = $proc;
				this.#waked($step, $sd[$k]);
			}
		}
	}
	
	static #clean_url($url)
	{
		const $parts = $url.split(/\?/);
		const $chunks = ($parts[0].replace(/(^\/+)/, '').replace(/(\/+$)/, '')).split('/');
		return {url: $parts[0], id: $parts?.[1], path: $parts[0] + '/' + $chunks[$chunks.length - 1] + '.js'};
	}
	
	static #path($proc)
	{
		var $ret;
		while ($proc) {
			if ($proc?.tag)
				$ret = (($ret !== undefined) ? $ret + "." : $proc.tag);
			$proc = $proc?.parent ?? null;
		}
		return $ret ?? '';
	}
	
	static #wait_setup($proc, $wait_def, $unset)
	{
		// @TODO ... I'm not even using wait/$wait_def !
		const $p_path = this.#path($proc);
		
		const $root = this.#root($proc);
		const $wait_key = '@process.wait:' + $root.key + '/' + $p_path;
		
		if ($unset)
			globalThis.localStorage.removeItem($wait_key);
		else
			globalThis.localStorage.setItem($wait_key, JSON.stringify({process: $root.key, step: $p_path}));
	}
	
	static trigger($key, $args)
	{
		const $trigger = JSON.parse( globalThis.localStorage.getItem($key) );
		if (!$trigger)
			throw new Error('Unable to read key: ' + $key);
		this.run($trigger.process, $args, $trigger.step, $key);
	}
	
	static #root($proc)
	{
		while ($proc.parent) $proc = $proc.parent;
		return $proc;
	}
	
	static #get_step($proc, $path)
	{
		const $chunks = Array.isArray($path) ? $path : $path.split(/\./);
		for (var $i = 0; $proc && ($i < $chunks.length); $i++) {
			if ($chunks[$i])
				$proc = $proc?.steps?.[$chunks[$i]];
		}
		return $proc;
	}
	
	static remove($def_url, $proc_id)
	{
		return localStorage.removeItem('@proc:' + $def_url.replace(/\/$/, '') + "?" + $proc_id);
	}
	
	static async #newstep($step, $proc)
	{
		if ($step?.def?.src && (!$step?.def?._srcon)) {
			const $def = $step.def;
			const $import_path = $.relative($def.src, $proc.def_url, "js");
			const {default: $tmp_imp} = await import($import_path);
			for (var $k in $tmp_imp)
				if ($def[$k] === undefined)
					$def[$k] = $tmp_imp[$k];
			$def._srcon = true;
		}
		return $step;
	}
}
/*
const ProcProxyHdl = {
	data: undefined,
	def: undefined,
	
	setup: function ($data, $def) {
		const $new = {...this};
		$new.data = $data;
		$new.def = $def;
		// @TODO - set data in
		return $new;
	},
	save: () => {
		
	},
	restore: () => {
		
	}
};
*/
