
<div q-data="{count: 0}">
	<h3>Test Events</h3>
	
	<button @click="count++" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">++ Increment</button>
	<button @click="count--" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">-- Decrement</button>
	
	<div>
		It was clicked <span q-text="count" style="font-weight: bold;"></span> times.
	</div>
	
	<hr/>
	
	<div q-data="{show: false}" @click.away="show = false">
		<button @click="show = !show" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Show via IF</button>
		
		<template q-if='show'>
			<ul>
				<li>Dropdown Is Here #001</li>
				<li>Dropdown Is Here #002</li>
				<li>Dropdown Is Here #003</li>
				<li>Dropdown Is Here #004</li>
			</ul>
		</template>
		
		<div>
			Show: <span q-text="show ? 'true' : 'false'" style="font-weight: bold;"></span>.
		</div>
		
	</div>
	
	<hr/>
	
	<div q-data="{show_a: false, show_nested: false}" @click.away="show_a = false">
		<button @click="show_a = !show_a" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Show via SHOW</button>
		
		<div q-show='show_a'>
			<ul>
				<li>Dropdown Is Here #001</li>
				<li>Dropdown Is Here #002</li>
				<li @click.away="show_nested = false">Dropdown Is Here # NEST 
					<button @click="show_nested = !show_nested" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Show via SHOW NESTED</button>
					<ul q-show='show_nested'>
						<li>Sub Item #01</li>
						<li>Sub Item #02</li>
						<li>Sub Item #03</li>
						<li>Sub Item #04</li>
					</ul>
				</li>
				<li>Dropdown Is Here #003</li>
				<li>Dropdown Is Here #004</li>
			</ul>
		</div>
		
		<div>
			Show: <span q-text="show_a ? 'true' : 'false'" style="font-weight: bold;"></span>.
		</div>
		
	</div>
	
	<hr/>
	
	<div q-data="{item_id: 10}">
		
		<input type="text" :@value="item_id" autocomplete="off" />
		
		<button		@click="$.ajax('action:add-to-cart', item_id).then((resp) => $.ajax('view:cart-popup', resp.data)).then(resp => $.popup(resp.data))" 
					class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>ADD TO CART</button>
	</div>
	
	<hr/>
	
	
	<div q-data="{data: {values: [{name: 'alex'},{name: 'xxxx', deep: {deepname: 'gigi', list: [1, 2, 3]}},{name: 'yyy'}]}}">
		
		<input type="text" name="item_id" :@value="item_id" autocomplete="off" />
		
		<button		@click="$.post('', data.values, true)" 
					class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>POST</button>
	</div>
	
	<hr/>
	
	<div q-data="{item_id: 10}">
		
		<input type="text" name="item_id" :@value="item_id" autocomplete="off" />
		
		<button		@click="$.ajax('view:test-append', {}).then(resp => $.append(resp.data, $dom.parentNode))" 
					class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>APPEND</button>
	</div>
	
	<hr/>
	
	<div q-data="{item_id: 10}">
		
		<input type="text" name="item_id" :@value="item_id" autocomplete="off" />
		
		<button		@click="$.ajax('view:test-prepend', {}).then(resp => $.prepend(resp.data, $dom.parentNode))" 
					class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>PREPEND</button>
	</div>
	
	<hr/>
	
	<div q-data="{item_id: 10}">
		
		<input type="text" name="item_id" :@value="item_id" autocomplete="off" />
		
		<button		@click="$.ajax('view:test-after', {}).then(resp => $.after(resp.data, $dom))" 
					class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>AFTER</button>
	</div>
	
	<hr/>
	
	<div q-data="{item_id: 10}">
		
		<input type="text" name="item_id" :@value="item_id" autocomplete="off" />
		
		<button		@click="$.ajax('view:test-before', {}).then(resp => $.before(resp.data, $dom))" 
					class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>BEFORE</button>
	</div>
	
	<hr/>
	
	<div q-init="$.console.log('init #1'); $.console.log('init #2'); $.console.log('init #3'); ">
		Init only !
	</div>
	
	<hr/>
	
	<div :class="{'bg-color-red' : showRed, 'border-red' : borderRed }">
		<style type="text/css">
			.bg-color-red { background-color: red; }
			.border-red { border: 2px solid red; }
		</style>
		CLASS TESTING
		
		<button	@click="showRed = !showRed" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>TOGGLE BG COLOR</button>
		<button	@click="borderRed = !borderRed" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>TOGGLE BORDER</button>
		
	</div>
	
	<hr/>
	
	<div q-data="{showRed_style: '', borderRed_style: ''}" 
		 
		 :style="{backgroundColor : showRed_style, border : borderRed_style }">
		
		DOM STYLE TESTING
		
		<button	@click="showRed_style = (showRed_style === 'red' ? 'blue' : 'red')" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>TOGGLE BG COLOR</button>
		<button	@click="borderRed_style = (borderRed_style === '2px solid red' ? '2px solid yellow' : '2px solid red')" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
				>TOGGLE BORDER</button>
		
	</div>

</div>
