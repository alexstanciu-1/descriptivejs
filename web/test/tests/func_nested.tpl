
<div>
	<h5>Call Nested</h5>
	
	<template q-func="misc_func($data)">
		<ul>
			<li>
				<span q-text="$data.text"></span>
				<template q-if="$data.item">
					<div>
						<div>THE Gap</div>
						<template q-call="misc_func($data.item)"></template>
					</div>
				</template>
			</li>
		</ul>
	</template>
	
	<template q-call="misc_func(data)"></template>
	
</div>
