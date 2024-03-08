<div q-data="{aft_show: false}" style="border: 1px solid red;">
	Test After
	
	<div q-show='aft_show'>
		aft_show !
	</div>
	<button	@click="aft_show = !aft_show" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">TOGGLE aft_show</button>
</div>
