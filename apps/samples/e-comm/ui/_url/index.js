
export const $url_def = {
	
	get: function () {
		
	},

	test: function () {
		// this is the main one ... we accept it
		return true;
	},
	
	init: function ($, $args) {
		// console.log(this.args);
		// alert('this.args: ' + this.args);
		if (!$.ui.content)
			$.ui.content = {};
	},

	index: function ($) {
		
		$.ui.content.template = this.rel + 'ui/base/home.tpl';
		return true;
	},

	notfound: function ($) {
		// $.ui.content.template = 'ui/content/' + $.request.url[0] + '.js';
		alert('e-comm not found!');
	},

	unload: function ($) {
		// nothing here atm
	},
	
	// Child URLs
	urls: {
		// 
	}
};
