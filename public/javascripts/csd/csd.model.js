
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
		var connection_ids, connect_from, connect_to;
		
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
			// if return_only_ids === false  it will return an object of the form:
			//   {connection_elements_connecting_from_this_element: [], connection_elements_connecting__to__this_element: [] }
			// or if return_only_ids === true  it will instead return an object of the form: 
			//    {ids_of_connection_elements_connecting_from_this_element: [], ids_of_connection_elements_connecting__to__this_element: [] }
			//   where the arrays are an array of discussion elements.
			return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids);  
		},
		connection_elements_connecting_from_this_element = function (return_only_ids) {
			return_only_ids = return_only_ids || false;
			// will return and array of discussion elements that have the type 'connection' and are connection_elements_connecting_from_this_element
			///		or an array of ids depending on if return_only_ids is true or false
			if (return_only_ids) {
				return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids).ids_of_connection_elements_connecting_from_this_element;
			} else {
				return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids).connection_elements_connecting_from_this_element;
			}
		},
		connection_elements_connecting__to__this_element = function (return_only_ids) {
			return_only_ids = return_only_ids || false;
			// will return and array of discussion elements that have the type 'connection' and are connection_elements_connecting__to__this_element
			if (return_only_ids) {
				return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids).ids_of_connection_elements_connecting__to__this_element;
			} else {
				return CSD.model.connection_elements_for_an_element(the_new_element, return_only_ids).connection_elements_connecting__to__this_element;
			}
		};
		
		if (specification.element_type === 'connection') {
			connection_ids = specification.content.split(',');
			//replace specification.content with an array of two numbers, the element id this connection connects from and two
			specification.content = [parseInt(connection_ids[0], 10), parseInt(connection_ids[1], 10) ];
			
			connect_from = function () {
				return specification.content[0];
			};
			connect_to = function () {
				return specification.content[1];
			};
		}
		
		//any private_states from higher up the inheritance chain
		objects_private_state = objects_private_state || {};
		// add any shared variables and functions to objects_private_state here
		
		// make a new object and assign it to the_new_element
		the_new_element = {
			id: 												id,
			element_type: 										element_type,
			subtype: 											subtype,
			content: 											content,
			user_id:											user_id,
			archived:											archived,
			created_at:											created_at,
			inter_element_links: 								inter_element_links,
			ids_of_linked_elements:								ids_of_linked_elements,
			connection_elements: 								connection_elements,
			connection_elements_connecting_from_this_element: 	connection_elements_connecting_from_this_element,
			connection_elements_connecting__to__this_element: 	connection_elements_connecting__to__this_element};  
			
		if (specification.element_type === 'connection') {
			the_new_element['connect_from'] = connect_from;
			the_new_element['connect_to'] = connect_to;
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
			return [CSD.model.get_element_by_id_and_call_function(element1_id()), CSD.model.get_element_by_id_and_call_function(element2_id())];
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
		var id_of_element = an_element.id();
		var ids_of_linked_elements = [];
		
		//iterate through CSD.data.inter_element_link pulling out each element1_id and element2_id to check if it's the same as id_of_element
		// if it is, add the opposite one, i.e. if id_of_element == 6  and  iel_link.element1_id == 19  and  iel_link.element2_id == 6
		// then push iel_link.element1_id (i.e. 19) into the  ids_of_linked_elements array.
		var i = 0;
		var len = CSD.data.inter_element_link.length;
		for(i = 0; i < len; i++) {
			var iel_link = CSD.data.inter_element_link[i];
			
			if (id_of_element == iel_link.element1_id) {
				ids_of_linked_elements.push(iel_link.element2_id); 
			} else if (id_of_element == iel_link.element2_id) {
				ids_of_linked_elements.push(iel_link.element1_id);
			}
		}
		return ids_of_linked_elements;
	};
	

	
	CSD.model.connection_elements_for_an_element = function(the_element, return_only_ids){
		//iterate through the_element.ids_of_linked_elements(), getting each corresponding element
		// 	if any have element_type == 'connection'
		//    then if they have the id of the_element in the first position of their array in their 'content' field
		//    add them to the connection_elements_connecting_from_this_element
		//    or if the id of the_element is in the second position of their array in their 'content' field
		//    add them to the connection_elements_connecting__to__this_element
		var id_of_central_element = the_element.id(),
			result_elements = {connection_elements_connecting_from_this_element: [], connection_elements_connecting__to__this_element: [] },
			result_ids = {ids_of_connection_elements_connecting_from_this_element: [], ids_of_connection_elements_connecting__to__this_element: [] },
			ids_of_elements_linked_with_the_element = the_element.ids_of_linked_elements();
		
		//d/ alert('>>>>>>>> the_element.id = ' + id_of_central_element + '#in CSD.model.connection_elements_for_an_element');
		//d/ alert('>>>>>>>> keys(the_element) = ' + AJP.u.keys(the_element) + '#in CSD.model.connection_elements_for_an_element');
		//alert('ids_of_elements_linked_with_the_element = ' + ids_of_elements_linked_with_the_element);
		
		var i = 0;
		var len = ids_of_elements_linked_with_the_element.length;
		for(i = 0; i < len; i++) {
			var element_linked_with_the_element = CSD.data.element_by_id[ids_of_elements_linked_with_the_element[i]];
			
			if (element_linked_with_the_element.element_type() == 'connection') {
				if (element_linked_with_the_element.subtype() == 'single') {
					if (element_linked_with_the_element.content()[0] == id_of_central_element) {
						result_elements.connection_elements_connecting_from_this_element.push(element_linked_with_the_element);
						result_ids.ids_of_connection_elements_connecting_from_this_element.push(element_linked_with_the_element.id());
					} else {
						result_elements.connection_elements_connecting__to__this_element.push(element_linked_with_the_element);
						result_ids.ids_of_connection_elements_connecting__to__this_element.push(element_linked_with_the_element.id());
					}
				}
			}
		} // finish for loop
		
		if (return_only_ids) {
			return result_ids;
		} else {
			return result_elements;
		}
	};
	
	
	
	CSD.model.get_element_by_id_and_call_function = function (id_of_element_to_get, function_to_call_once_data_is_available) {
		var the_element = CSD.data.element_by_id[id_of_element_to_get];
		if (the_element === undefined) {
			CSD.data_manager.get_data_by_ajax([id_of_element_to_get], function_to_call_once_data_is_available);
		}

		return the_element;
	};
	
	CSD.model.ensure_array_of_elements_are_available_and_then_call_function = function (array_of_element_ids_to_get, function_to_call_once_data_is_available) {
		var the_element = undefined,
			array_of_missing_element_ids = [],
			i = 0,
			len = array_of_element_ids_to_get.length,
			an_element_id = undefined,
			an_element = undefined;
			
			
		// iterate over array_of_element_ids_to_get, getting each using  CSD.data.element_by_id[ an_id ];
		//	if it returns undefined, then add it to the list of ids to get from data_manager
		
		for (i = 0; i < len; i += 1) {
			an_element_id = array_of_element_ids_to_get[i];
			an_element = CSD.data.element_by_id[an_element_id];
			if (an_element === undefined) {
				array_of_missing_element_ids.push(an_element_id);
			}
		};
		
		if (array_of_missing_element_ids.length !== 0) {
			CSD.data_manager.get_data_by_ajax(array_of_missing_element_ids, function_to_call_once_data_is_available);
		} else {
			function_to_call_once_data_is_available();
		}
	};
	

	
	
//});




