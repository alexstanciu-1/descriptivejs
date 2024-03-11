<ul>
	<template q-each="child in children">
		<li class="tree-node">
			<a class="tree-caption" q-text="child.text">Caption haha!</a>
			<ul q-if='child.children'>
				<template q-each="sub_child in child.children">
					<li class="tree-node">
						<a class="tree-caption" q-text="sub_child.text">Caption haha!</a>
						<ul q-if='sub_child.children'>
							<template q-each="sub_sub_child in sub_child.children">
								<li class="tree-node">
									<a class="tree-caption" q-text="sub_sub_child.text">Caption haha!</a>
								</li>
							</template>
						</ul>
					</li>
				</template>
			</ul>
		</li>
	</template>
</ul>
