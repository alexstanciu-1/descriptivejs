<?php ob_start(); ?>
<div>
	Cart Popup View !
	<textarea>
		<?= json_encode($args, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>
	</textarea>
</div>
<?php

	$html_content = ob_get_clean();
	include(__DIR__.'/popup-wrap.tpl');
