
<nav class="text-gray-700 bg-gray-400 px-4 py-2 m-2">
	
	<ul>
		<li><a :href='$.url.get({content: "intro"})'>Introduction - reload</a></li>
		<li><button onclick='$.url.set({content: "intro"})'>Introduction - dynamic [1]</button></li>
		<li><button onclick='$.url.set("intro")'>Introduction - dynamic [2]</button></li>
		<li><a href='quick-start'>Quick Start</a></li>
		<li>-</li>
		<li><a href='basics'>Basics</a></li>
		<li><a href='home'>Home</a></li>
		<li>-</li>
		<li>Samples
			<ul>
				<li><a href='e-comm'>e-comm</a></li>
			</ul>
		</li>
	</ul>

</nav>

