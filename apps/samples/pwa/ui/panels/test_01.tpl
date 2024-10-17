<div>
	
	<div q-data="{data: {firstname: 'intial'}}">
		<h4>Input type=text</h4>
		<input type="text" name="firstname" q-model="data.firstname" autocomplete="off" />
		<div>
			Data:
			<span q-text='data.firstname'></span>
		</div>
	</div>
	
	<hr/>
	<br/>
	<hr/>
	
	<div q-data="{data: {the_option: 'Two'}}">
		<h4>Input type=radio</h4>
			
			<input type="radio" id="one" name="the_option" value="One" q-model="data.the_option" autocomplete="off" />
			<label for="one">One</label>
			<br/>
			<input type="radio" id="two" name="the_option" value="Two" q-model="data.the_option" autocomplete="off" />
			<label for="two">Two</label>

		<div>
			Data:
			<span q-text='data.the_option'></span>
		</div>
	</div>
	
	<hr/>
	<br/>
	<hr/>
	
	<div q-data="{data: {checked: true}}">
		<h4>Input type=checkbox</h4>
			
			<input type="checkbox" id="one" name="the_option" value="1" q-model="data.checked" autocomplete="off" />
			
		<div>
			Data:
			<span q-text='data.checked ? "checked" : "not-checked"'></span>
		</div>
	</div>
	
	<hr/>
	<br/>
	<hr/>
	
	<div q-data="{data: {firstname: 'intial'}}">
		<h4>Input type=text</h4>
		<textarea name="firstname" q-model="data.firstname" autocomplete="off"></textarea>
		<div>
			Data:
			<span q-text='data.firstname'></span>
		</div>
	</div>
	
	<hr/>
	<br/>
	<hr/>
	
	<div q-data="{data: {selected: 'B'}}">
		<h4>Input type=select</h4>
			
			<select q-model="data.selected">
				<option disabled value="">Please select one</option>
				<option>A</option>
				<option>B</option>
				<option>C</option>
			  </select>
			
		<div>
			Data:
			<span q-text='data.selected'></span>
		</div>
	</div>
	
	<hr/>
	<hr/>
	
</div>
