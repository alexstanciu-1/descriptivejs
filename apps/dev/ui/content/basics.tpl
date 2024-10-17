<div>
	<h1>Basics</h1>

	<h2>Data</h2>

	<p>we need a bit more info here ... and it should not be first
		<br/>... also explain that this will create/setup a new data context
		<br/>... be-aware of how it is nested ... only available on sub-elements
	</p>


	<p>Setting some reactive data.</p>

	<table>
		<tr><th>Sample</th><th>Demo</th></tr>
		<tr><td style="vertical-align: top;">
			</td><td style="vertical-align: top;">
	<div q-data="{myText: 'This text was added in !', myTitle: 'Nice title !'}">

	</div>
			</td>
		</tr>
	</table>

	<!-- ---------------------------------------------------------------- -->
	<hr />

	<h2>Text</h2>

	<table>
		<tr><th>Sample</th><th>Demo</th></tr>
		<tr><td style="vertical-align: top;">
	<code>

	</code>
			</td><td style="vertical-align: top;">
	<div>
		<input type="text" :@value="test_binds" autocomplete="off" />
		<div>
			The value is: <span q-text="test_binds ? test_binds : '<i>Empty</i>'" style="font-weight: bold;"></span>
		</div>
	</div>
			</td>
		</tr>
	</table>

	<!-- ---------------------------------------------------------------- -->
	<hr />

	<h2>HTML</h2>

	<table>
		<tr><th>Sample</th><th>Demo</th></tr>
		<tr><td style="vertical-align: top;">
	<code>

	</code>
			</td><td style="vertical-align: top;">
	<div q-data="{test_binds_2: 'test <b>aaaa</b>'}">
		<input type="text" :@value="test_binds_2" autocomplete="off" />
		<div>
			<span q-html="test_binds_2 ? test_binds_2 : '<i>Empty</i>'"></span>
		</div>
	</div>
			</td>
		</tr>
	</table>

	<!-- ---------------------------------------------------------------- -->
	<hr />

	<h2>HTML TEXTAREA</h2>

	<table>
		<tr><th>Sample</th><th>Demo</th></tr>
		<tr><td style="vertical-align: top;">
	<code>

	</code>
			</td><td style="vertical-align: top;">
	<div q-data="{test_binds_3: 'test <b>aaaa</b>'}">
		<textarea q-model="test_binds_3" autocomplete="off"></textarea>
		<div>
			<span q-html="test_binds_3 ? test_binds_3 : '<i>Empty</i>'"></span>
		</div>
	</div>
			</td>
		</tr>
	</table>

	<!-- ---------------------------------------------------------------- -->
	<hr />
	<h2>Attributes</h2>

	<table>
		<tr><th>Sample</th><th>Demo</th></tr>
		<tr><td style="vertical-align: top;">
	<code>

	</code>
			</td><td style="vertical-align: top;">
	<div :title='myTitle' q-data="{myTitle: 'Nice title !'}">
		Hover to see title.
	</div>
			</td>
		</tr>
	</table>

	<!-- ---------------------------------------------------------------- -->
	<hr />
</div>