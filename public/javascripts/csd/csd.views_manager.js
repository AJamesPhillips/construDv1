/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.
	
	
//############################### 
//###############################    VIEWS MANAGER    - keeps track of what should and should not be displayed   
//############################### 
	
	
	//  ids_of_elements_to_add can be:
	//		an array of element ids
	//		@TODO: or an object where the keys are the element ids and the values are the degrees of view
	CSD.views_manager.add_elements = function (ids_of_elements_to_add) {
		var i = 0, len = ids_of_elements_to_add.length;  
		var id_of_element_to_add = undefined;
		var index_of_element_id = undefined;
		
		for (i=0; i < len; i += 1) {
			id_of_element_to_add = ids_of_elements_to_add[i];
			//check if it's already in the array of element_ids to display to prevent duplicates
			index_of_element_id = $.inArray(id_of_element_to_add, CSD.views_data.to_display);
			
			if (index_of_element_id === -1 ) {
				// element_id is not in array so include it
				CSD.views_data.to_display.push(id_of_element_to_add);
			}
		};
	};


	CSD.views_manager.remove_elements = function (element_ids_to_remove) {
		CSD.views_data.to_display.remove_array(element_ids_to_remove);
	};
	
	
	// find all elements in this array of discussion elements that are marked as being in the view.
	CSD.views_manager.return_elements_in_view = function (an_array_of_discussion_elements) {
		function element_in_view (element, index, array) {
			// element = a discussion element in the 'connections_to_this_node' array
			return (CSD.views_data.to_display.contains(element.id()));
		}
		return an_array_of_discussion_elements.filter(element_in_view);
	}
	
	// find all elements in this array of discussion elements that are marked as NOT being in the view.
	CSD.views_manager.return_elements_NOT_in_view = function (an_array_of_discussion_elements) {
		function element_in_view (element, index, array) {
			return (!(CSD.views_data.to_display.contains(element.id())));
		}
		return an_array_of_discussion_elements.filter(element_in_view);
	}
	
	
	CSD.views_manager.return_elements_that_are_parts_that_are_in_view = function (return_only_ids) {
		//iterate through list of elements in view and for those which have the element_type 'part'
		var i = 0, len = CSD.views_data.to_display.length;
		var an_element;
		var elements_that_are_parts = [];
		
		for (i=0; i < len; i += 1 ) {
			an_element = CSD.model.get_element_by_id(CSD.views_data.to_display[i]);
			if (an_element.element_type() === 'part') {
				if (return_only_ids) {
					elements_that_are_parts.push(an_element.id());
				} else {
					elements_that_are_parts.push(an_element);
				}
			}
		};
		return elements_that_are_parts;
	};
	
	
	CSD.views_manager.degrees_of_view = 2;
	CSD.views_manager.max_degrees_of_view = 6;


