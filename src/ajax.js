

// we want to hook some data model to a API

// let's say : offers

<template q-api="offers" q-ajax=""> <!-- q-ajax will do an ajax call -->
	
</template>


// add to cart => ajax + popup
// post to page | q-post=" data to post, 'url'" | this is more like a method !

// api.get, api.save, api.merge ... etc

$.ajax('add-to-cart', $item.id
$.extract($item, 'id')

$.ajax


// /employees?lastName=Smith&age=30
// http://example.com/articles?sort=+author,-datepublished

// data nesting :: '/articles/:articleId/comments'
// /users/123/orders/0001
// Filtering:
// GET /users?country=USA
// GET /users?creation_date=2019-11-11
// GET /users?creation_date=2019-11-11

// Sorting:
// GET /users?sort=birthdate_date:asc
// GET /users?sort=birthdate_date:desc

// Paging:
// GET /users?limit=100
// GET /users?offset=2

// www.myservice.com/api/v1/posts

// pagination with : next_page_token | aka last element

// envelope response to put more data in: { data: [ ....

// http://www.example.gov/api/v1/magazines/1234.json?:fields=title,subtitle,date
// http://example.gov/magazines?:limit=25&:offset=50



