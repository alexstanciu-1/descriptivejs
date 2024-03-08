
import {DNode} from './dnode.js';
import {$} from './functions.js';
import {DProxy, DProxyHdl, DDelete_Sym, DAnyProp_Sym} from './data-proxy.js';

export class DApiData
{
	constructor($property, $settings, $data, $node)
	{
		this.property = $property;
		this.data = $data;
		this.settings = $settings;
		this.node = $node;
	}
	
	$init()
	{
		// we really need to do a bit of a cleanup with these proxies!
		var $this = this; // this.$y; // yes, as `this`=Proxy!
		
		// we need to `watch` the filter !
		// $expression, $type, $with_return, $run_expr, $run_expr_watch, $trigger_changes
		$this.node.setupExp($this.property + '.filter', 'api-filter@' + $this.property, true, true, true, false);
		$.ajax('query:' + $this.property + '@' + JSON.stringify($this.settings)).then((resp) => $this._$reset(resp.data));
	}
	
	$populate($selector)
	{
		if (($selector === undefined) || ($selector === null))
			$selector = "*";
		
		DProxyHdl.$gp = true;
		var $p_obj = this.$$qproxy$;
		DProxyHdl.$gp = false;
		
		var $obj = $p_obj[0];
		var $proxy = $p_obj[1];
		var $c_obj = $obj;
		var $query_path = [];
		var $filters = [];
		var $clean_qp = [];
		
		while (!$c_obj.$y)
		{
			if (!$c_obj.$t)
			{
				console.log(this);
				throw new Error('Unable to find query path for populate');
			}
			if ($c_obj.$t[0].$y)
			{
				// we are at the top level
				if ($c_obj.$t[1] !== 'items')
					throw new Error('The name of the top-level property should be `items`');
				$c_obj = $c_obj.$t[0];
				break;
			}
			else
			{
				var $id_or_ids = DApiData._$getId($c_obj);
				if (($id_or_ids === undefined) || ($id_or_ids === null))
					throw new Error('Can not populate on items without an id');
				if (!Array.isArray($c_obj.$t[0]))
				{
					for (var $i = 0; $i < $filters.length; $i++)
						// establish context for others
						$filters[$i][2] = $c_obj.$t[1] + ($filters[$i][2] ? "." + $filters[$i][2] : "");
					// @TODO - this is not right
					$clean_qp.unshift([$c_obj.$t[1], $id_or_ids]);
				}
				else
					// @TODO - this is not right
					$clean_qp.unshift([$c_obj.$t[1], $id_or_ids]);
				
				$filters.push(["$id=?", $id_or_ids, null]); // rule , params , context
				$c_obj = $c_obj.$t[0];
			}
		}
		
		if (!$c_obj.$y)
			throw new Error('Unable to find query-able object for populate');
		
		var $this = $c_obj.$y; // yes, as `this`=Proxy!
		var $args = {filters: $filters, populate: $selector};
		$.ajax('query:' + $this.settings + ":" + JSON.stringify($args)).then(function (resp) {
			
			var $r_data = resp.data;
			var $i = 0;
			for (var $prop in $clean_qp)
			{
				if ($i > 0)
					$r_data = $r_data[$prop];
				$r_data = DApiData._$filter_byid($r_data, $clean_qp[$prop]);
				$i++;
			}
			
			if (Array.isArray($r_data) !== Array.isArray($obj))
				throw new Error('They should match!');
			
			if (Array.isArray($r_data))
				alert('@TODO !!!');
			else
			{
				try
				{
					var $commit = DProxy.begin();
					var $saved_mode = DProxy.mode;
					DProxy.mode = DProxy.MODE_POPULATE; // @TODO - make DProxy.MODE_POPULATE work !
					
					// @TODO - do we set it if already set ?!
					for (var $k in $r_data)
					{
						if (($obj[$k] === undefined) || ($obj[$k] === null)) // yes! ... we check on the `real` object and set with the proxy!
							// @TODO - make DProxy.MODE_POPULATE work !
							$proxy[$k] = $r_data[$k];
					}
				}
				finally
				{
					DProxy.mode = $saved_mode;
					if ($commit)
						DProxy.commit();
				}	
			}
		});
	}
	
	static _$getId($obj)
	{
		// @TODO - improve
		if (($obj === undefined) || ($obj === null))
			return undefined;
		else if (typeof($obj) === 'object')
		{
			if (Array.isArray($obj))
			{
				var $ret = [];
				for (var $i = 0; $i < $obj.length; $i++)
					$ret[$i] = DApiData._$getId($obj[$i]);
				return $ret;
			}
			else
				return $obj.Id;
		}
		else
			console.error('Trying to get the id of a non-object in `_$getId`', $obj);
		return undefined;
	}
	
	static _$filter_byid($r_data, $id_list)
	{
		if (Array.isArray($id_list) && Array.isArray($r_data))
		{
			alert('@TODO !!!');
		}
		else if (Array.isArray($r_data))
		{
			for (var $i = 0; $i < $r_data.length; $i++)
				if (DApiData._$getId($r_data[$i]) == $id_list)
					return $r_data[$i];
		}
		else if (Array.isArray($id_list))
		{
			var $r_id = DApiData._$getId($r_data);
			for (var $i = 0; $i < $id_list.length; $i++)
				if ($r_id == $id_list[$i])
					return $r_data;
		}
		else 
			return (DApiData._$getId($r_data) == $id_list) ? $r_data : null;
		return null;
	}
	
	_$reset($data)
	{
		try
		{
			var $commit = DProxy.begin();
			
			var $saved_mode = DProxy.mode;
			var $saved_recursive = DProxy.recursive;
			var $saved_by_ref = DProxy.byRef;

			DProxy.mode = DProxy.MODE_REPLACE;
			DProxy.recursive = true;
			DProxy.byRef = false;
			
			DProxyHdl.set(this.node._obj, this.property, $data, this.node.data, false, this);
			// this.node.setData($data, this.property);
			
			/*
			if (this.data[this.property] === undefined)
				this.data[this.property] = [];
			var $items = this.data[this.property];
			if ($items.length > 0)
				$items.splice(0, $items.length);
			
			for (var $i = 0; $i < $data.length; $i++)
				$items.push($data[$i]);
			 * 
			 */
		}
		finally
		{
			DProxy.mode = $saved_mode;
			DProxy.recursive = $saved_recursive;
			DProxy.byRef = $saved_by_ref;
			if ($commit)
				DProxy.commit();
		}	
	}
	
	expChanged($exp_return)
	{
		// @TODO - this is cool !
		var $this = this;
		// @TODO - a global way to do this, may be filter, order by ... etc
		var $args = {filter: this.data[$this.property] ? this.data[$this.property].filter : {}};
		$.ajax('query:' + $this.property + '@' + JSON.stringify($this.settings) + ":" + JSON.stringify($args)).then((resp) => $this._$reset(resp.data));
	}
}