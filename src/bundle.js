/*

https://blog.logrocket.com/javascript-cache-api/

Cache.put()

The Cache.put method works quite differently from the rest as it allows an extra layer of control. The put() method takes two parameters, the first can either be a URL string literal or a Request object, the second is a Response either from the network or generated within your code:

// Retrieve cats.json and cache the response
newCache.put('./cats.json')

// Create a new entry for cats.json and store the generated response
newCache.put('/cats.json', new Response('{"james": "kitten", "daniel": "kitten"}'))

// Fetch a response from an external address and create a new entry for cats.json
newCache.put('https://pets/cats.json');

<script type="importmap">
 	{
    	"imports": {
			"scripts/": "https://example.com/scripts/",
		}
	}
</script>

*/
