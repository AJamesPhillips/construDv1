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
	
	
	CSD.controller.necessary_data_is_available = function (function_to_call_once_data_is_available, parameters_for_function) {
		var array_of_required_element_ids = [];
		if (CSD.session.view.type === 'as_general') {
			array_of_required_element_ids = array_of_required_element_ids.concat(CSD.session.view.general.ids_in_view());
			array_of_required_element_ids.push(CSD.session.view.general.root_element_id());
			
		} else if (CSD.session.view.type === 'as_question') {
			array_of_required_element_ids = array_of_required_element_ids.concat( CSD.session.view.question.ids_in_view() );
			array_of_required_element_ids.push( CSD.session.view.question.root_element_id() );
			
			var sides = CSD.views_manager.answer_discussion_contexts();
			var i = 0, len = sides.length;
				var side;
			
			for (i=0; i < len; i += 1) {
				side = sides[i];
				array_of_required_element_ids = array_of_required_element_ids.concat( CSD.session.view[side].ids_in_view() );
				array_of_required_element_ids = array_of_required_element_ids.concat( CSD.session.view[side].all_answer_ids() );
				array_of_required_element_ids.push( CSD.session.view[side].root_element_id() );
			};
			
		} else {
			console.log('unsupported CSD.session.view.type: "' + CSD.session.view.type + '" #in CSD.controller.display_discussion');
		}
		
		array_of_required_element_ids = array_of_required_element_ids.unique().remove(undefined);
		
		//test to make sure we have all the necessary elements in local access
		if (CSD.data_manager.ensure_array_of_elements_are_available_or_retrieve_them_and_then_call_function( array_of_required_element_ids, CSD.views_manager.minimum_buffer_degrees_of_view(), function_to_call_once_data_is_available, parameters_for_function)) {
			return true;
		} else {
			//we don't have the necessary elements yet.
			return false;
		}
	};
	
	
	
	
	

	
	CSD.controller.element = {node: 	  		{ question:  {},
									 			  answer:    {},
									 			  statement: {}},
							  connection: 		{},
							  part: 	  		{},
							  currently_editing: {} };
	
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
    	
    	if (CSD.controller.necessary_data_is_available(CSD.views.show_view, discussion_context)) {
    		CSD.views.show_view(discussion_context);
    	};
    	//CSD.routes.refresh();  //@TODO is this the right place to put it?
	};
	
	
	
	CSD.controller.element.node.answer.left_mouse_down = function (the_element, the_discussion_context) {
		//double check we're in question rendering mode
		if (CSD.session.view.type === 'as_question') {
			CSD.session.view[the_discussion_context].root_element_id( the_element.id() );
			//CSD.session.view[the_discussion_context].other_answer_ids = CSD.session.view[the_discussion_context].other_answer_ids.remove(the_element.id());
			
			CSD.controller.element.left_mouse_down(the_element, the_discussion_context);
			//CSD.controller.necessary_data_is_available(CSD.views.show_view(the_discussion_context));
		}
	};
	
	
	
	CSD.controller.element.currently_editing.part_of_elemented_selected = function ( selected_element_html_id, temporary_span_selection_id ) {
		
		var text_from_selection = $('#' + selected_element_html_id + ', [span_ids="' + temporary_span_selection_id + '"]').text();
		$('#editing_panel_messages').text('"' + text_from_selection + '" is questionable due to lack a definition.');
		//CSD.views.options.editing_panel.new_node_entry_fields.visibilty(1, false);
		//CSD.views.options.editing_panel.new_part_node_entry_fields.visibilty(1, false);
		
	};
	
	
	
	CSD.controller.element.currently_editing.element_selected = function ( selected_element_html_id ) {
		alert(selected_element_html_id);
	};
	

//###############################	
	
	CSD.controller.option = {edit_discussion: {}};
	
	CSD.controller.option.edit_discussion.left_mouse_down = function () {
		CSD.session.editing = !CSD.session.editing;
		
		//change the text of the 'edit' button
		CSD.views.options.editing_button.update(CSD.session.editing);
		
		//change the visibility of the editing options panel
		CSD.views.options.editing_panel.visibilty(CSD.session.editing);
	};
	




