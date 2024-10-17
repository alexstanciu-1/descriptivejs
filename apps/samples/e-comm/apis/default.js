
const $api = {

	orm: true,
	
	url: '/~admins/e-comm/api',
	/*
	'@orm' : {
		url: '/~admins/e-comm/api',
		// @TODO - these files can not go public like this !
		auth_key : 'exYvidEKdHA8opBHpxklDEWrdCLF5vd8HRphJdtjHuyKfhX8EPrANlPxOaH6hYyDbHhg5FtrdRUgdEczGuYFWFdpc1a6ZjLLswQTmxvPfGlzLswwmiPDLak8gs8OsWq8'
	},
	*/
	props: {
		categories: {
			url: '',
			get: 'type=ecomm&call=ecomm-categories',
			post: {
				auth_key : 'exYvidEKdHA8opBHpxklDEWrdCLF5vd8HRphJdtjHuyKfhX8EPrANlPxOaH6hYyDbHhg5FtrdRUgdEczGuYFWFdpc1a6ZjLLswQTmxvPfGlzLswwmiPDLak8gs8OsWq8'
			}
		},
		users: {
			url: '',
			get: 'type=ecomm&call=ecomm-users',
			post: {
				auth_key : 'exYvidEKdHA8opBHpxklDEWrdCLF5vd8HRphJdtjHuyKfhX8EPrANlPxOaH6hYyDbHhg5FtrdRUgdEczGuYFWFdpc1a6ZjLLswQTmxvPfGlzLswwmiPDLak8gs8OsWq8'
			}
		}
	}
	// ?type=ecomm&call=ecomm-categories
	// login: @TODO
};

export default $api;
