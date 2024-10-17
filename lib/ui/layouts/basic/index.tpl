
<template q-tpl="./ui/struct/header.tpl"></template>
<div class="flex flex-row bg-gray-200">
	<template q-tpl="./ui/struct/menu.tpl"></template>
	<div class="text-gray-700 px-4 py-2 flex-grow">
		<template :q-tpl="$.ui?.content?.template"></template>
	</div>
</div>
<template q-tpl="./ui/struct/footer.tpl"></template>
