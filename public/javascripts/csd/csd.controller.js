/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.


//############################### 
//###############################    CONTROLLER   
//############################### 

	CSD.controller.display_discussion = function() {
		CSD.routes.setup();
		CSD.views.show_view();
	}; //  end of   CSD.controller.display_discussion


	
	CSD.controller.element = {node: 	  { question:  {},
									 		answer:    {},
									 		statement: {}},
							  connection: {},
							  part: 	  {} };
	
    //Left mouse button pressed on a discussion element.
    //  Find out if it has any elements linked to it.  If so, display all of them.
    //	If any are connection elements, then display another degree_of_view beyond that 
    //	(i.e. display the node this element connects from/to through the connection element)
    
	CSD.controller.element.left_mouse_down = function (the_element, html_div_to_render_in, root_element) {
		var ids_of_more_elements_to_show_in_view = [],
    		ids_of_linked_elements,
    		linked_connection_elements,
    		a_connection,
    		i = 0, len;
    	
    	//get the linked elements and add them to the view of elements to display.
    	ids_of_linked_elements = the_element.ids_of_linked_elements();
    	ids_of_more_elements_to_show_in_view = ids_of_more_elements_to_show_in_view.concat(ids_of_linked_elements);
    	
    	linked_connection_elements = the_element.connection_elements();
    	//for each of the connection elements that connects from this element, get the connects_to element id and add this to the list of ids to show in the view
    	len = linked_connection_elements.connections_from_this_element.length
    	for (i=0; i < len; i += 1) {
			a_connection = linked_connection_elements.connections_from_this_element[i];
			ids_of_more_elements_to_show_in_view.push(a_connection.connects_to());
		};
		//for each of the connection elements that connects to this element, get the connects_from element id and add this to the list of ids to show in the view
    	len = linked_connection_elements.connections__to__this_element.length
    	for (i=0; i < len; i += 1) {
			a_connection = linked_connection_elements.connections__to__this_element[i];
			ids_of_more_elements_to_show_in_view.push(a_connection.connects_from());
		};
    	
    	
    	CSD.views_manager.add_elements(ids_of_more_elements_to_show_in_view);
    	CSD.views.show_view(html_div_to_render_in, root_element);
    	//CSD.routes.refresh();  //@TODO is this the right place to put it?
	};
	
	
	
	CSD.controller.element.node.answer.left_mouse_down = function (the_element) {
		if (CSD.session.in_question_format) {
			//find all the connections to this question of the same type as the element.
			
			//SD.session.root_element.
		}
		
		//$('#pro_side_discussion_container').animate({ height: 'hide', opacity: 'hide' }, 'slow');
		$('#pro_side_discussion_container').text('');
		CSD.controller.element.left_mouse_down(the_element, $('#pro_side_discussion_container'), the_element);
	};
	
	
//############################### 
//###############################    HELPER   
//############################### 
	
	CSD.helper.call_provided_function = function (function_to_call, parameter1, parameter2) {
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
			function_to_call(parameter1, parameter2);
		} else {
			throw {
				name: 'no function to call',
				message: "the typeof 'function_to_call_once_data_is_available' = " + (typeof function_to_call) + " #in " + debugging_info__function_calling_from
			};
		}
	};
	
//});




