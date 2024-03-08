<?php

declare(strict_types=1);

$server = '127.0.0.1';
$port = 9999;

if(!($sock = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP)))
{
	$errorcode = socket_last_error();
    $errormsg = socket_strerror($errorcode);
    
    die("Couldn't create socket: [$errorcode] $errormsg \n");
}

socket_set_nonblock($sock);
socket_set_option($sock, SOL_SOCKET, SO_BROADCAST, 1);
socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, 1);
if (defined('SO_REUSEPORT'))
	socket_set_option($sock, SOL_SOCKET, SO_REUSEPORT, 1);

echo "Socket created \n";

// Communication loop
# while(1)
$t1 = microtime(true);
for ($i = 0; $i < 100000; $i++)
{
	//Take some input to send
	# echo 'Enter a message to send : ';
	$input = (string)random_int(100, 999);
	
	//Send the message to the server
	if( ! socket_sendto($sock, $input , strlen($input) , 0 , $server , $port))
	{
		$errorcode = socket_last_error();
		$errormsg = socket_strerror($errorcode);
		
		die("Could not send data: [$errorcode] $errormsg \n");
	}
		
	//Now receive reply from server and print it
	/*
	if(socket_recv ( $sock , $reply , 2045 , MSG_WAITALL ) === FALSE)
	{
		$errorcode = socket_last_error();
		$errormsg = socket_strerror($errorcode);
		
		die("Could not receive data: [$errorcode] $errormsg \n");
	}
	*/
	# echo "Reply : {$reply}\n";
}
$t2 = microtime(true);

echo "Done in: ", ($t2 - $t1)*1000, " ms\n\n"; 

/*
$file = "unix://myserver.sock";

$fp = stream_socket_client($file, $errno, $errstr, 30);
if (!$fp) {
    echo "$errstr ($errno)<br />\n";
}
else
{
	$closed = false;
	
	$t0 = microtime(true);
	for ($i = 0; $i < 100000; $i++)
	{
		$fwl = fwrite($fp, random_int(1, 1000)."\n");
		# echo $fwl."\n";
		$rcv = fgets($fp);
		# echo $rcv;
		if (!(int)$rcv)
		{
			fclose($conn);
			$closed = true;
			break;
		}
	}
	$t1 = microtime(true);
	
	if (!$closed)
	{
		fwrite($fp, "0\n");
	}
    
    fclose($fp);
	
	echo "Done in: ", ($t1 - $t0)*1000, " ms\n\n";
}
*/

