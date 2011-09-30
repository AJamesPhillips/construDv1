/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.


//############################### 
//###############################    CONTROLLER   
//############################### 

	CSD.controller.display_discussion = function () {
		//test to make sure we have all the necessary elements in local access
		CSD.debugging.attempts_to_run_CSD_controller_display_discussion += 1;
		if (CSD.controller.necessary_data_is_available(CSD.controller.display_discussion)) {
			//we have all the necessary elements.
			CSD.views.show_view(CSD.session.view.type);
			
			CSD.debugging.attempts_to_run_CSD_controller_display_discussion = 0;
		} else {
			console.log('waiting for necessary elements, attempts so far: "' + CSD.debugging.attempts_to_run_CSD_controller_display_discussion + '" #in CSD.controller.display_discussion');
		}
	}; //  end of   CSD.controller.display_discussion
	
	
	CSD.controller.necessary_data_is_available = function (function_to_call_once_data_is_available) {
		var array_of_required_element_ids = [];
		if (CSD.session.view.type === 'general') {
			array_of_required_element_ids = array_of_required_element_ids.concat(CSD.session.view.general.ids_in_view);
			array_of_required_element_ids.push(CSD.session.view.general.root_element_id);
		} else if (CSD.session.view.type === 'question') {
			var sides = CSD.views_manager.answer_discussion_contexts();
			sides.push('question');
			var i = 0, len = sides.length;
				var side;
			
			for (i=0; i < len; i += 1) {
				side = sides[i];
				array_of_required_element_ids = array_of_required_element_ids.concat(CSD.session.view[side].ids_in_view);
				array_of_required_element_ids = array_of_required_element_ids.concat(CSD.session.view[side].all_answer_ids);
				array_of_required_element_ids.push(CSD.session.view[side].root_element_id);
			};
		} else {
			console.log('unsupported CSD.session.view.type: "' + CSD.session.view.type + '" #in CSD.controller.display_discussion');
		}
		
		array_of_required_element_ids = array_of_required_element_ids.unique().remove(undefined);
		
		//test to make sure we have all the necessary elements in local access
		if (CSD.model.ensure_array_of_elements_are_available_or_retrieve_them_and_then_call_function( array_of_required_element_ids, CSD.views_manager.minimum_buffer_degrees_of_view(), function_to_call_once_data_is_available)) {
			return true;
		} else {
			//we don't have the necessary elements yet.
			return false;
		}
	};
	
	
	
	
	

	
	CSD.controller.element = {node: 	  { question:  {},
									 		answer:    {},
									 		statement: {}},
							  connection: {},
							  part: 	  {} };
	
    //Left mouse button pressed on a discussion element.
    //  Find out if it has any elements linked to it.  If so, display all of them.
    //	If any are connection elements, then display another degree_of_view beyond that 
    //	(i.e. display the node this element connects from/to through the connection element)
    
	CSD.controller.element.left_mouse_down = function (the_element, discussion_context) {
		var ids_of_more_elements_to_show_in_view = [];
    	var ids_of_linked_elements;
    	var linked_connection_elements;
    	var a_connection;
    	var i = 0, len;
    	
    	//get the linked elements and add them to the view of elements to display.
    	ids_of_linked_elements = the_element.ids_of_linked_elements();
    	ids_of_more_elements_to_show_in_view = ids_of_more_elements_to_show_in_view.concat(ids_of_linked_elements);
    	
    	linked_connection_elements = the_element.connection_elements();
    	//for each of the connection elements that connects from this element, get the connects_to element id and add this to the list of ids to show in the view
    	len = linked_connection_elements.connections_from_this_element.elements.length
    	for (i=0; i < len; i += 1) {
			a_connection = linked_connection_elements.connections_from_this_element.elements[i];
			ids_of_more_elements_to_show_in_view.push(a_connection.connects_to());
		};
		//for each of the connection elements that connects to this element, get the connects_from element id and add this to the list of ids to show in the view
    	len = linked_connection_elements.connections__to__this_element.elements.length
    	for (i=0; i < len; i += 1) {
			a_connection = linked_connection_elements.connections__to__this_element.elements[i];
			ids_of_more_elements_to_show_in_view.push(a_connection.connects_from());
		};
    	
    	
    	CSD.views_manager.add_elements(ids_of_more_elements_to_show_in_view, discussion_context);
    	
    	CSD.controller.necessary_data_is_available(CSD.views.show_view(discussion_context));
    	//CSD.routes.refresh();  //@TODO is this the right place to put it?
	};
	
	
	
	CSD.controller.element.node.answer.left_mouse_down = function (the_element, the_discussion_context) {
		//double check we're in question rendering mode
		if (CSD.session.view.type === 'question') {
			CSD.session.view[the_discussion_context].root_element_id = the_element.id();
			//CSD.session.view[the_discussion_context].other_answer_ids = CSD.session.view[the_discussion_context].other_answer_ids.remove(the_element.id());
			
			CSD.controller.element.left_mouse_down(the_element, the_discussion_context);
			//CSD.controller.necessary_data_is_available(CSD.views.show_view(the_discussion_context));
		}
	};
	
	
//############################### 
//###############################    HELPER   
//############################### 
	
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




