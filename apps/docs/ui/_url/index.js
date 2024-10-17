
export const $url_def = {
	
	get: function ($url) {
		
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
		return true;
	},

	notfound: function ($) {
		// $.ui.content.template = 'ui/content/' + $.request.url[0] + '.js';
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
		},
		
		'e-comm': {
			// tag: 'e-comm',
			args: {a: 1},
			rel: '@e-comm/',
			// src: "@e-comm:ui/_url/index.js"
			src: "@e-comm/ui/_url/index.js"
		},
		
		content: {
			
			get: function ($url, $page_name)
			{
				$url.push($page_name);
			},
			
			test: function ($c_url, $url, $pos, $) {
				// ugly, we should have a way to test if we have the page !
				if (!this.args)
					this.args = {};
				this.args.page_url = $c_url;
				return [true, $pos + 1];
			},
			
			init: function ($) {
				if (!$.ui.content)
					$.ui.content = {};
			},

			index: function ($) {
				$.ui.content.template = 'ui/content/' + this.args.page_url + '.tpl';
				return true;
			},
		}
		
	}
};
