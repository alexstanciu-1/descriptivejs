
<div>
	<h5>Call Itself</h5>
	
	<template q-func="misc_func(data)">
		<span>
			<span style="font-size: bold;">misc_func - </span>
			<span q-text="data.text"></span>
		</span>
	</template>
	
	<template q-func="tree_list(children)" q-call x-if="children" >
		<ul class="tree-list">

			<template q-each="child in children">
				<li class="tree-node">

					<a class="tree-caption" q-text="child.text">Caption haha!</a>

					<template q-call="misc_func(child)"></template>
					
				</li>
			</template>

		</ul>
	</template>
	
</div>

<div>
	
	<h5>Call Outside</h5>
	
	<template q-call="tree_list(items)"></template>
	
	<template q-call="misc_func(misc_test)"></template>
	
	
</div>
