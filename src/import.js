/*
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
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
https://developer.mozilla.org/en-US/docs/Web/API/File/File

 */


function doimport (str) {
  if (globalThis.URL.createObjectURL) {
    const blob = new Blob([str], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const module = import(url)
    URL.revokeObjectURL(url) // GC objectURLs
    return module
  }
  
  const url = "data:text/javascript;base64," + btoa(moduleData)
  return import(url)
}

var moduleData = "export function hello() { console.log('hello') }"
var blob = new Blob(["export function hello() { console.log('world') }"])

doimport(moduleData).then(mod => mod.hello())

// Works with ArrayBuffers, TypedArrays, DataViews, Blob/Files 
// and strings too, that If URL.createObjectURL is supported.
doimport(blob).then(mod => mod.hello())

// ====================================================================

/** 
 * Here, we load 10 modules, /modules/module-0.js, /modules/module-1.js, etc., 
 * concurrently, and call the load functions that each one exports.
 */
Promise.all(
  Array.from({ length: 10 }).map(
    (_, index) => import(`/modules/module-${index}.js`),
  ),
).then((modules) => modules.forEach((module) => module.load()));
