
<div>
	<h3>Test Binds</h3>
	
	<input type="text" :@value="test_binds" autocomplete="off" />
	
	<div>
		The value is: <span q-text="test_binds ? test_binds : '<i>Empty</i>'" style="font-weight: bold;"></span>
	</div>
	
</div>
