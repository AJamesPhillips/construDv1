/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.



//$(function () {    
	
	// define the single global variable, CSD for the application Javascript
	if (typeof(CSD)=="undefined") {
    	CSD = {	data: {},
        		model: {},
    			data_manager: {},
    			views: {},
    			views_helper: {},
    			views_manager: {},
    			views_data: {to_display: [],
    						 rendered: []},
    			controller: {},
    			routes: {},
    			helper: {}
    			};
    	CSD.dm = CSD.data_manager; // set alias for data_manager as dm
    };
	


//############################### 
//###############################    CONTROLLER & ROUTES   
//############################### 

	CSD.controller.display_discussion = function() {

		CSD.views.show_view();
		
	}; //  end of   CSD.controller.display_discussion
	
	
	
	CSD.helper.call_provided_function = function (function_to_call) {
		var debugging_info__function_calling_from;// = "The function was called from the top!";
		if (CSD.helper.call_provided_function.caller === null) {
			debugging_info__function_calling_from = "The function was called from the top!";
		} else {
			debugging_info__function_calling_from = "This function's caller was " + CSD.helper.call_provided_function.caller;
		}
		
		if (arguments.callee.caller === null) {
			debugging_info__function_calling_from = "The function was called from the top!";
		} else {
			debugging_info__function_calling_from = "This function's caller was " + arguments.callee.caller;
		}
		
		console.log('debugging_info__function_calling_from = ' + debugging_info__function_calling_from);
		
		if (typeof function_to_call === 'function') {
			function_to_call();
		} else {
			throw {
				name: 'no function to call',
				message: "the typeof 'function_to_call_once_data_is_available' = " + (typeof function_to_call) + " #in " + debugging_info__function_calling_from
			};
		}
	};
	
//});




