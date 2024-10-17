
const process = {
	
	version: 1.0,
	serialize_definition: false, // not implemented, save definition once the process has started and re-use it , should be the default
	compatible: [0.9, 1.0], // not implemented , @TODO
	// some kind of saved state ... so we can resume it at any time ...
	// starts with a button ... links to a session ... or something ...
	
	tag: 'auth/register',
	
	// security : required permissions to do run this project ... vs input data
	
	// @TODO - make input read-only, copy input so we loose any refs (if not already from JSON or something)
	input: {
		session_id: undefined
	},
	// @model-like implementation
	data: {
		something_to_test: 123
	},
	// @model-like implementation
	return: {
		success: undefined,
		user_id: undefined
	},
	
	error: undefined,
	
	// success / error
	
	get_id: function ($input) {
		return $input.session_id;
	},
	
	run: function () { // $session_id must be some kind of identifier
		// 
	},
	
	finish: function () {
		// alert('finishfinishfinish');
	},
	
	steps: {
		
		send_confirm_email_teeest: {
			
			run: function () {
				// do a send email
			},
			
			steps: {
				test_01: {
					run: function () {
						// some test logging #1
					}
				},
				
				test_goto: {
					test: function ($step) {
						// we could increment a value, if higher than 10 do not execute the step, else increment and return true
						return (($step?.data?.gotoincr ?? ($step.data.gotoincr = 0)) > 10) ? false : ((++$step.data.gotoincr) ? true : true);
					},
					goto: 'test_01',
					run: function () {
						console.log('test_goto :: run');
					}
				},
				
				test_src: {
					src: "./test_src.js"
				},
				test_02: {
					mandatory: false, // true by default
					run: function () {
						// some test logging #2
					}
				}
			}
		},
		
		check_human: {
			wait: "./check_human",
			repeatable: true,
			mandatory: true, // true by default
			async: false, // false by default, @TODO - not implemented, if async ... we do not wait for it to finish ... we continue with the other steps and join later before we finish
			run: function ($step, $proc, $wait) {
				if (!$wait.is_human)
					console.log('not human');
				else
					console.log('is human !');
			}
		},
		fill_reg_form: {
			wait: "./fill_reg_form",
			run: async function ($step, $proc, $wait, $) {
				// record the form data and link it to the proc
				
				const $resp = await $.api('/@e-comm/apis/default.js', {
					prop: "users",
					// call: "some-func-call",
					args: {'form' : $wait}});
				
				console.log('zaaa API resp', $resp);
				console.log('fill_reg_form !', $wait);
			}
		},
		send_confirm_email: {
			
			run: function () {
				// do a send email
			},
			
			steps: {
				test_01: {
					run: function () {
						// some test logging #1
					}
				},
				test_02: {
					mandatory: false, // true by default
					run: function () {
						// some test logging #2
					}
				}
			}
		},
		confirm: {
			wait: "./confirm"
		},
		activate: {
			run: function () {
				// call db activate
			}
		}
	}
	
/*

- create a instance for this process
- a check & a merge by ... to resume process

1. are you human (google invisible captcha ?!)
2. fill a form
3. submit the form
4. confirm email
5. 

*/
};

export default process;

/*
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
function saveInput(){
  console.log('Saving data');
}
const processChange = debounce(() => saveInput());
 */
