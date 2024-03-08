<!doctype html>
<html>
	<head>
		<title>UI Test</title>
		<meta charset="utf-8"/>
		<!-- Responsive -->
		<meta name="viewport"
			  content="width=device-width,
					   initial-scale=1" />
		<meta http-equiv="X-UA-Compatible"
			  content="ie=edge" />
		
		<base href="/descriptivejs/web/" />
		
		<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
		
		<style type="text/css">
			ul {
				margin-left: 20px;
			}
		</style>
		
		<script>
			onload = (event) => { 
				// it works
				const baseHref = (document.getElementsByTagName('base')[0] || {}).href;
				// console.log(window.location);
				// alert(baseHref);
			};
		</script>
		
		<link rel="manifest" href="manifest.json" />
		
		  <!-- Meta Tags required for Progressive Web App -->
		<meta name="apple-mobile-web-app-status-bar" content="#aa7700" />
		<meta name="theme-color" content="black" />
	<body>
		
		this is a test
		<div q-data="{data: {firstname: 'intial'}}"></div>
		
		<template q-ctrl="../web/ui/panels/test_01.js" q-args="{1,2,3}"></template>
		
		<!-- wrap it between comments if more than one element ! -->
		
		<div>
			addede some text !!!
		</div>
		
		<script src="../src/core/main.js" type="module"></script>
		<script src="../web/ui/pages/index.js" type="module"></script>
		<script>
		// Script for Service Worker
		    window.addEventListener('load', () => {
				registerSW();
			  });

			  // Register the Service Worker
			  async function registerSW() {
				if ('serviceWorker' in navigator) {
				  try {
					await navigator.serviceWorker.register('serviceworker.js');
				  }
				  catch (e) {
					console.log('SW registration failed');
				  }
				}
			  }
		</script>
	</body>
</html>
