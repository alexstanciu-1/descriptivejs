
// import {$} from 'https://js-dev.descriptive.app/src/core/functions.js';

const $ = window.$;

// alert($);

window.onload = function() {

	var $highlightjs = document.querySelectorAll(".highlightjs");
	for (var $i = 0; $i < ($highlightjs ? $highlightjs.length : 0); $i++)
	{
		var $lang = $highlightjs[$i].dataset.highlightjsLang;
		var $str = $highlightjs[$i].childNodes[0].nodeValue.replace('<!~~', '<!--').replace('~~>', '-->').trim();
		$highlightjs[$i].innerHTML = hljs.highlight($str, {language: $lang}).value;
	}
	
	/*
	// for fun only ...
	setTimeout(function (){
		$.request.url[0] = 'quick-start';
	}, 1700);
	*/
};

/*
// DO A JS import(...) from a string ... this way we could bundle more modules in a single load
function doimport (str) {
  if (globalThis.URL.createObjectURL) {
    const blob = new Blob([str], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const module = import(url)
    URL.revokeObjectURL(url) // GC objectURLs
    return module
  }
  
 */
