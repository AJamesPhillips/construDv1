/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.



//$(function () {    


//############################### 
//###############################    MODEL   
//############################### 
	

// @TODO implement this:
	
//	CSD.model.base = function (specification, objects_private_state) {
//		var the_new_base_model = {};
//		
//		objects_private_state = objects_private_state || {};
//		
//		objects_private_state.method('find_ids_of_elements_linked_with_an_element', function(an_element) {
//			var id_of_element = an_element.id();
//			var ids_of_linked_elements = [];
//			
//			//iterate through CSD.data.inter_element_link pulling out each element1_id and element2_id to check if it's the same as id_of_element
//			// if it is, add the opposite one, i.e. if id_of_element == 6  and  iel_link.element1_id == 19  and  iel_link.element2_id == 6
//			// then push iel_link.element1_id (i.e. 19) into the  ids_of_linked_elements array.
//			var i = 0;
//			var len = CSD.data.inter_element_link_by_id.size;
//			for(i = 0; i < len; i++) {
//				var iel_link = CSD.data.inter_element_link_by_id[i];
//				
//				if (id_of_element == iel_link.element1_id) {
//					ids_of_linked_elements.push(iel_link.element2_id); 
//				} else if (id_of_element == iel_link.element2_id) {
//					ids_of_linked_elements.push(iel_link.element1_id);
//				}
//			}
//			return ids_of_linked_elements;
//		})
//		
//		
//	};
	
	
	// functional way of making new element objects.  see p53 of JavaScript: the good parts
	CSD.model.element = function (specification, objects_private_state) {
		// declare (but don't set) the variable for the new object 
		var the_new_element = {};
		//declare some other variables
		var connection_ids, connects_from_element_id, connects__to__element_id;
		
		//set the private instance variables
		var id = function () {
			return specification.id;
		},
		element_type = function () {
			return specification.element_type;
		},
		subtype = function () {
			return specification.subtype;
		},
		content = function () {
			return specification.content;
		},
		user_id = function () {
			return specification.user_id;
		},
		archived = function () {
			return specification.archived;
		},
		created_at = function () {
			return specification.created_at;
		},
		inter_element_links = function () {
			return 'not implemented yet';
		},
		ids_of_linked_elements = function () {
			return CSD.model.find_ids_of_elements_linked_with_an_element(the_new_element);
		},
		connection_elements = function (return_only_ids) {
			return_only_ids = return_only_ids || false;
			// it will return an object of the form:
			//   {connections_from_this_element: [], connections__to__this_element: [] }
			return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids);  
		},
		connections_from_this_element = function (return_only_ids) {
			return_only_ids = return_only_ids || false;
			// will return and array of discussion elements that have the type 'connection' and are connection_elements_connecting_from_this_element
			///		or an array of ids depending on if return_only_ids is true or false
			return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids).connections_from_this_element;
		},
		connections__to__this_element = function (return_only_ids) {
			return_only_ids = return_only_ids || false;
			// will return and array of discussion elements that have the type 'connection' and are connection_elements_connecting__to__this_element
			return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids).connections__to__this_element;
		},
		render_in_html = undefined,
		connects_from = undefined,
		connects_to = undefined;
		
		
		//produce element_type specific code for rendering it in html.
		if (specification.element_type === 'node') {
			render_in_html = function (html_div_to_render_in) {
				var a_debug = the_new_element.id();
				CSD.views.render_node_in_html(the_new_element, html_div_to_render_in);
			};
		} else if (specification.element_type === 'connection') {
			//connection is either:
			// > known to connect to a node, so it will have an 'array_of_remaining_sibling_vertical_connections' (even if it's an empty array) and will call 'html_for_a_vertical_connection'
			// > known to connect to a vertical connection, so it will not have an 'array_of_remaining_sibling_vertical_connections' and will call 'html_for_a_horizontal_connection'
			// > known to connect to a horizontal connection, so it will have an 'array_of_remaining_sibling_vertical_connections' (even if it's an empty array) and will call 'html_for_a_vertical_connection' with out without a corresponding 'a_horizontal_element'
			// > is not know to connect to either node, or horizontal or vertical connection to so will be called with an empty array for 'array_of_remaining_sibling_vertical_connections' and will render as a vertical connection.
			render_in_html = function (html_div_to_render_in, other_parameters) { //array_of_remaining_sibling_vertical_connections, a_horizontal_element
				var a_debug = the_new_element.id();
				other_parameters = other_parameters || {};
				CSD.views.html_for_a_connection(the_new_element, html_div_to_render_in, other_parameters);
			};
		} else {
			console.log("unsupported element type: '" + specification.element_type + "' for new element of id = '" + specification.id + "' # in 'CSD.model.element' in 'csd.model' ");
		}
		
		
		//if this element is a connection element, replace specification.content with 
		//  an array of two numbers, the element id this connection connects from and to
		if (specification.element_type === 'connection') {
			connection_ids = specification.content.split(',');
			connects_from_element_id = parseInt(connection_ids[0], 10) || undefined; //if parseInt has returned NaN, this should convert it to 'undefined'
			connects__to__element_id = parseInt(connection_ids[1], 10) || undefined;
			
			connects_from = function () {
				return connects_from_element_id;
			};
			connects_to = function () {
				return connects__to__element_id;
			};
		}
		
		//any private_states from higher up the inheritance chain
		objects_private_state = objects_private_state || {};
		// add any shared variables and functions to objects_private_state here
		
		// make a new object and assign it to the_new_element
		the_new_element = {
			id: 							id,
			element_type: 					element_type,
			subtype: 						subtype,
			user_id:						user_id,
			archived:						archived,
			created_at:						created_at,
			inter_element_links: 			inter_element_links,
			ids_of_linked_elements:			ids_of_linked_elements,
			connection_elements: 			connection_elements,
			connections_from_this_element: 	connections_from_this_element,
			connections__to__this_element: 	connections__to__this_element,
			render_in_html:					render_in_html};  
			
		if (specification.element_type === 'connection') {
			the_new_element['connects_from'] = connects_from;
			the_new_element['connects_to'] = connects_to;
		} else if (specification.element_type === 'node') {
			the_new_element['content'] = content;
		}
		return the_new_element;
	};
	
	
	
	CSD.model.inter_element_link = function (specification, objects_private_state) {
		// declare (but don't set) the variable for the new object 
		var the_new_iel_link = {};
		
		//convert the strings to integer values
		specification.element1_id = parseInt(specification.element1_id, 10);
		specification.element2_id = parseInt(specification.element2_id, 10);
		
		//set the private instance variables
		var element1_id = function () {
			return specification.element1_id;
		},
		element2_id = function () {
			return specification.element2_id;
		},
		created_at = function () {
			return specification.created_at;
		},
		elements = function () {
			return [CSD.model.get_element_by_id(element1_id()), CSD.model.get_element_by_id(element2_id())];
		};
		
		//any private_states from higher up the inheritance chain
		objects_private_state = objects_private_state || {};
		// add any shared variables and functions to objects_private_state here
		
		// make a new object and assign it to the_new_element
		the_new_iel_link = {
			element1_id: element1_id,
			element2_id: element2_id,
			created_at:  created_at,
			elements: 	 elements };
		
		
		return the_new_iel_link;
	};
	


	CSD.model.find_ids_of_elements_linked_with_an_element = function(an_element) {
		var id_of_element = an_element.id(),
			ids_of_linked_elements_as_keys = AJP.u.keys(CSD.data.inter_element_link_by_id[id_of_element]);
			
		return ids_of_linked_elements_as_keys.to_int();
	};
	
	
	
	CSD.model.connection_elements_for_an_element = function(the_element, return_only_ids){
		//iterate through the_element.ids_of_linked_elements(), getting each corresponding element
		// 	if any have element_type == 'connection'
		//    then if they have the id of the_element in the first position of their array in their 'content' field
		//    add them to the connections_from_this_element
		//    or if the id of the_element is in the second position of their array in their 'content' field
		//    add them to the connections__to__this_element
		var id_of_central_element = the_element.id(),
			resulting_connections = {connections_from_this_element: [], connections__to__this_element: [] },
			ids_of_elements_linked_with_the_element = the_element.ids_of_linked_elements(),
			i = 0, len = ids_of_elements_linked_with_the_element.length,
			id_of_element_linked_with_the_element,
			element_linked_with_the_element;
			//linked_element_subtype;
		
		for(i = 0; i < len; i += 1) {
			id_of_element_linked_with_the_element = ids_of_elements_linked_with_the_element[i];

			try {
				element_linked_with_the_element = CSD.model.get_element_by_id(id_of_element_linked_with_the_element);
				if (element_linked_with_the_element.element_type() === 'connection') {
					linked_element_subtype = element_linked_with_the_element.subtype();
					//if ((linked_element_subtype === 'supports') || (linked_element_subtype === 'refutes') || (linked_element_subtype === 'questions')) {
						if (element_linked_with_the_element.connects_from() === id_of_central_element) {
							if (return_only_ids) {
								resulting_connections.connections_from_this_element.push(id_of_element_linked_with_the_element);
							} else {
								resulting_connections.connections_from_this_element.push(element_linked_with_the_element);
							}
						}
						if (element_linked_with_the_element.connects_to() === id_of_central_element) {
							if (return_only_ids) {
								resulting_connections.connections__to__this_element.push(id_of_element_linked_with_the_element);
							} else {
								resulting_connections.connections__to__this_element.push(element_linked_with_the_element);
							}
						}
				}	
			} catch (e) {
				console.log("Element of id: '" + id_of_element_linked_with_the_element + "' has not been requested from mothership so is unavailable for the CSD.model.connection_elements_for_an_element function to look at   # in 'CSD.model.connection_elements_for_an_element'");
			}
		} // finish for loop
		
		return resulting_connections;
	};
	
	
	
	
	CSD.model.get_element_by_id = function (id_of_element_to_get) {
		var the_element = CSD.data.element_by_id[id_of_element_to_get];
			
		if (the_element === undefined) {
			throw {
				name: 'element data unavailable',
				message: "element of id: '" + id_of_element_to_get + "' was requested but was not available locally #in CSD.model.get_element_by_id "
			};
		}

		return the_element;
	};
	
	
	
	//CSD.model.ensure_element_is_available_and_then_call_function = function (id_of_element_to_get, function_to_call_once_data_is_available) {
	//	var degrees_of_view = 0;
	//	CSD.model.ensure_array_of_elements_are_available_and_then_call_function([id_of_element_to_get], function_to_call_once_data_is_available, degrees_of_view);
	//};
	

	
	//CSD.model.get_array_of_elements_by_id_using_AJAX_and_then_call_function = function (array_of_element_ids_to_get, function_to_call_once_data_is_available) {
	//	CSD.data_manager.get_data_by_ajax(array_of_element_ids_to_get, function_to_call_once_data_is_available);
	//};
	
	CSD.model.ensure_array_of_elements_are_available_and_then_call_function = function (array_of_element_ids_to_get, function_to_call_once_data_is_available, degrees_of_view) {
		var array_of_missing_element_ids = [];
		
		// iterate over array_of_element_ids_to_get, getting each using  CSD.data.element_by_id[ an_id ];
		//	if it returns undefined, then add it to the list of ids to get from data_manager	
		array_of_missing_element_ids = CSD.model.identify_unavailable_elements(array_of_element_ids_to_get, degrees_of_view);
		
		if (array_of_missing_element_ids.length !== 0) {
			CSD.data_manager.get_data_by_ajax(array_of_missing_element_ids, function_to_call_once_data_is_available);
		} else {
			CSD.helper.call_provided_function(function_to_call_once_data_is_available);
		}
	};
	
	
	CSD.model.identify_unavailable_elements = function (array_of_element_ids_to_get, degrees_of_view) {
		//returns an array of element_ids that are in the array_of_element_ids_to_get but that are not present in the list of elements.
		if (degrees_of_view === undefined) {
			degrees_of_view = CSD.views_manager.degrees_of_view;
		}
		if (degrees_of_view > CSD.views_manager.max_degrees_of_view) {
			degrees_of_view = CSD.views_manager.max_degrees_of_view;
		}
		var array_of_missing_element_ids = [],
			i = 0, len = array_of_element_ids_to_get.length, an_element_id = undefined,
			an_element = undefined,
			missing_linked_element_ids;
		
		for (i = 0; i < len; i += 1) {
			an_element_id = array_of_element_ids_to_get[i];
			an_element = CSD.data.element_by_id[an_element_id];
			if (an_element === undefined) {
				array_of_missing_element_ids.push(an_element_id + '-' + degrees_of_view);
			} else if (degrees_of_view > 0) {
				missing_linked_element_ids = CSD.model.identify_unavailable_elements(an_element.ids_of_linked_elements(), (degrees_of_view-1));
				array_of_missing_element_ids = array_of_missing_element_ids.concat(missing_linked_element_ids);
			}
		}
		
		return array_of_missing_element_ids;
	};
	

	
	
//});




