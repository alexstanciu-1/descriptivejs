<?php

/**
 * @TODO 
 *		- ?? caching resources on the public dir and expire them at some point ?! (we will need a cron to refresh them)
 * 
 */

Q_Descriptive_Server_Side::run();

final class Q_Descriptive_Server_Side
{
	protected static $dev_mode = false;
	
	public static function run_config_setup()
	{
		$cfg_private_txt = file_get_contents("config.private.json") ?: "{}";
		$cfg_private = json_decode($cfg_private_txt, true);
		$main_dir = getcwd()."/";
		$dirs = $cfg_private['app_dirs'] ?? [];
		
		foreach ($dirs as &$d)
		{
			$rp = realpath($d);
			if (!is_dir($rp))
			{
				http_response_code(500);
				echo "Missing config [private] dir";
				exit;
			}
			$d = $rp."/";
			unset($rp, $d);
		}
		
		return [$main_dir, $dirs, $cfg_private];
	}
	
	public static function run()
	{
		list($main_dir, $dirs, $cfg_private) = static::run_config_setup();
		
		$or = $_GET['__or__'] ?? '';
		$or_trim = trim($or, "\\/");
		
		# step 1. establish dir
		$matched = 0;
		$dir = $main_dir;
		$matched_len = 0;
		$rel_or = $or;
		
		if ($or_trim[0] === '@')
		{
			$m = null;
			$rc = preg_match('/^\@([^\/]+)/uis', $or_trim, $m);
			if ($rc && ($tag = ($m[1] ?? null)) && ($path = ($dirs[$m[1]] ?? null)))
			{
				$matched = $tag;
				$tag_trim = (!empty($tag)) ? trim($tag, "\\/") : $tag;
				$matched_len = strlen($tag);
				$dir = $path;
				# remove @
				$or_trim = substr($or_trim, 1);
				
				if (!empty($tag_trim))
					$rel_or = ltrim(substr($or_trim, strlen($tag_trim)), "\\/");
			}
		}
		
		$cache_control = null;
		
		{
			// Handle version ex:  core/dnode.v_65f03f0d.js
			$m = null;
			$rc = preg_match('/^(.*)\.v\_([0-9a-fA-F]+)(?:\.([^\.]+)|$)$/uis', $rel_or, $m);
			if ($rc && isset($m))
			{
				$rel_or = $m[1] . '.' . $m[3];
				# setup cache control !
				$cache_control = 'Cache-Control: max-age='.(30 * 24 * 3600).', public';
			}
		}
		
		$requested = $dir . $rel_or;
		
		chdir($main_dir);
		
		// read config
		$config_content = file_exists($main_dir . 'config.json') ? file_get_contents($main_dir . 'config.json') : "{}";
		if ($config_content === false)
		{
			http_response_code(500);
			echo "Config read error";
			exit;
		}
		$config = json_decode($config_content, true);
		if ($config === false)
		{
			http_response_code(500);
			echo "Config JSON decode error";
			exit;
		}
		
		if (!is_file($requested))
		{
			// we only manage files/resources
			// route it via main dir's index
			$requested = $main_dir . "index.html";
			if (!is_file($requested))
				$requested = $main_dir . "index.php";
			if (!is_file($requested))
			{
				http_response_code(500);
				echo "Missing index [at root]";
				exit;
			}
		}
		
		$ext = pathinfo($requested, PATHINFO_EXTENSION);
		
		static::$dev_mode = ($di = ($cfg_private['dev_ip'] ?? null)) && ($ra = ($_SERVER['REMOTE_ADDR'] ?? null)) && ($di === $ra) && 
								((!$ext) || (['html' => true, 'php' => true,][$ext] ?? false));
		
		# run dev mode
		if (static::$dev_mode)
		{
			static::run_dev_mode($main_dir, $cfg_private, $config);
		}
		
		if (is_string($ext) && (strlen($ext) > 0))
		{
			$ext_2 = pathinfo(substr($requested, 0, - strlen($ext) - 1), PATHINFO_EXTENSION);
			if (strtolower($ext_2) === 'private')
			{
				http_response_code(403); # Forbidden
				echo "Extension is not allowed [private].";
				exit;
			}
		}
		
		if ($ext === 'php')
		{
			require $requested;
		}
		else
		{
			static::return_file($requested, $ext, $cache_control ? [$cache_control] : []);
		}
	}
	
	
	public static function return_file(string $file, string $ext = null, array $headers = [])
	{
		if ($ext === null)
			$ext = pathinfo($file, PATHINFO_EXTENSION);
		
		if (!static::allowed_ext($ext))
		{
			http_response_code(403); # Forbidden
			echo "Extension is not allowed.";
			exit;
		}

		$inf = static::ext_to_inf($ext ?? "");
		if (!$inf)
		{
			http_response_code(500);
			echo "Missing extension info for `{$ext}`";
			exit;
		}

		header('Content-Type: ' . $inf[0]);
		foreach ($headers as $h)
		{
			if (is_array($h))
				header(...$h);
			else
				header($h);
		}
		readfile($file);
	}
	
	public static function allowed_ext(string $ext)
	{
		return [
			'html'	=>	true,
			'tpl'	=>	true,
			'js'	=>	true,
			'json'	=>	true,
			'css'	=>	true,
			'png'	=>	true,
			'jpeg'	=>	true,
			'ico'	=>	true,
			'svg'	=>	true,

		][$ext] ?? false;
	}
	
	public static function ext_to_inf(string $ext)
	{
		return [

	'html'	=>	['text/html',	'HTML file'],
	'tpl'	=>	['text/html',	'TPL file'],
	'js'	=>	['application/x-javascript',	'JavaScript file'],
	'json'	=>	['application/x-json',	'JSON'],
	'css'	=>	['text/css',	'Cascading Style Sheet'],
	'png'	=>	['image/png',	'PNG'],
	'jpeg'	=>	['image/jpeg',	'JPEG image'],
	'csv'	=>	['text/csv', 'Comma separated values'],
	'bmp'	=>	['image/bmp',	'Bitmap'],
	'cod'	=>	['image/cis-cod',	'compiled source code'],
	'gif'	=>	['image/gif',	'graphic interchange format'],
	'ief'	=>	['image/ief',	'image file'],
	'jpe'	=>	['image/jpeg',	'JPEG image'],
	'jpg'	=>	['image/jpeg',	'JPEG image'],
	'jfif'	=>	['image/pipeg',	'JPEG file interchange format'],
	'svg'	=>	['image/svg+xml',	'scalable vector graphic'],
	'tif'	=>	['image/tiff',	'TIF image'],
	'tiff'	=>	['image/tiff',	'TIF image'],
	'ras'	=>	['image/x-cmu-raster',	'Sun raster graphic'],
	'cmx'	=>	['image/x-cmx',	'Corel metafile exchange image file'],
	'ico'	=>	['image/x-icon',	'icon'],
	'pnm'	=>	['image/x-portable-anymap',	'portable any map image'],
	'pbm'	=>	['image/x-portable-bitmap',	'portable bitmap image'],
	'pgm'	=>	['image/x-portable-graymap',	'portable graymap image'],
	'ppm'	=>	['image/x-portable-pixmap',	'portable pixmap image'],
	'rgb'	=>	['image/x-rgb',	'RGB bitmap'],
	'xbm'	=>	['image/x-xbitmap',	'X11 bitmap'],
	'xpm'	=>	['image/x-xpixmap',	'X11 pixmap'],
	'xwd'	=>	['image/x-xwindowdump',	'X-Windows dump image'],
	'323'	=>	['text/h323',	'H.323 internet telephony file'],
	'htm'	=>	['text/html',	'HTML file'],
	'stm'	=>	['text/html',	'Exchange streaming media file'],
	'uls'	=>	['text/iuls',	'NetMeeting user location service file'],
	'bas'	=>	['text/plain',	'BASIC source code file'],
	'c'		=>	['text/plain',	'C/C++ source code file'],
	'h'		=>	['text/plain',	'C/C++/Objective C header file'],
	'txt'	=>	['text/plain',	'text file'],
	'rtx'	=>	['text/richtext',	'rich text file'],
	'sct'	=>	['text/scriptlet',	'Scitext continuous tone file'],
	'tsv'	=>	['text/tab-separated-values',	'tab separated values file'],
	'htt'	=>	['text/webviewhtml',	'hypertext template file'],
	'htc'	=>	['text/x-component',	'HTML component file'],
	'etx'	=>	['text/x-setext',	'TeX font encoding file'],
	'vcf'	=>	['text/x-vcard',	'vCard file'],
	'evy'	=>	['application/envoy',	'Corel Envoy'],
	'fif'	=>	['application/fractals',	'fractal image file'],
	'spl'	=>	['application/futuresplash',	'Windows print spool file'],
	'hta'	=>	['application/hta',	'HTML application'],
	'acx'	=>	['application/internet-property-stream',	'Atari ST Program'],
	'hqx'	=>	['application/mac-binhex40',	'BinHex encoded file'],
	'doc'	=>	['application/msword',	'Word document'],
	'dot'	=>	['application/msword',	'Word document template'],
	'*'		=>	['application/octet-stream',	'Binary file'],
	'bin'	=>	['application/octet-stream',	'binary disk image'],
	'class'	=>	['application/octet-stream',	'Java class file'],
	'dms'	=>	['application/octet-stream',	'Disk Masher image'],
	'exe'	=>	['application/octet-stream',	'executable file'],
	'lha'	=>	['application/octet-stream',	'LHARC compressed archive'],
	'lzh'	=>	['application/octet-stream',	'LZH compressed file'],
	'oda'	=>	['application/oda',	'CALS raster image'],
	'axs'	=>	['application/olescript',	'ActiveX script'],
	'pdf'	=>	['application/pdf',	'Acrobat file'],
	'prf'	=>	['application/pics-rules',	'Outlook profile file'],
	'p10'	=>	['application/pkcs10',	'certificate request file'],
	'crl'	=>	['application/pkix-crl',	'certificate revocation list file'],
	'ai'	=>	['application/postscript',	'Adobe Illustrator file'],
	'eps'	=>	['application/postscript',	'postscript file'],
	'ps'	=>	['application/postscript',	'postscript file'],
	'rtf'	=>	['application/rtf',	'rich text format file'],
	'setpay'=>	['application/set-payment-initiation',	'set payment initiation'],
	'setreg'=>	['application/set-registration-initiation',	'set registration initiation'],
	'xla'	=>	['application/vnd.ms-excel',	'Excel Add-in file'],
	'xlc'	=>	['application/vnd.ms-excel',	'Excel chart'],
	'xlm'	=>	['application/vnd.ms-excel',	'Excel macro'],
	'xls'	=>	['application/vnd.ms-excel',	'Excel spreadsheet'],
	'xlt'	=>	['application/vnd.ms-excel',	'Excel template'],
	'xlw'	=>	['application/vnd.ms-excel',	'Excel workspace'],
	'msg'	=>	['application/vnd.ms-outlook',	'Outlook mail message'],
	'sst'	=>	['application/vnd.ms-pkicertstore',	'serialized certificate store file'],
	'cat'	=>	['application/vnd.ms-pkiseccat',	'Windows catalog file'],
	'stl'	=>	['application/vnd.ms-pkistl',	'stereolithography file'],
	'pot'	=>	['application/vnd.ms-powerpoint',	'PowerPoint template'],
	'pps'	=>	['application/vnd.ms-powerpoint',	'PowerPoint slide show'],
	'ppt'	=>	['application/vnd.ms-powerpoint',	'PowerPoint presentation'],
	'mpp'	=>	['application/vnd.ms-project',	'Microsoft Project file'],
	'wcm'	=>	['application/vnd.ms-works',	'WordPerfect macro'],
	'wdb'	=>	['application/vnd.ms-works',	'Microsoft Works database'],
	'wks'	=>	['application/vnd.ms-works',	'Microsoft Works spreadsheet'],
	'wps'	=>	['application/vnd.ms-works',	'Microsoft Works word processor document'],
	'hlp'	=>	['application/winhlp',	'Windows help file'],
	'bcpio'	=>	['application/x-bcpio',	'binary CPIO archive'],
	'cdf'	=>	['application/x-cdf',	'computable document format file'],
	'z'		=>	['application/x-compress',	'Unix compressed file'],
	'tgz'	=>	['application/x-compressed',	'gzipped tar file'],
	'cpio'	=>	['application/x-cpio',	'Unix CPIO archive'],
	'csh'	=>	['application/x-csh',	'Photoshop custom shapes file'],
	'dcr'	=>	['application/x-director',	'Kodak RAW image file'],
	'dir'	=>	['application/x-director',	'Adobe Director movie'],
	'dxr'	=>	['application/x-director',	'Macromedia Director movie'],
	'dvi'	=>	['application/x-dvi',	'device independent format file'],
	'gtar'	=>	['application/x-gtar',	'Gnu tar archive'],
	'gz'	=>	['application/x-gzip',	'Gnu zipped archive'],
	'hdf'	=>	['application/x-hdf',	'hierarchical data format file'],
	'ins'	=>	['application/x-internet-signup',	'internet settings file'],
	'isp'	=>	['application/x-internet-signup',	'IIS internet service provider settings'],
	'iii'	=>	['application/x-iphone',	'ARC+ architectural file'],
	'latex'	=>	['application/x-latex',	'LaTex document'],
	'mdb'	=>	['application/x-msaccess',	'Microsoft Access database'],
	'crd'	=>	['application/x-mscardfile',	'Windows CardSpace file'],
	'clp'	=>	['application/x-msclip',	'CrazyTalk clip file'],
	'dll'	=>	['application/x-msdownload',	'dynamic link library'],
	'm13'	=>	['application/x-msmediaview',	'Microsoft media viewer file'],
	'm14'	=>	['application/x-msmediaview',	'Steuer2001 file'],
	'mvb'	=>	['application/x-msmediaview',	'multimedia viewer book source file'],
	'wmf'	=>	['application/x-msmetafile',	'Windows meta file'],
	'mny'	=>	['application/x-msmoney',	'Microsoft Money file'],
	'pub'	=>	['application/x-mspublisher',	'Microsoft Publisher file'],
	'scd'	=>	['application/x-msschedule',	'Turbo Tax tax schedule list'],
	'trm'	=>	['application/x-msterminal',	'FTR media file'],
	'wri'	=>	['application/x-mswrite',	'Microsoft Write file'],
	'cdf'	=>	['application/x-netcdf',	'computable document format file'],
	'nc'	=>	['application/x-netcdf',	'Mastercam numerical control file'],
	'pma'	=>	['application/x-perfmon',	'MSX computers archive format'],
	'pmc'	=>	['application/x-perfmon',	'performance monitor counter file'],
	'pml'	=>	['application/x-perfmon',	'process monitor log file'],
	'pmr'	=>	['application/x-perfmon',	'Avid persistent media record file'],
	'pmw'	=>	['application/x-perfmon',	'Pegasus Mail draft stored message'],
	'p12'	=>	['application/x-pkcs12',	'personal information exchange file'],
	'pfx'	=>	['application/x-pkcs12',	'PKCS #12 certificate file'],
	'p7b'	=>	['application/x-pkcs7-certificates',	'PKCS #7 certificate file'],
	'spc'	=>	['application/x-pkcs7-certificates',	'software publisher certificate file'],
	'p7r'	=>	['application/x-pkcs7-certreqresp',	'certificate request response file'],
	'p7c'	=>	['application/x-pkcs7-mime',	'PKCS #7 certificate file'],
	'p7m'	=>	['application/x-pkcs7-mime',	'digitally encrypted message'],
	'p7s'	=>	['application/x-pkcs7-signature',	'digitally signed email message'],
	'sh'	=>	['application/x-sh',	'Bash shell script'],
	'shar'	=>	['application/x-shar',	'Unix shar archive'],
	'swf'	=>	['application/x-shockwave-flash',	'Flash file'],
	'sit'	=>	['application/x-stuffit',	'Stuffit archive file'],
	'sv4cpio'=>	['application/x-sv4cpio',	'system 5 release 4 CPIO file'],
	'sv4crc'=>	['application/x-sv4crc',	'system 5 release 4 CPIO checksum data'],
	'tar'	=>	['application/x-tar',	'consolidated Unix file archive'],
	'tcl'	=>	['application/x-tcl',	'Tcl script'],
	'tex'	=>	['application/x-tex',	'LaTeX source document'],
	'texi'	=>	['application/x-texinfo',	'LaTeX info document'],
	'texinfo'=>	['application/x-texinfo',	'LaTeX info document'],
	'roff'	=>	['application/x-troff',	'unformatted manual page'],
	't'		=>	['application/x-troff',	'Turing source code file'],
	'tr'	=>	['application/x-troff',	'TomeRaider 2 ebook file'],
	'man'	=>	['application/x-troff-man',	'Unix manual'],
	'me'	=>	['application/x-troff-me',	'readme text file'],
	'ms'	=>	['application/x-troff-ms',	'3ds Max script file'],
	'ustar'	=>	['application/x-ustar',	'uniform standard tape archive format file'],
	'src'	=>	['application/x-wais-source',	'source code'],
	'cer'	=>	['application/x-x509-ca-cert',	'internet security certificate'],
	'crt'	=>	['application/x-x509-ca-cert',	'security certificate'],
	'der'	=>	['application/x-x509-ca-cert',	'DER certificate file'],
	'pko'	=>	['application/ynd.ms-pkipko',	'public key security object'],
	'zip'	=>	['application/zip',	'zipped file'],
	'woff'	=>	['application/x-font-woff', 'woff font'],

		][$ext] ?? null;
	}
	
	public static function run_dev_mode(string $main_dir, array $cfg_private, array $config = [])
	{
		# in dev mode we can throw exceptions !
		
		$inf = [];
		$incl_ext = ['js' => true, 'tpl' => true, 'css' => true, 'json' => true, 'html' => true, 
					'ico' => true, 'png' => true, 'jpeg' => true, 'jpg' => true, 'bmp' => true, 
					];
		
		$scan_dirs = [0 => $main_dir] + ($cfg_private['app_dirs'] ?? []);
		$import_map = [];
		
		foreach ($scan_dirs ?? [] as $tag => $dir)
		{
			if (!is_dir($dir))
				throw new \Exception('run_dev_mode :: not dir :: ' . $dir);
			
			// $inf[$tag]['dir'] = $dir; // we do not want to send dir
			$inf[$tag]['run_dir'] = ($tag === 0);
			
			$dir_len = strlen($dir);
			$dir_it = new \RecursiveDirectoryIterator($dir);
			foreach (new \RecursiveIteratorIterator($dir_it) as $file)
			{
				$ext = $file->getExtension();
				$file_n = substr($file->getPathname(), $dir_len);
				if ($file_n[0] === '.') # don't do any .
					continue;
				if (strtolower($ext) === 'js')
				{
					$import_file = (($tag === 0) ? '' : "@{$tag}/") . $file_n;
					$import_map["imports"]["https://js-dev.descriptive.app/".$import_file] = "./".substr($import_file, 0, -3).".v_" . dechex($file->getMTime()) . "." . $ext;
				}
				if ($incl_ext[$ext] ?? false)
				{
					$inf[$tag]['files'][$file_n] = [$file->getMTime(), $file->getSize()];
				}
			}
		}
		
		if (!is_dir(".private/temp/"))
			mkdir(".private/temp/", 0755, true);
		if (!is_dir(".public/temp/"))
			mkdir(".public/temp/", 0755, true);
		
		$enc = json_encode($inf, JSON_INVALID_UTF8_SUBSTITUTE | JSON_UNESCAPED_LINE_TERMINATORS | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		if (!$enc)
			throw new \Exception('Failed to encode $inf.');
		$rc = file_put_contents(".private/temp/files_state.json", $enc);
		if (!$rc)
			throw new \Exception('Failed to save `.private/temp/files_state.json`.');
		
		$rc = file_put_contents(".public/temp/files_state.js", "globalThis.\$_files_state_ = {$enc};");
		if (!$rc)
			throw new \Exception('Failed to save `.public/temp/files_state.js`.');
		
		$enc = json_encode($import_map, JSON_INVALID_UTF8_SUBSTITUTE | JSON_UNESCAPED_LINE_TERMINATORS | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		if (!$enc)
			throw new \Exception('Failed to encode $import_map.');
		$rc = file_put_contents(".public/temp/importmap.json", $enc);
		if (!$rc)
			throw new \Exception('Failed to save `.public/temp/importmap.json`.');
		/*
		echo "<pre>";
		var_dump($import_map, '$cfg_private', $cfg_private, $inf);
		die;
		*/
		
		static::run_dev_mode_orm($scan_dirs);
	}
	
	public static function run_dev_mode_orm(array $scan_dirs)
	{
		foreach ($scan_dirs ?? [] as $sd)
		{
			$model_files = glob($sd . "data/{*,*/*,*/*/*}.js", GLOB_BRACE);
			if ($model_files)
			{
				foreach ($model_files as $mf)
				{
					if (is_file($mf))
					{
						var_dump(realpath($mf));
						$cmd = "nodejs " . escapeshellarg(__DIR__ . "/../nodejs/model_to_json.mjs") . " " . escapeshellarg(realpath($mf));
						echo $cmd, shell_exec($cmd);
					}
					
					# var_dump( $sd, $model_files );
				}
			}
		}
		// var_dump('$scan_dirs', $scan_dirs);
		
		die;
	}
}
