<ul>
	<!-- <span v-for='(item, key, index) in product' :key='key'> -->
	<template q-each="child in children" :key='child.level, child.text'>
		<li class="tree-node">
			<a class="tree-caption" q-text="child.text">Caption haha!</a> - Level: <span q-text="child.level"></span>
		</li>
	</template>
</ul>