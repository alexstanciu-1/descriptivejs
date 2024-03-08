
export const $url_def = {
	
	get: function () {
		
	},

	test: function () {
		// this is the main one ... we accept it
		return true;
	},
	
	init: function ($) {
		if (!$.ui.content)
			$.ui.content = {};
	},

	index: function ($) {
		$.ui.content.template = 'ui/misc/home.tpl';
	},

	notfound: function ($) {
		$.ui.content.template = 'ui/content/' + $.url[0] + '.js';
	},

	unload: function ($) {
		// nothing here atm
	},
	
	// CHILD URLs
	urls: {
		contact: {
			index: function ($) {
				// only if on index
				$.ui.content.template = 'ui/misc/contact.tpl';
			}
		},
		admin: {
			tag: 'admin',
			src: "ui/_url/admin.js"
		}
	}
};
