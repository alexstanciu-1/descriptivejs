
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
		
		console: window.console
	};
	
// }; )();

