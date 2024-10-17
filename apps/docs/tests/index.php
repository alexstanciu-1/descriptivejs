<?php

/**
 IF THERE IS ANY CHANGE -> COMPILE THEM -> NIGHT BUILD
	=> on demand => compile them to a version + latest-stable
		<script type="text/javascript" src="../src/core/functions.js"></script>
		<script type="text/javascript" src="../src/core/regex.js"></script>
		<script type="text/javascript" src="../src/core/dnode.js"></script>
		<script type="text/javascript" src="../src/core/main.js"></script>
		<script type="text/javascript" src="../src/core/data-proxy.js"></script>

 */
	{
		# @TODO - only compile them when needed
	}
	

	if (isset($_GET[':request']) && ($ajax_req = $_GET[':request']))
	{
		$input_data = file_get_contents("php://input");
		$input_json = $input_data ? json_decode($input_data) : null;
		$ret_json = new stdClass();
		// action:add-to-cart', item_id).then(() => $.ajax('view:cart-popup
		list($req_type, $req_name) = explode(":", $ajax_req, 2);
		
		function ajax_add_to_cart($args) { return $args;}
		
		if ($req_type === 'action')
		{
			$func_name = "ajax_".str_replace("-", "_", $req_name);
			if (!function_exists($func_name))
				$ret_json->error = (object)["message" => "Invalid Function: " . $func_name];
			else
			{
				try
				{
					$ret_json->data = $func_name($input_json);
					$ret_json->status = "ok";
				}
				catch (Exception $ex)
				{
					$ret_json->error = (object)["message" => $ex->getMessage()];
				}
			}
		}
		else if ($req_type === 'view')
		{
			if (file_exists("views/".$req_name.".tpl"))
			{
				ob_start();
				(function ($args) use ($req_name) {
					include("views/".$req_name.".tpl");
				})($input_json);
				$ret_json->data = ob_get_clean();
			}
			else
				$ret_json->error = (object)["message" => "Invalid View: ".$req_name];
		}
		else if ($req_type === 'query')
		{
			$ret_json = (object)[
				
					'data' => [
							# 'children' => [
								['text' => 'node01 ALEX', 
									'children' => [
										['text' => 'sub-node-01 --- 01'],
										['text' => 'sub-node-01 --- 02',
											'children' => [
												['text' => 'SUB sub-node-01 --- 01'],
												['text' => 'SUB sub-node-01 --- 02']
											]
										],
										['text' => 'sub-node-01 --- 03']
									]],
								['text' => 'node02'],
								['text' => 'node03', 
									'children' => [
										['text' => 'sub-node-03 --- 01'],
										['text' => 'sub-node-03 --- 02'],
										['text' => 'sub-node-03 --- 03']
									]],
								['text' => 'node04'],
								['text' => 'node05']
						#	]
						]];
		}
		else
			$ret_json->error = (object)["message" => "Invalid Action"];

		
		header('Content-Type: application/json');
		echo json_encode($ret_json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		
		die;
	}
	else if ($_SERVER['REQUEST_METHOD'] === 'POST')
	{
		var_dump($_POST);
		die;
	}
	
?><!doctype html>
<html>
	<head>
		<title>Test</title>
		<meta charset="utf-8"/>
		
		<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
		
		<style type="text/css">
			ul {
				margin-left: 20px;
			}
		</style>
		
	</head>
	<?php
		if (!$_GET['test'])
			$_GET['test'] = 'play';
		$file = get_test_files($_GET['test']);
	?>
	<body>
		
		<div class="flex flex-row bg-gray-200">
						
			<div class="text-gray-700 bg-gray-400 px-4 py-2 m-2" style="width: 200px;">
			<?php
				$items = get_test_files();
				foreach ($items as $i)
				{
					?><li><a href='index.php?test=<?= urlencode($i) ?>'><?= htmlspecialchars(preg_replace("/[\\_\\-]+/uis", " ", $i)) ?></a></li><?php
				}
			?>
			</div>
			
			<div class="text-gray-700 px-4 py-2">
				<button id='test-set-data' class="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded" 
						
						style="float: right;">SET DATA &rrarr;</button>
				<div style="height: 20px; clear: both;"></div>
				<div class='bg-gray-400 bg-gray-400 px-4 py-2'>
					<textarea id="json_data" style="width: 800px; height: 800px; font-family: monospace; font-size: 12px;"></textarea>
				</div>
				<div class='bg-gray-400 bg-gray-400 px-4 py-2'>
					<textarea readonly style="overflow-x: scroll; white-space: pre; overflow-wrap: normal; width: 800px; height: 300px; font-family: monospace; font-size: 12px;"><?= htmlspecialchars( file_get_contents(__DIR__.'/tests/'.$file.'.tpl') ) ?></textarea>
				</div>
			</div>
			
			<div class="flex-grow text-gray-700 px-4 py-2 ">
				<button id='test-show-data' class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">&llarr; SHOW DATA</button>
				<label>Time: </label><span id="elapsed-time"></span>
				<div style="height: 20px;"></div>
				<div class='bg-gray-400 bg-gray-400 px-4 py-2'>
					<?php

						// security check !
						
						if (!$file)
							echo "No valid test selected";
						else
						{
							include(__DIR__.'/tests/'.$file.'.tpl');
							if (is_file(__DIR__.'/tests/'.$file.'.js'))
							{
								?><script type="text/javascript"> <?php readfile(__DIR__.'/tests/'.$file.'.js') ?></script><?php
							}
						}
					?>
				</div>
			</div>

			
		</div>
			
		<!-- <script type="text/javascript" src="../src/tests/data.js"></script> -->
		<!--
		<script type="text/javascript" src="../src/core/functions.js"></script>
		<script type="text/javascript" src="../src/core/regex.js"></script>
		<script type="text/javascript" src="../src/core/dnode.js"></script>
		<script type="text/javascript" src="../src/core/main.js"></script>
		<script type="text/javascript" src="../src/core/data-proxy.js"></script>
		-->
		<script type="module">
			import '/config.js';
			import '/@src/core/main.js';
			import '/@src/core/dnode.js';
			import '/@src/core/functions.js';
			import '/@src/core/url-controller.js';
			import '/@src/core/data-proxy.js';
			import '/@src/core/api-data.js';
			import '/@src/core/regex.js';
		</script>
		<?php if ($_GET['test'] === 'play') { ?>
			<script type="text/javascript" src="../src/play.js"></script>
		<?php } ?>
	</body>
	
</html>
<?php

function get_test_files(string $file = null)
{
	$ret = [];
	$items = scandir(__DIR__."/tests");
	foreach ($items as $i)
	{
		$m = null;
		if ((!preg_match("/^(.*)\\.tpl\$/uis", $i, $m)) || (!$m[1]))
			continue;
		if ($file && ($file === $m[1]))
			return $m[1];
		$ret[] = $m[1];
	}
	return $file ? null : $ret;
}

