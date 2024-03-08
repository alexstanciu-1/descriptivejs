<div class='tree-wrapper'>
	<template class="func_tree_list" q-func="tree_list(children)" q-call q-api-data="{children: {}}" >
		<template q-if="(children && (children.length > 0))">
			<ul class="tree-list"> <!-- q-if="children" -->

				<template q-each="child in children">
					<li class="tree-node">
						<a class="tree-caption" q-text="child.text">Caption haha!</a>
						<!-- we recurse here -->
						<template q-call='tree_list(child.children)'></template>
					</li>
				</template>
				
			</ul>
		</template>
	</template>
</div>
