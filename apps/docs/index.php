<!doctype html>
<html>
<head>
	<title>Descriptive JS docs</title>
    <meta name="description" content="Descriptive JS docs" />

	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	
	<base href="/" />
	
</head>
<body>

	<template q-tpl="./ui/struct/header.tpl"></template>
	<div class="flex flex-row bg-gray-200">
		<template q-tpl="./ui/struct/menu.tpl"></template>
		<div class="text-gray-700 px-4 py-2 flex-grow">
			<template :q-tpl="$.ui?.content?.template"></template>
		</div>
	</div>
	<template q-tpl="./ui/struct/footer.tpl"></template>
	
	<script type="importmap"><?= file_get_contents(".public/temp/importmap.json"); ?></script>
	
	<!-- <script src="/.public/temp/files_state.js"></script> -->
	<script type="module">
		import '/config.js';
		import '/@src/core/main.js';
		import '/@src/core/dnode.js';
		import '/@src/core/functions.js';
		import '/@src/core/url-controller.js';
		import '/@src/core/data-proxy.js';
		import '/@src/core/api-data.js';
		import '/@src/core/regex.js';
		
		import '/ui/_url/index.js';
		import '/ui/res/script.js';
	</script>
	
	<!-- test-only -->
	
	<div class="thingstocache">
		put them here
	</div>
	
	<!-- globalThis.$_files_state_ = ... -->
	<script><?= file_get_contents('.public/temp/files_state.js'); ?></script>
	
	<!-- 3rd party -->
	<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
	<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
	<link href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/atom-one-light.min.css" rel="stylesheet" />
	<!-- test-only -->
	<link rel="stylesheet" href="ui/res/style.css" />

</body>
</html>
