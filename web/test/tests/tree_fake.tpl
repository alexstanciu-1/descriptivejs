<div class='tree-wrapper' contenteditable="true">
	<template class="func_tree_list" q-func="tree_list(children, depth)" q-call='tree_list(data.children, data.depth)' >
		<template q-each="child in children">
			<div>
				<div class="tree-node" :style="{paddingLeft: 'px'}"><a class="tree-caption" q-text="child.text">Caption haha!</a></div>
				<template q-call='tree_list(child.children, depth)'></template>
			</div>
		</template>
	</template>
</div>
