
var $Keywords = {'null': 'null', 'true': 'true', 'false': 'false', 'typeof': 'typeof', 'undefined': 'undefined', 'in': 'in', 'as': 'as'};
var $Digit_Min = "0".charCodeAt(0);
var $Digit_Max = "9".charCodeAt(0);

export var $Regex = {
	identifier: /(?:[^\d\W]|\$)[$\w]+|/,
	
	// for="item in items" :key="item.message"
	// for="(item, index) in items"
	// for="value in object"
	// for="(value, name) in object"
	// for="(value, name, index) in object"
	// for="n in even(set)"
	// for="n in 10"
	// items = expression | the others are : identifieres (one level) & keywords
	
	// for_split: /^\s*(\([^\)]*\)|(?:[^\d\W]|\$)[$\w]+)\s*\bin\b\s*(.*)\s*$/,
	exp_for: /^\s*(\([^\)]*\)|(?:[^\d\W]|\$)[$\w]+)\s*\bin\b\s*(.*)\s*$/,
	
	parse_for: function($string)
	{
		var $ret = $string.match(this.exp_for);
		if ((!$ret) || ($ret.length !== 3))
			return new Error('Parse error [regex:exp_for]: ' + $string);
		var $expression = $ret[2];
		var $item_name = $ret[1];
		var $key_name = null;
		var $index_name = null;
		if ($item_name[0] === '(')
		{
			var $idfs = $item_name.substr(1, $item_name.length - 2).split(/[\s\,]+/g);
			if ((!$idfs) || ($idfs.length < 1) || ($idfs.length > 3))
				return new Error('Parse error [regex:exp_for_split]: ' + $string);
			var $item_name = $idfs[0];
			var $key_name = $idfs[1];
			var $index_name = $idfs[2];
		}
		
		return [$expression, $item_name, $key_name, $index_name];
	}
};


$Regex.exp = (function()
{
	let $operators = [

		// size 4 & 3
		'>>>=', // 'ASSIGN_URSH',
		'>>=', //  'ASSIGN_RSH',
		'<<=', //  'ASSIGN_LSH',
		'>>>', //  'URSH',
		'===', //  'STRICT_EQ',
		'!==', //  'STRICT_NE',

		// size 2
		'|=', //   'ASSIGN_BITWISE_OR',
		'^=', //   'ASSIGN_BITWISE_XOR',
		'&=', //   'ASSIGN_BITWISE_AND',
		'+=', //   'ASSIGN_PLUS',
		'-=', //   'ASSIGN_MINUS',
		'*=', //   'ASSIGN_MUL',
		'/=', //   'ASSIGN_DIV',
		'%=', //   'ASSIGN_MOD',
		'||', //   'OR',
		'&&', //   'AND',
		'==', //   'EQ',
		'!=', //   'NE',
		'<<', //   'LSH',
		'<=', //   'LE',
		'>>', //   'RSH',
		'>=', //   'GE',
		'++', //   'INCREMENT',
		'--', //   'DECREMENT',

		// size 1
		';', //    'SEMICOLON',
		',', //    'COMMA',
		'?', //    'HOOK',
		':', //    'COLON',
		'|', //    'BITWISE_OR',
		'^', //    'BITWISE_XOR',
		'&', //    'BITWISE_AND',
		'=', //    'ASSIGN',
		'<', //    'LT',
		'>', //    'GT',
		'+', //    'PLUS',
		'-', //    'MINUS',
		'*', //    'MUL',
		'/', //    'DIV',
		'%', //    'MOD',
		'!', //    'NOT',
		'~', //    'BITWISE_NOT',
		'.', //    'DOT',
		'[', //    'LEFT_BRACKET',
		']', //    'RIGHT_BRACKET',
		'{', //    'LEFT_CURLY',
		'}', //    'RIGHT_CURLY',
		'(', //    'LEFT_PAREN',
		')', //    'RIGHT_PAREN'
	];

	let $ops_regex = "";
	for (var $i = 0; $i < $operators.length; $i++)
		$ops_regex += $operators[$i].replace(/[?|^&(){}\[\]+\-*\/\.]/g, '\\$&') + "|";

	let $keywords_regex = "";
	for (var $keyword in $Keywords)
		$keywords_regex += $keyword.replace(/[?|^&(){}\[\]+\-*\/\.]/g, '\\$&') + "|";


	var $reg_exp = new RegExp([

		// help on some regex: https://gist.github.com/BonsaiDen/1810887

		/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|/, 						// strings
		/\/(?:(?:\\.|\[(?:\\.|[^\]])*\]|[^\/])+)\/(?:[gimy]*)|/, 		// regex

		// Keywords
		new RegExp($keywords_regex),

		// int & float
		/\d+\.\d*(?:[eE][-+]?\d+)?|\d+(?:\.\d*)?[eE][-+]?\d+|\.\d+(?:[eE][-+]?\d+)?|/, 	// float 
		/0[xX][\da-fA-F]+|0[0-7]*|\d+|/,													// int

		// identifiers
		$Regex.identifier,

		// OPERATORS
		new RegExp($ops_regex),

		// whitespace
		/\s+/

		].map(r => r.source).join(''), "g");

	return $reg_exp;

})();
