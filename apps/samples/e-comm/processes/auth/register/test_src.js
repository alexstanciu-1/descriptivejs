
const process = {
	
	tag: 'auth/register/test_src',
	
	run: function () {
		console.log('test_src :: run');
	},
	
	finish: function () {
		console.log('test_src :: finish');
	},
	
	steps: {
		
		test_src_01: {
			run: function ($step, $proc, $wait) {
				console.log('test_src_01');
			}
		},
		test_src_02: {
			run: function ($step, $proc, $wait) {
				// record the form data and link it to the proc
				console.log('test_src_02');
			}
		},
		test_src_03: {
			
			run: function () {
				// do a send email
				console.log('test_src_03');
			},
			
			steps: {
				test_src_03_01: {
					run: function () {
						console.log('test_src_03_01');
					}
				},
				test_src_03_02: {
					mandatory: false, // true by default
					run: function () {
						console.log('test_src_03_02');
					}
				}
			}
		},
		test_src_04: {
			run: function () {
				console.log('test_src_04');
			}
		}
	}
};

export default process;
