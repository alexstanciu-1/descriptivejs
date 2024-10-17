
import {$url} from '../../../src/url-controller.js';

// we need some kind of url controller config

$url({
	index: function () {
		alert('index on load ...');
	},
	
	urls: [
		
		{ // contact
		tag: 'contact',
		test: function () {},
		load: function () {
			alert('index on load ...');
		},
		
		urls: [{
			// go deeper
			get: function ($url) {  },
		}],
	}],
	
	unload: function () {
		alert('do unload ...');
	},
	
	'default': function () {
		alert('default');
		// if not handled ... will go to not found
	},
	
	notfound: function () {
		alert('notfound');
	},
	
	// @TODO - able to include controllers ...
	
	unused: {}
});
