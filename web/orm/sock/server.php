<?php

declare(strict_types=1);


#   unix:///tmp/mysock
#   udg:///tmp/mysock
$lock = fopen("server.lock", "wb");
if (!flock($lock, LOCK_EX))
{
	if ($lock)
		fclose($lock);
	die("Already running.");
}

# $xportlist = stream_get_transports();
# print_r($xportlist);
# die("\n\n");

set_time_limit(60); # 60 seconds


//Create a UDP socket
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

if (file_exists('myserver.sock'))
	unlink('myserver.sock');
$file = "unix://myserver.sock";

// Bind the source address
if( !socket_bind($sock, "0.0.0.0" , 9999) )
{
	$errorcode = socket_last_error();
    $errormsg = socket_strerror($errorcode);
    
    die("Could not bind socket : [$errorcode] $errormsg \n");
}

echo "Socket bind OK \n";

$read = array($sock); $write = array($sock); $except = NULL;

//Do some communication, this loop can handle multiple clients
while(socket_select($read, $write, $except, NULL)) {
// Read received packets with a maximum size of 5120 bytes.
    while(is_string($data = socket_read($sock, 5120))) {
        # echo $data;
        # echo "rnrn";
		# socket_write($sock, $data);
    }
}

socket_close($sock);
die;

# ==========================================================================================


if (file_exists('myserver.sock'))
	unlink('myserver.sock');
$file = "unix://myserver.sock";
#if (file_exists($file))
#	unlink($file);

/*$socket = socket_create(AF_UNIX, SOCK_RAW, 0);
if (!$socket)
	die("unable to open socket!");

if (socket_bind($socket, $file) === false) {
  echo "bind failed";
}

$ok = socket_listen($socket);
if (!$ok)
	die('failed socket listen'."\n");
*/
/*
$socket = stream_socket_server($file, $errno, $errstr);
if (!$socket) {
  echo "$errstr ($errno)<br />\n";
  die;
}

# var_dump($socket);

while (($conn = stream_socket_accept($socket)))
{
	echo "Connected:\n\n";
	while (($rcv = fgets($conn)))
	{
		if (!(int)$rcv)
		{
			fclose($conn);
			break;
		}
		fwrite($conn, $rcv);
		# echo $rcv, "\n";
	}
}

fclose($socket);
*/
/*$con = 1;
while ($con == 1)
{
    $client = socket_accept($socket);
    $input = socket_read($client, 4096);

    if ($input == 'exit') 
    {
        $close = socket_close($socket);
        $con = 0;
    }

    if($con == 1)
    {
        echo $input, "\n";
    }
}*/

/*
$address = 'unix:///tmp/mysock';

$file = "/tmp/myserver.sock";
unlink($file);

$port = 7777;
$con = 1;
$word = "";

$sock = socket_create(AF_INET, SOCK_DGRAM, 0);
$bind = socket_bind($sock, $address, $port);

socket_listen($sock);

while ($con == 1)
{
    $client = socket_accept($sock);
    $input = socket_read($client, 2024);

    if ($input == 'exit') 
    {
        $close = socket_close($sock);
        $con = 0;
    }

    if($con == 1)
    {
        $word .= $input;
    }
}

echo $word;

*/

# to make it real we need a server/client setup

# select a/b/c/d/e/f/g ... from ... where 
# in paral some other thread is reading ... a/b/... from where




# where / order by / group by / having | limit

# order + limit | group + limit 

# it's all about how we do the foreach



# joining virtual data ?! ex JOIN (1,2,3,4)
	# or virtual data with ... we will see 
		# our edge will be generated code !

# have a row/column store mix-up | on 128 items ?! why not ... test different setups later on
	# configurable ofc


# SELECT **** FROM a,b,c,d WHERE conditions GROUP BY g,dp,r ORDER BY t,i,c LIMIT 10,20 | HAVING ?!
# we try to be as fast as possible ... within some resource limits
#		understand the query and apply structure paths when possible - limit complexity
#		1 worker per table/column ?! 
#		conditions may imply multiple cols, if we can split it per threads when we have AND / OR ?! should we ?!
#		1 thread per logical loop (if needed) / to limit the number of combinations
#			this will only work with AND ... on a OR condition ... meeeh
#		order by / group by / limit
#		
#		generate code -> try to loop less , prepare loop data ... somehow
#		
#		SELECT * FROM `Products` WHERE `Code` IN ('A','B','C')
#		
#		foreach (products ... as p) # point is to have the minimum | one worker foreach element | caching ... also ... if too big ... we may need to return to disk
#			if (p.code IN ('A','B','C'))
#				select(p.*)
#				
#		more of a 
#		do
#			...
#			->next
#		while ()
#		
#		1. decide the order of the while nesting 
#			bigger to smaller , while caching the smaller | small things can even be cached to code
#		2. generate code that will pull the data (cache/disk) | a one by one check will be bad ... 
#		3. generate code that will process the data
#		
#		how do we cache data ? - disk - cache - pff | transactions writes are on a different dim , once we change a value -> change DIM
#		
#		cache ... 
#		
#		table x / -> row z
#		
#		adaptive hashing | possible ... why not
#		
#		1 -> next / reset | 
#		cursor ... pointer to data in memory | 
#			cursor = current()
#			next(cursor, ...)
#			reset(cursor, ...)
#			insert(cursor, ...)
#			update(cursor, ...)
#			delete(cursor, ...)
#		

# Ids read-only by default !!! - this will help optimizing !

/*
AND, && Logical AND
NOT, ! 	Negates value
OR, || 	Logical OR
XOR 	Logical XOR 
 */


# ok ... now we need locking info

	# how do we lock data ?!
	# lock counter | if = 1 / and we hold the lock => yeee ... we can write
	# in memory !!! if too large write on disk ... abuse memory as much as possible

# ok, locks ... do we need something else ... last access ... some info to realease it from memory (row based)

# foreach (Product as $a, where , order , group , limit 
# more or less a for stack ... got anything better ?!
	# in some cases ... yes



