<div class='tree-wrapper'>
	<template class="func_tree_list" q-func="tree_list(children)" q-call >
		<ul class="tree-list">
			<template q-each="child in children">
				<li class="tree-node">
					<a class="tree-caption" q-text="child.text">Caption haha!</a>
					<template q-call='tree_list(child.children)'></template>
				</li>
			</template>
		</ul>
	</template>
</div>
