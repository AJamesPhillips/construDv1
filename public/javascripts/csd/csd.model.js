/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.


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
		// declare the variable for the new object 
		var the_new_element = {};
		//declare some other variables
		var connection_ids, connects_from_element_id, connects__to__element_id;
		
		//set the 'is_a_...' variables
		//var is_a_connection_from_an_answer = false;
		//if ((specification.subtype) && (specification.subtype.indexOf('answer') !== -1)) {
		//	//this connection connects to a question, 
		//	// from a statement that is proposed as an answer.
		//	is_a_connection_from_an_answer = true;
		//	specification.subtype = specification.subtype.replace(/answer /, '');
		//}
		var is_a_node = (specification.element_type === 'node');
		var is_a_question_node = (is_a_node && (specification.subtype === 'question'));
		var is_a_statement_node = (is_a_node && (specification.subtype === 'statement'));
		var is_a_reference_node = (is_a_node && (specification.subtype === 'reference'));
		var is_a_sub_statement_node = (is_a_node && (specification.subtype === 'sub-statement'));
		var is_an_answer_node = (is_a_node && (specification.subtype.indexOf('answer') !== -1));
		var is_a_pro_answer  = (is_an_answer_node && (specification.subtype.indexOf('pro') !== -1));
		var is_a_dn_answer   = (is_an_answer_node && (specification.subtype.indexOf('dn') !== -1));
		var is_an_anti_answer = (is_an_answer_node && (specification.subtype.indexOf('anti') !== -1));
		
		var is_a_connection = (specification.element_type === 'connection');
		//var is_a_questioning_connection = (is_a_connection && (specification.subtype === 'questions'));
		//var is_a_supporting_connection = (is_a_connection && (specification.subtype === 'supports'));
		//var is_a_refuting_connection = (is_a_connection && (specification.subtype === 'refutes'));
		
		var is_a_part_element = (specification.element_type === 'part');
		
		
		
		var is_a_node_q = function () {
			return is_a_node;
		},
		is_a_question_node_q = function () {
			return is_a_question_node;
		}
		is_a_statement_node_q = function () {
			return is_a_statement_node;
		},
		is_a_reference_node_q = function () {
			return is_a_reference_node;
		},
		is_a_sub_statement_node_q = function () {
			return is_a_sub_statement_node;
		},
		is_an_answer_node_q = function () {
			return is_an_answer_node;
		},
		is_a_pro_answer_node_q = function () {
			return is_a_pro_answer;
		},
		is_a_dn_answer_node_q = function () {
			return is_a_dn_answer;
		},
		is_an_anti_answer_node_q = function () {
			return is_an_anti_answer;
		},
		
		is_an_answer_node_for_question = function (id_of_question_node) {
			if (is_an_answer_node) {
				var iel_links = the_new_element.ids_of_linked_elements();
				
				//loop through each link from this answer element and see if it is a 
				// question of the same id as that provided in id_of_question_node
				var result = iel_links.match( [id_of_question_node] );
				if (result.length === 1) {
					return result[1];
				} else if (result.length > 1) {
					console.log('ERROR detected. Answer id: "' + specification.id + '" has more than one question: "' + result + '"   #in CSD.model.is_an_answer_node_for_question')
					return result[0];
				}
			}
			return false;
		},
		which_question_id_is_this_an_answer_for = function () {
			if (is_an_answer_node) {
				var iel_links = the_new_element.ids_of_linked_elements();
				var i = 0, len = iel_links.length;
				var a_link;
				var an_element;
				var resulting_question_id = [];
				
				// protection against one answer belonging to multiple questions.
				for (i=0; i < len; i += 1) {
					a_link = iel_links[i];
					an_element = CSD.model.get_element_by_id( a_link );
					if (an_element.is_a_question_node_q()) {
						resulting_question_id.push(an_element.id());
					}
				};
				if (resulting_question_id.length > 1) {
					console.log('error in .is_an_answer_node_for_which_question_id().  The answer of id: "' + specification.id + '" belongs to more than one question.');
					return resulting_question_id; // this should mess things up loudly rather than quietly.
				} else if (resulting_question_id.length === 1) {
					return resulting_question_id[0];
				}
			}
			return false; // this should mess things up loudly rather than quietly.
		},
		
		is_a_connection_q = function () {
			return is_a_connection;
		},
		//is_a_connection_from_an_answer_q = function () {
		//	return is_a_connection_from_an_answer;
		//},
		//is_a_questioning_connection_q = function () {
		//	return is_a_questioning_connection;
		//},
		//is_a_supporting_connection_q = function () {
		//	return is_a_supporting_connection;
		//},
		//is_a_refuting_connection_q = function () {
		//	return is_a_refuting_connection;
		//},
		
		is_a_part_element_q = function () {
			return is_a_part_element;
		};
		
		//set the other private instance variables
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
		ids_of_linked_elements = function (degrees_of_connection) {
			var degrees_of_connection = degrees_of_connection || 1;
			return CSD.model.find_ids_of_elements_linked_with_an_element_id(specification.id, degrees_of_connection);
		},
		
		connection_elements = function () {
			return CSD.model.connection_elements_for_an_element(the_new_element);  
		},
		connections_from_this_element = function () {
			return CSD.model.connection_elements_for_an_element(the_new_element).connections_from_this_element;
		},
		connections__to__this_element = function () {
			return CSD.model.connection_elements_for_an_element(the_new_element).connections__to__this_element;
		},
		render_in_html = undefined,
		parts = function () {
			return CSD.model.parts_of_a_node(the_new_element);
		},
		connection_elements_for_this_node_and_its_parts = function () {
			if (is_a_node) {
				var an_array_of_starting_elements = [];
				an_array_of_starting_elements.push(the_new_element);
				an_array_of_starting_elements = an_array_of_starting_elements.concat(the_new_element.parts().elements);
				return CSD.model.connection_elements_for_multiple_elements(an_array_of_starting_elements);				
			} else {
				console.log("'An element whose id is: '" + specification.id + "' and whose type is: '" + specification.element_type + "' had its .connection_elements_for_this_node_and_its_parts method called, but this is only valid for elements of type node")
				return {connections_from_this_node_and_its_parts: [], connections__to__this_node_and_its_parts: [] };
			}
		},
		answer_nodes_for_this_question = function () {
			if (is_a_question_node) {
				return CSD.model.answer_nodes_for_a_question(the_new_element);
			} else {
				console.log('this is not a question node, but the element of id = ' + specification.id + ' had its answer_connections_and_nodes_for_this_question() function called  #in CSD.model.element');
			}
			return undefined;
		};
		
		
		
		

		
		//produce element_type specific code for rendering it in html.
		if ((specification.element_type === 'node') || (specification.element_type === 'part')) {
			render_in_html = function (discussion_context, html_div_to_render_in) {
				var a_debug = the_new_element.id();
				CSD.views.render_node_in_html(the_new_element, discussion_context, html_div_to_render_in);
			};
			
		} else if (specification.element_type === 'connection') {
			//connection is either:
			// > known to connect to a node, so it will have an 'array_of_remaining_sibling_vertical_connections' (even if it's an empty array) and will call 'html_for_a_vertical_connection'
			// > known to connect to a vertical connection, so it will not have an 'array_of_remaining_sibling_vertical_connections' and will call 'html_for_a_horizontal_connection'
			// > known to connect to a horizontal connection, so it will have an 'array_of_remaining_sibling_vertical_connections' (even if it's an empty array) and will call 'html_for_a_vertical_connection' with out without a corresponding 'a_horizontal_element'
			// > is not know to connect to either node, or horizontal or vertical connection to so will be called with an empty array for 'array_of_remaining_sibling_vertical_connections' and will render as a vertical connection.
			render_in_html = function (discussion_context, html_div_to_render_in, other_parameters) { //array_of_remaining_sibling_vertical_connections, a_horizontal_element
				var a_debug = the_new_element.id();
				other_parameters = other_parameters || {};
				CSD.views.html_for_a_connection(the_new_element, discussion_context, html_div_to_render_in, other_parameters);
			};
		} else {
			console.log("unsupported element type: '" + specification.element_type + "' for new element of id = '" + specification.id + "' # in 'CSD.model.element' in 'csd.model' ");
		}
		
		
		
		//any private_states from higher up the inheritance chain
		objects_private_state = objects_private_state || {};
		// add any shared variables and functions to objects_private_state here
		
		// make a new object and assign it to the_new_element
		the_new_element = {
			id: 							                 id,
			element_type: 					                 element_type,
			subtype: 						                 subtype,
			user_id:						                 user_id,
			archived:						                 archived,
			created_at:						                 created_at,
			inter_element_links: 			                 inter_element_links,
			ids_of_linked_elements:			                 ids_of_linked_elements,
			connection_elements: 			                 connection_elements,
			connections_from_this_element: 	                 connections_from_this_element,
			connections__to__this_element: 	                 connections__to__this_element,
			render_in_html:					                 render_in_html,
			parts:							                 parts,
			connection_elements_for_this_node_and_its_parts: connection_elements_for_this_node_and_its_parts,
			answer_nodes_for_this_question:	 				 answer_nodes_for_this_question,
			
			is_a_node_q:					                 is_a_node_q,
			is_a_question_node_q:							 is_a_question_node_q,
			is_a_statement_node_q:			                 is_a_statement_node_q,
			is_a_reference_node_q:			                 is_a_reference_node_q,
			is_a_sub_statement_node_q:		                 is_a_sub_statement_node_q,
			is_an_answer_node_q:							 is_an_answer_node_q,
			is_a_pro_answer_node_q:							 is_a_pro_answer_node_q,
			is_a_dn_answer_node_q:							 is_a_dn_answer_node_q,
			is_an_anti_answer_node_q:						 is_an_anti_answer_node_q,
			
			is_an_answer_node_for_question:					 is_an_answer_node_for_question,
			which_question_id_is_this_an_answer_for:		 which_question_id_is_this_an_answer_for,
			
			
			is_a_connection_q:				                 is_a_connection_q,
			//is_a_connection_from_an_answer_q:	             is_a_connection_from_an_answer_q,
			//is_a_questioning_connection_q:	                 is_a_questioning_connection_q,
			//is_a_supporting_connection_q:	                 is_a_supporting_connection_q,
			//is_a_refuting_connection_q:		                 is_a_refuting_connection_q,
			
			is_a_part_element_q:							 is_a_part_element_q};
		
		
		
		//if this element is a connection element, replace specification.content with 
		//  an array of two numbers, the element id this connection connects from and to
		if (specification.element_type === 'connection') {
			connection_ids = specification.content.split(',');
			connects_from_element_id = parseInt(connection_ids[0], 10) || undefined; //if parseInt has returned NaN, this should convert it to 'undefined'
			connects__to__element_id = parseInt(connection_ids[1], 10) || undefined;
			
			the_new_element['connects_from'] = function () {
				return connects_from_element_id;
			};
			the_new_element['connects_to'] = function () {
				return connects__to__element_id;
			};
			
		} else if (specification.element_type === 'node') {
			the_new_element['content'] = content;
			
		} else if (specification.element_type === 'part') {
			var start_and_end_points = specification.content.split('..');
			var part_element_start_point = parseInt(start_and_end_points[0], 10) || undefined; //if parseInt has returned NaN, this should convert it to 'undefined';
			var part_element_end_point = parseInt(start_and_end_points[1], 10) || undefined; //if parseInt has returned NaN, this should convert it to 'undefined';
			
			the_new_element['start'] = function () {
				return part_element_start_point;
			};
			the_new_element['end'] = function () {
				return part_element_end_point;
			};
			the_new_element['belonging_to_discussion_node'] = function (only_return_id) {
				return CSD.model.node_for_a_part(the_new_element, only_return_id);
			};
			the_new_element['text_part'] = function () {
				var the_node_it_belongs_to = the_new_element.belonging_to_discussion_node();
				return the_node_it_belongs_to.content().slice(part_element_start_point, part_element_end_point);
			};
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
	
	
	
	CSD.model.belief_state = function (specification, objects_private_state) {
		// declare the variable for the new object 
		var the_new_belief_state = {};
		
		//convert the strings to integer values
		specification.user_id = parseInt(specification.user_id, 10);
		specification.element_id = parseInt(specification.element_id, 10);
		
		//set the private instance variables
		var author_id = function () {
			return specification.user_id;
		},
		element_id = function () {
			return specification.element_id;
		},
		created_at = function () {
			return specification.created_at;
		},
		belief_state = function () {
			return specification.believed_state;
		};
		
		//any private_states from higher up the inheritance chain
		objects_private_state = objects_private_state || {};
		// add any shared variables and functions to objects_private_state here
		
		// make a new object and assign it to the_new_element
		the_new_belief_state = {
			author_id: 		author_id,
			element_id: 	element_id,
			created_at:		created_at,
			belief_state:	belief_state };
		
		
		return the_new_belief_state;
	};
	
	
	


	CSD.model.find_ids_of_elements_linked_with_an_element_id = function (id_of_element, degrees_of_connection, ids_obtained_so_far) {
		var degrees_of_connection = degrees_of_connection || 1;
		
		var iel_links_for_element = [];
		var new_ids_of_linked_elements = [];
		var ids_of_all_linked_elements = ids_obtained_so_far || [];
		var more_ids = [];
		
		
		iel_links_for_element = CSD.data.inter_element_link_by_id[id_of_element];
		new_ids_of_linked_elements = AJP.u.keys(iel_links_for_element).to_int().remove_array(ids_of_all_linked_elements);

		ids_of_all_linked_elements = ids_of_all_linked_elements.concat(new_ids_of_linked_elements);
		
		degrees_of_connection -= 1;
		
		var i = 0, len = new_ids_of_linked_elements.length;
		if (degrees_of_connection !== 0) {
			for (i=0; i < len; i += 1) {
				id_of_element = new_ids_of_linked_elements[i];
				more_ids = CSD.model.find_ids_of_elements_linked_with_an_element_id( id_of_element, degrees_of_connection, ids_of_all_linked_elements);
				ids_of_all_linked_elements = ids_of_all_linked_elements.concat(more_ids);
				ids_of_all_linked_elements = ids_of_all_linked_elements.unique();
			}
		}
		
		return ids_of_all_linked_elements;
	};
	
	
	CSD.model.find_ids_of_elements_linked_with_multiple_elements = function (multiple_elements) {
		var i = 0, len = multiple_elements.length;
		var an_element;
		var ids_of_linked_elements = [];
		
		for (i=0; i < len; i += 1) {
			an_element = multiple_elements[i];
			ids_of_linked_elements = ids_of_linked_elements.concat(CSD.model.find_ids_of_elements_linked_with_an_element(an_element, 1));
		};
			
		return ids_of_linked_elements;
	};
	
	
	CSD.model.connection_elements_for_an_element = function (the_element) {
		//iterate through the_element.ids_of_linked_elements(), getting each corresponding element
		// 	if any have element_type == 'connection'
		//    then if they have the id of the_element in the first position of their array in their 'content' field
		//    add them to the connections_from_this_element
		//    or if the id of the_element is in the second position of their array in their 'content' field
		//    add them to the connections__to__this_element
		var id_of_central_element = the_element.id(),
			resulting_connections = {connections_from_this_element: {ids: [], elements: []}, connections__to__this_element: {ids: [], elements: []} },
			ids_of_elements_linked_with_the_element = the_element.ids_of_linked_elements(),
			i = 0, len = ids_of_elements_linked_with_the_element.length,
			id_of_element_linked_with_the_element,
			element_linked_with_the_element;
			//linked_element_subtype;
		
		for(i = 0; i < len; i += 1) {
			id_of_element_linked_with_the_element = ids_of_elements_linked_with_the_element[i];

			try {
				element_linked_with_the_element = CSD.model.get_element_by_id(id_of_element_linked_with_the_element);
				
				//filter linked elements to keep only those that are connect to or from 'the_element'
				if (element_linked_with_the_element.element_type() === 'connection') {
					linked_element_subtype = element_linked_with_the_element.subtype();
					//if ((linked_element_subtype === 'supports') || (linked_element_subtype === 'refutes') || (linked_element_subtype === 'questions')) {
						if (element_linked_with_the_element.connects_from() === id_of_central_element) {
							resulting_connections.connections_from_this_element.ids.push(id_of_element_linked_with_the_element);
							resulting_connections.connections_from_this_element.elements.push(element_linked_with_the_element);
						}
						if (element_linked_with_the_element.connects_to() === id_of_central_element) {
							resulting_connections.connections__to__this_element.ids.push(id_of_element_linked_with_the_element);
							resulting_connections.connections__to__this_element.elements.push(element_linked_with_the_element);
						}
				}	
			} catch (e) {
				console.log("Element of id: '" + id_of_element_linked_with_the_element + "' has not been requested from mothership so is unavailable for the CSD.model.connection_elements_for_an_element function to look at   # in 'CSD.model.connection_elements_for_an_element'");
			}
		} // finish for loop
		
		return resulting_connections;
	};
	
	
	
	//take an array of elements, and for each of them, find their connection elements
	CSD.model.connection_elements_for_multiple_elements = function (the_elements) {
		var i = 0, len = the_elements.length;
		var some_connections;
		var connections_for_these_elements = {connections_from_these_elements: {ids: [], elements: []}, connections__to__these_elements: {ids: [], elements: []} };
		
		for (i=0; i < len; i+= 1) {
			some_connections =  CSD.model.connection_elements_for_an_element(the_elements[i]);
			
			connections_for_these_elements.connections_from_these_elements.ids = 
				connections_for_these_elements.connections_from_these_elements.ids.concat(some_connections.connections_from_this_element.ids);
			connections_for_these_elements.connections_from_these_elements.elements = 
				connections_for_these_elements.connections_from_these_elements.elements.concat(some_connections.connections_from_this_element.elements);
			
			connections_for_these_elements.connections__to__these_elements.ids = 
				connections_for_these_elements.connections__to__these_elements.ids.concat(some_connections.connections__to__this_element.ids);
			connections_for_these_elements.connections__to__these_elements.elements = 
				connections_for_these_elements.connections__to__these_elements.elements.concat(some_connections.connections__to__this_element.elements);
					
		};
		
		
		// make them unique (though this shouldn't be necessary when used for just a node and its definition parts)
		connections_for_these_elements.connections_from_these_elements.ids =
				connections_for_these_elements.connections_from_these_elements.ids.unique();
		connections_for_these_elements.connections_from_these_elements.elements =
				connections_for_these_elements.connections_from_these_elements.elements.unique();
				
		connections_for_these_elements.connections__to__these_elements.ids = 
				connections_for_these_elements.connections__to__these_elements.ids.unique();
		connections_for_these_elements.connections__to__these_elements.elements = 
				connections_for_these_elements.connections__to__these_elements.elements.unique();
				
				
		return connections_for_these_elements;
	};
	
	
	
	//find all the parts for a node
	CSD.model.parts_of_a_node = function(the_node, options) {
		var results = {elements: [], ids: []};
		//test if this element is actually a node.
		if (the_node.is_a_node_q()) {
			
			var ids_of_elements_linked_with_the_element = the_node.ids_of_linked_elements();
			var i = 0, len = ids_of_elements_linked_with_the_element.length;
			var id_of_element_linked_with_the_element;
			var element_linked_with_the_element;
			
			for(i = 0; i < len; i += 1) {
				id_of_element_linked_with_the_element = ids_of_elements_linked_with_the_element[i];
	    		
				try {
					//this will throw an exception if element is not available.
					element_linked_with_the_element = CSD.model.get_element_by_id(id_of_element_linked_with_the_element);
					
					//filter the elements linked to this node by whether they are of the element_type of 'part' or not.
					if (element_linked_with_the_element.element_type() === 'part') {
						results.ids.push(element_linked_with_the_element.id());
						results.elements.push(element_linked_with_the_element);
					}
				} catch (e) {
					console.log("Element of id: '" + id_of_element_linked_with_the_element + "' has not been requested from mothership so is unavailable for the CSD.model.parts_of_a_node function to look at   # in 'CSD.model.parts_of_a_node'");
				}
			} // finish for loop
			
		} else {
			console.log('CSD.model.parts_of_a_node was called on a non-node element of id: ' + the_node.id());
			
		}
		//return the elements linked to this node that are 'part' element_types
		return results;
	};
	
	
	
	//find the node that a part belongs to
	CSD.model.node_for_a_part = function(the_part, return_only_ids) {
		var ids_of_elements_linked_with_the_element = the_part.ids_of_linked_elements();
		var i = 0, len = ids_of_elements_linked_with_the_element.length;
		var id_of_element_linked_with_the_element;
		var element_linked_with_the_element;
		
		for(i = 0; i < len; i += 1) {
			id_of_element_linked_with_the_element = ids_of_elements_linked_with_the_element[i];
    
			try {
				//this will throw an exception if element is not available.
				element_linked_with_the_element = CSD.model.get_element_by_id(id_of_element_linked_with_the_element);
				
				//filter the elements linked to this node by whether they are of the element_type of 'part' or not.
				if (element_linked_with_the_element.element_type() === 'node') {
					if (return_only_ids) {
						return element_linked_with_the_element.id();
					} else {
						return element_linked_with_the_element;
					}
				}
			} catch (e) {
				console.log("Element of id: '" + id_of_element_linked_with_the_element + "' has not been requested from mothership so is unavailable for the CSD.model.node_for_a_part function to look at   # in 'CSD.model.node_for_a_part'");
			}
		} // finish for loop
		
		//default if this part does not belong to a discussion element node (which should never happen);
		return undefined;
	};
	
	
	
	
	CSD.model.answer_nodes_for_a_question = function (the_question_node) {
		//find if the question node has any links to it
		var links_to_this_question = the_question_node.ids_of_linked_elements();
		
		//sort those which are results.answer_nodes from those which are not
		var i = 0, len = links_to_this_question.length;
		var an_element;
		var results = { answer_nodes: {				total: 0,
													pro: 	{elements: [], ids: []}, 
													dn: 	{elements: [], ids: []}, 
													anti:  	{elements: [], ids: []}
									  },
						non_answer_connections__to__this_element: []
					  };
		
		for (i=0; i < len; i += 1) {
			an_element = CSD.model.get_element_by_id(links_to_this_question[i]);// - results.answer_nodes.total];
			if (an_element.is_an_answer_node_q()) {
				results.answer_nodes.total += 1;
				//separate answer connections into supporting, questioning and refuting
				if (an_element.is_a_pro_answer_node_q()) {
					results.answer_nodes.pro.elements.push(an_element);
					results.answer_nodes.pro.ids.push(an_element.id());
					
				} else if (an_element.is_a_dn_answer_node_q()) {
					results.answer_nodes.dn.elements.push(an_element);
					results.answer_nodes.dn.ids.push(an_element.id());
					
				} else if (an_element.is_an_anti_answer_node_q()) {
					results.answer_nodes.anti.elements.push(an_element);
					results.answer_nodes.anti.ids.push(an_element.id());
					
				} else {
					console.log('unsupported answer node subtype: ' + an_element.subtype() + ' #in CSD.views.render_node_as_question_format_in_html');
				}
			} else if (an_element.is_a_connection_q()) {
				//add "non-answer" connections to the results
				results.non_answer_connections__to__this_element.push(an_element);
			}
		} // end of for loop
		
		return results;
	};
	
	
	
	
	// if the_element.type() === node, it only finds elements that are either connections to the 
	// discussion_element or are parts, or if the_element.type() === connection then only nodes 
	// connected from the discussion_element, or connections to it.
	CSD.model.elements_beneath_this_element = function (the_element, degrees_of_connection, elements_and_ids_obtained_so_far) {
		elements_and_ids_obtained_so_far = elements_and_ids_obtained_so_far || {elements: [], ids: []};
		if (degrees_of_connection === undefined) {
			degrees_of_connection = 1;
		} // else, leave degrees_of_connection alone.
		
		if (degrees_of_connection > 0) {
			degrees_of_connection -= 1;
			var new_elements_beneath_this_element = the_element.connections__to__this_element();
			
			if (the_element.is_a_node_q()) {
				var parts = the_element.parts();
				new_elements_beneath_this_element.elements = new_elements_beneath_this_element.elements.concat(parts.elements);
				new_elements_beneath_this_element.ids = new_elements_beneath_this_element.ids.concat(parts.ids);
				
			} else if (the_element.is_a_connection_q()) {
				var connects_from = the_element.connects_from();
				var connecting_from_node = CSD.model.get_element_by_id(connects_from);
				new_elements_beneath_this_element.elements.push(connecting_from_node);
				new_elements_beneath_this_element.ids.push(connects_from);
			}
			
			//check that all of the new_elements_beneath_this_element have not already been found
			new_elements_beneath_this_element.elements = new_elements_beneath_this_element.elements.remove_array(elements_and_ids_obtained_so_far.elements);
			new_elements_beneath_this_element.ids = new_elements_beneath_this_element.ids.remove_array(elements_and_ids_obtained_so_far.ids);
			
			//now add any remaining, and genuinely newly discovered elements to the list of elements discovered so far.
			elements_and_ids_obtained_so_far.elements = elements_and_ids_obtained_so_far.elements.concat(new_elements_beneath_this_element.elements);
			elements_and_ids_obtained_so_far.ids = elements_and_ids_obtained_so_far.ids.concat(new_elements_beneath_this_element.ids);
			
			
			
			var more_elements = [];
			var i = 0, len = new_elements_beneath_this_element.elements.length;
			var an_element;
		
			for (i=0; i < len; i += 1) {
				an_element = new_elements_beneath_this_element.elements[i];
				more_results = CSD.model.elements_beneath_this_element(an_element, degrees_of_connection, elements_and_ids_obtained_so_far);
				
				elements_and_ids_obtained_so_far.elements = elements_and_ids_obtained_so_far.elements.concat(more_results.elements);
				elements_and_ids_obtained_so_far.ids = elements_and_ids_obtained_so_far.ids.concat(more_results.ids);
			}
		}
		
		elements_and_ids_obtained_so_far.elements = elements_and_ids_obtained_so_far.elements.unique();
		elements_and_ids_obtained_so_far.ids = elements_and_ids_obtained_so_far.ids.unique();
		
		return elements_and_ids_obtained_so_far;
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
	
	
	CSD.model.get_belief_states_by_element_id = function (id_of_element_to_get_belief_states_for) {
		var the_belief_state = CSD.data.belief_state_by_element_id[id_of_element_to_get_belief_states_for];
			
		if (the_belief_state === undefined) {
			//throw {
			//	name: 'belief_state data unavailable',
			//	message: "belief_state for element of id: '" + id_of_element_to_get_belief_states_for + "' was requested but was not available locally #in CSD.model.get_belief_states_by_element_id "
			//};
		}

		return the_belief_state;
	};
	

	
	CSD.model.identify_unavailable_elements = function (array_of_element_ids_to_get, degrees_of_view) {
		//returns an array of element_ids that are in the array_of_element_ids_to_get but that are not present in the list of elements.
		if (degrees_of_view === undefined) {
			degrees_of_view = CSD.views_manager.degrees_of_view();
		}
		if (degrees_of_view > CSD.views_manager.max_degrees_of_view()) {
			degrees_of_view = CSD.views_manager.max_degrees_of_view();
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
	
	


