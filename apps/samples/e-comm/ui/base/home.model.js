
// alert(import.meta.resolve('./file.js'));

const model = {
	
	// validation @ fix @ mandatory @ email ... etc

	categories : {
		"@query": {
			from: "/@e-comm/apis/default.js",
			prop: "categories",
			// call: "categories",
			args: "args",
			to: "data",
		},
		args : {
			name: {},
			limit: {"@default" : [0,10]}
		},
		data : {
			"@type": 'array',
			"@set": function ($data, $key) {
				// console.log($data, $key);
				//if ($key === 0)
				//	$data.name = "first : " + $data.name;
				return $data;
			},
			
			name: {
				"@set": function ($data, $prop) {
					return $data + " @via.setter";
				}
			}
		}
	},
	
	recommended_products : {
		args : {
			limit: {
				'@type': 'array',
				'@set': function ($data) {
					// alert('I got called!');
					return [(typeof($data[0]) === 'string') ? parseInt($data[0]) : $data[0], 
							(typeof($data[1]) === 'string') ? parseInt($data[1]) : $data[1]];
				},
				'@default' : [0,10], 
			},
			recommended : true
		},
		data : {
			"@type": 'array',
			"@get" : {
				"@api" : "api.js",
				"url" : "/api/products",
				"args" : {
					"@selector" : "@TODO, this would be great!",
					"@value" : "recommended_products.args"
				}
			},
			
			name: {
				"@set": function ($data, $key) {
					// console.log($data, $key);
					//if ($key === 0)
					//	$data.name = "first : " + $data.name;
					return $data + " : @" + (new Date()).toLocaleTimeString();
				}
			}
			
			/*,
			"@set" : {
				"@TODO" : "idea only here !",
				url : "/api/products",
				method : "POST",
				args : "{'action' : 'set', 'data' : recommended_products.data}"
			}*/
		},
		
		misc : {
			"@get" : {
				call : "some-kind-of-call",
				ips : "inter-process-comm",
				uds : "Unix domain sockets - winner !!!",
				dll : "not-sure-is-possible",
				WebAssembly : "WebAssembly",
				misc : ""
			}
		}
	},
	
	products : {
		data: {
			name: {
				"@set": function ($data, $key) {
					// console.log($data, $key);
					//if ($key === 0)
					//	$data.name = "first : " + $data.name;
					return $data + " : @" + (new Date()).toLocaleTimeString();
				}
			}
		}
	}
};

export default model;
