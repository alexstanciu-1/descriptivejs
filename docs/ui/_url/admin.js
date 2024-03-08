
export const $url_def = {
	
	test: function () {
		// this is the main one ... we accept it
		return true;
	},

	init: function () {
		// alert('admin: init!');
	},

	index: function ($) {
		// alert('admin: index!');
		$.ui.content.template = 'ui/_admin/index.tpl';
	},

	notfound: function () {
		
	},

	unload: function () {
		
	},
	
	urls: {
		
	}
};

