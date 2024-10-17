<div q-data="{categories: {args: {name: ''}}}">
	<h3 style="font-weight: bold; font-size: 20px; margin: 10px 0;">I am the e-comm !</h3>
	
	<h5 style="font-weight: bold;">Categs</h5>
	
	<h3>filter name</h3>
	
	<input type="text" :@value="categories.args.name" autocomplete="off" />
	
	<div>
		The value is: <span q-text="categories?.args?.name ?? '<i>Empty</i>'" style="font-weight: bold;"></span>
	</div>
	
	<div>
		<template q-each="categ in categories.data">
			<div :data-id="categ.id">
				<a class="tree-caption" q-text="categ.name">Caption haha!</a>
			</div>
		</template>
	</div>
	
	<h5 style="font-weight: bold;">recommended_products</h5>
	<template q-each="prod in recommended_products.data">
		<div :data-id="prod.id">
			<a class="tree-caption" q-text="prod.name">Caption haha!</a>
		</div>
	</template>
	
	<h5 style="font-weight: bold;">products</h5>
	<template q-each="prod in products.data">
		<div :data-id="prod.id">
			<a class="tree-caption" q-text="prod.name">Caption haha!</a>
		</div>
	</template>
</div>
