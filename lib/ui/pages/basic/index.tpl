<head>
	<title>Descriptive JS docs</title>
    <meta name="description" content="Descriptive JS docs" />

	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	
	<base href="/" />
	
	<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/atom-one-light.min.css" />
	<link rel="stylesheet" href="ui/res/style.css" />

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
	<script type="module">
		import {$url_def} from "./ui/_url/index.js";
		window.$url_def = $url_def;
	</script>
	<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
	<script src="https://js-dev.descriptive.app/src/core/main.js" type="module"></script>
	<script src="ui/res/script.js" type="module"></script>
</body>
