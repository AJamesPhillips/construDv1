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
    			controller: {element: {},
    						 discussion_container: {}},
    			routes: {},
    			helper: {}
    			};
    	CSD.dm = CSD.data_manager; // set alias for data_manager as dm
    };
	

//############################### 
//###############################    ROUTES   
//############################### 
	
	CSD.routes.refresh = function () {
		CSD.routes.add_element_click_handlers();
	};

	// add onClick handlers for the elements
	CSD.routes.add_element_click_handlers = function () {
	    $('.element_inner, .symbol_container').bind('mouseup.CSD', function (event1, ui) {
	    	var element_id = this.id;
	    	var the_element = CSD.model.get_element_by_id(element_id);
	    	var the_selection = undefined;
	    		
		    switch (event1.which) {
		        case 1:
		            //Left mouse button pressed on a discussion element.
		            CSD.controller.selection_occured();
		            CSD.controller.element.left_mouse_up(the_element);
		            event1.stopPropagation();
		            break;
		        case 2: //Middle mouse button pressed
		            break;
		        case 3: //Right mouse button pressed on a discussion element.
		        		//	select this discussion element and allow event to propagate to 
		        		//	the discussion container where it will trigger creating a new discussion element
		        		
		            break;
		        default: //You have a strange mouse
		    }
	    });
	};
	
	// add onClick handlers for the discussion container
	CSD.routes.add_discussion_container_handlers = function () {
	    $('#discussion_container').bind('mouseup.CSD', function(event2) {
			event2.stopPropagation();
		    switch (event2.which) {
		        case 1: //Left mouse button pressed
		        	//alert('left');
		            break;
		        case 2: //Middle mouse button pressed
		            break;
		        case 3: //Right mouse button pressed
		        	//alert('right');
		            break;
		        default: //You have a strange mouse
		    }
		});
	};





//############################### 
//###############################    CONTROLLER   
//############################### 

	CSD.controller.display_discussion = function() {
		CSD.routes.add_discussion_container_handlers();
		CSD.views.show_view();
		
		
	}; //  end of   CSD.controller.display_discussion



    //Left mouse button pressed on a discussion element.
    //  Find out if it has any elements linked to it.  If so, display all of them.
    //	If any are connection elements, then display another degree_of_view beyond that 
    //	(i.e. display the node this element connects from/to through the connection element)
	CSD.controller.element.left_mouse_up = function (the_element) {
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
    	
    	
    	CSD.views_manager.add_element(ids_of_more_elements_to_show_in_view);
    	CSD.views.show_view();
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




