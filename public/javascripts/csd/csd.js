
$(function () {    
	
	// define the single global variable, CSD for the application Javascript
	if (typeof(CSD)=="undefined") {
    	CSD = {	data: {},
        		model: {},
    			data_manager: {},
    			views: {},
    			views_helper: {},
    			views_manager: {},
    			views_data: [],
    			controller: {},
    			routes: {}
    			};
    	CSD.dm = CSD.data_manager; // set alias for data_manager as dm
    };
	

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
			var connect_from = function () {
				return specification.content[0];
			}, connect_to = function () {
				return specification.content[2];
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
		var the_new_iel_link = {},
		//set the private instance variables
		element1_id = function () {
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
			an_element_id = array_of_element_ids_to_get[i]
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
	
	
//############################### 
//###############################    DATA MANAGER   //gets the data from the wbesite if it's not available to the models
//############################### 	
	
	CSD.data_manager.set_up_data_structure = function () {  // this functions is currently called in the javascript in elements/show.html.erb
		if (AJP.u.keys(CSD.data).length === 0) {
			CSD.data = {element_by_id: {size: 0},
						inter_element_link_by_id: {size: 0},
						inter_element_link: [] };
		}
	};
	
		
	CSD.data_manager.get_data_by_ajax = function (array_of_elements_ids_to_get, function_to_call_once_data_is_available) {  //, degrees_of_neighbours) {
		
//		if (AJP.u.is_array(id_of_element_to_get)) {
//			//implement AJAX for multiple element request
//			$.getJSON("http://localhost:3000/elements/" + id_of_element_to_get + ".json", function(data) {
//				var the_element = undefined;
//				CSD.data_manager.add_data(data);
//				alert('I am ready noiw!');
//				
//				the_element = CSD.data.element_by_id[id_of_element_to_get];
//				
//				if (the_element === undefined) {
//					console.log('invalid request\n  element id of ' + id_of_element_to_get + ' does not exist.  # in CSD.model.get_element_by_id_and_call_function');
//					throw {
//						name: 'invalid request',
//						message: 'element id of ' + id_of_element_to_get + 'does not exist'
//					};
//				} else if (function_to_call_once_data_is_available !== undefined) {
//					function_to_call_once_data_is_available();
//				};
//			});
//		}
		
		// implement AJAX for single element request
		$.getJSON("http://localhost:3000/elements/" + array_of_elements_ids_to_get + ".json", function(data) {
			var an_element = undefined,
				i = 0,
				len = array_of_elements_ids_to_get.length,
				all_elements_are_now_present = true;
				
			CSD.data_manager.add_data(data);
			//d/ alert('I am ready noiw! and array_of_elements_ids_to_get is_array = ' + (AJP.u.is_array(array_of_elements_ids_to_get)) + ' typeof = ' + (typeof array_of_elements_ids_to_get));
			
			// check each element is now available
			for (i = 0; i < len; i += 1) {
				an_element = CSD.data.element_by_id[array_of_elements_ids_to_get[i]];
				if (an_element === undefined) {
					all_elements_are_now_present = false;
					console.log('invalid request\n  element id of ' + array_of_elements_ids_to_get + ' does not exist.  # in CSD.model.get_element_by_id_and_call_function');
					//throw {
					//	name: 'invalid request',
					//	message: 'element id of ' + array_of_elements_ids_to_get + 'does not exist'
					//};
				}
			}
				
			if (all_elements_are_now_present && (function_to_call_once_data_is_available !== undefined)) {
				function_to_call_once_data_is_available();
			}
		});
		
		
//  	$.getScript("http://localhost:3000/elements/" + id_of_element_to_get + ".js", function(data, textStatus){
//  	   console.log(data); //data returned
//  	   console.log(textStatus); //success
//  	   console.log('Load was performed.');
//  	});
		//return the_element_to_get;
	};

	
	CSD.data_manager.add_data = function (some_json_element_and_iel_link_data) {  // this functions is currently called in the javascript in elements/show.html.erb
		
		CSD.data_manager.set_up_data_structure();
		
		var new_elements = some_json_element_and_iel_link_data["elements"];
		var new_iel_links = some_json_element_and_iel_link_data["inter_element_links"];
		CSD.data_manager.add_new_elements_from_data(new_elements);
		CSD.data_manager.add_new_iel_links_from_data(new_iel_links);
		CSD.data.inter_element_link = new_iel_links;
	};


	CSD.data_manager.add_new_elements_from_data = function (new_elements) {
		var i = 0, len = new_elements.length, size = 0;
		
		for (i = 0; i < len; i++){
			var the_potential_new_element = CSD.model.element(new_elements[i]);
			var id_of_the_potential_new_element = the_potential_new_element.id();
			if (!CSD.data.element_by_id[id_of_the_potential_new_element]) {
				CSD.data.element_by_id[id_of_the_potential_new_element] = the_potential_new_element;
				size += 1;
			} //d/ else { alert('Already have element of id = ' + keys[i] + ' in CSD.data.element_by_id'); }
		}
		CSD.data.element_by_id.size += size;
		//d/ alert('CSD.data.element_by_id[\'size\'] = ' + CSD.data.element_by_id.size);
	};


	CSD.data_manager.add_new_iel_links_from_data = function (new_iel_links) {
		var i = 0, len = new_iel_links.length, size = 0;

		for (i = 0; i < len; i++){
			var new_iel_link_object = CSD.model.inter_element_link(new_iel_links[i]);
			if ( CSD.data_manager.add_an_inter_element_link( new_iel_link_object ) ) { 
				size += 1; // CSD.data_manager.add_an_inter_element_link() returns true if it's added a new link, therefore, increase size by 1.
			};
		}
		// set new 'size?' of CSD.data.element_by_id
		CSD.data.inter_element_link_by_id.size += size;
		//d/ alert('CSD.data.inter_element_link_by_id.size = ' + CSD.data.inter_element_link_by_id.size);
		
	};


	CSD.data_manager.add_an_inter_element_link = function (iel_link) {
		// check if the element1_id of that inter_element_link is already saved:
		var added_new_iel_link = false, 
			id1_of_new_iel_link = iel_link.element1_id(), 
			id2_of_new_iel_link = iel_link.element2_id();
		
		if (!CSD.data.inter_element_link_by_id[id1_of_new_iel_link]) {
			//d/ alert('about to add iel_link of id = ' + id1_of_new_iel_link );
			CSD.data.inter_element_link_by_id[id1_of_new_iel_link] = {};
			added_new_iel_link = true;
		}
		// check if it contains the id2
		if (!CSD.data.inter_element_link_by_id[id1_of_new_iel_link][id2_of_new_iel_link]) {
			CSD.data.inter_element_link_by_id[id1_of_new_iel_link][id2_of_new_iel_link] = iel_link;
		}
		
		
		//repeat check that element2_id of that inter_element_link is already saved:
		if (!CSD.data.inter_element_link_by_id[id2_of_new_iel_link]) {
			//d/ alert('about to add iel_link of id = ' + id2_of_new_iel_link );
			CSD.data.inter_element_link_by_id[id2_of_new_iel_link] = {};
			added_new_iel_link = true;
		}
		// check if it contains the id1
		if (!CSD.data.inter_element_link_by_id[id2_of_new_iel_link][id1_of_new_iel_link]) {
			CSD.data.inter_element_link_by_id[id2_of_new_iel_link][id1_of_new_iel_link] = iel_link;
		}
		
		return added_new_iel_link;
	};

/*
//############################### 
//###############################    VIEW
//###############################    

	//   render argument elements in html using divs and jQuery
	CSD.views.show_view = function () {
		CSD.model.ensure_array_of_elements_are_available_and_then_call_function(CSD.views_data, CSD.views.render_html);
	};
	
	CSD.views.render_html = function () {
		var root_element_id = 0,
		 	root_element = undefined,
		 	connection_element_from_this_element_to_a_parent_element = undefined,
		 	connections__to__root_element = undefined,
		 	indent = 0,
			limit_to_depth_of_levels = 4,
			copy_of_views_data = CSD.views_data,
			the_jquery_html = $('#discussion_container').text(''),
			current_element = undefined,
			connections__to__current_element = undefined,
			unrendered__from_connections = undefined,
			return_only_ids = true,
			walker_function = undefined,
			i = 0, 
			len = 0,
			a_connection = undefined,
			result_from_recursion = undefined,
			connections_to_this_element_to_render = undefined;
		
		// @TODO should make sure all elements in CSD.views_data are actually connected to each other.
		
		//find the element id which has no onnections to another element in CSD.views_data, i.e. which is on display.
		root_element_id = CSD.views_helper.find_root_element_id_to_display(CSD.views_data);
		// @TODO logic to handle root_element_id  when it returns an array of length 0 because the current selection of elements is cyclic
		//	or > 1 because there are more than 2 possible root elements.
		//	i.e. will need a pop menu for user to select which root to display.
		//d/ alert ('root_element_id = ' + root_element_id[0] + '  # in CSD.views.render_html');
		root_element_id = root_element_id[0];
		
		
		walker_function = function (root_element_id, connection_element_from_this_element_to_a_parent_element, is_root, indent) {
			is_root = is_root || false;
			
			//get the root element by its id
			root_element = CSD.model.get_element_by_id_and_call_function(root_element_id);
			
			
			// generate the html for it
			var the_jquery_html_r = CSD.views.for_an_element(root_element, connection_element_from_this_element_to_a_parent_element, indent);
			
			//find the next root_element
			connections__to__root_element = root_element.connection_elements_connecting__to__this_element(return_only_ids);
//			// go through and remove all element ids that either have been rendered already or were not requested to be rendered.
//			unrendered__connections_to_this_element = connections__to__root_element.match(copy_of_views_data);
			//d/ alert('connections__to__root_element = ' + connections__to__root_element + ', CSD.views_data = ' + CSD.views_data + ' # in walker_function');
			connections_to_this_element_to_render = connections__to__root_element.match(CSD.views_data);
			
			len = connections_to_this_element_to_render.length
			for (i = 0; i < len; i += 1) {
				a_connection = CSD.model.get_element_by_id_and_call_function(connections_to_this_element_to_render[i]);
				//d/ alert('root_element_id = ' + root_element_id + ', indent = ' + indent + ' # in walker_function');
				
				if(!is_root){ indent += 1; }
				
				if(indent > limit_to_depth_of_levels){
					console.log('depth of argument exceeds maximum of: ' + limit_to_depth_of_levels); 
					return $('<div></div>').append('max depth of argument is currently: ' + limit_to_depth_of_levels);
				}
				
				
				
				//set the element it refers to in its .content() as the new root element id
				result_from_recursion = walker_function((a_connection.content()[0]), a_connection, false, indent) 
				the_jquery_html_r.append(result_from_recursion);
			};
			
			return the_jquery_html_r;
		};
		
		
		result_from_recursion = walker_function(root_element_id, undefined, true, indent) 
		the_jquery_html.append(result_from_recursion);


		the_jquery_html.append($('<div></div>').addClass('divClear'));
		CSD.views.add_onclick_handlers();
	};
	
	  

	
	
	CSD.views.for_an_element = function(the_element_to_display, connection_element_from_this_element_to_a_parent_element, indent) { //, element_connections_with_the_element){
		var indent = indent || 0,
			the_jquery_html = '',
			connection_array,
			child_div_for_connection_to_parent = '',
			child_div_for_element = '',
			options_for_element = '',
			child_div_for_options = '';
		
		if (connection_element_from_this_element_to_a_parent_element !== undefined) {
			connection_array = connection_element_from_this_element_to_a_parent_element.content().split(',');
			child_div_for_connection_to_parent = $('<div></div>').append(
				(connection_array[1] + ' <- ' + connection_array[0]).toString()
			 	).attr('id', 'element_' + connection_element_from_this_element_to_a_parent_element.id()).addClass('element'); 
		}
		
		child_div_for_element = 
			$('<div></div>')
			.append(the_element_to_display.content().toString())
			.attr('id', 'element_' + the_element_to_display.id())
			.addClass('element'); 
		 
		options_for_element = CSD.views.options_for_element(the_element_to_display);
		 
		child_div_for_options = 
			$('<div></div>')
			.append(options_for_element)
			.attr('id', 'element_' + the_element_to_display.id() + '_options')
			.addClass('element');
		 
		the_jquery_html = 
			$('<div></div>')
			.append(child_div_for_connection_to_parent, child_div_for_element, child_div_for_options)
			.attr('id', 'element_' + the_element_to_display.id() + '_wrapper');
		
		return the_jquery_html;
	};
	
	
	
	CSD.views.options_for_element = function(the_element_to_display) {
		var html_options = [],
			connection_elements_for_this_element = the_element_to_display.connection_elements(),
			connection_elements_connecting_from_this_element = connection_elements_for_this_element.connection_elements_connecting_from_this_element,
			connection_elements_connecting__to__this_element = connection_elements_for_this_element.connection_elements_connecting__to__this_element,
			id_of_option_hide_div = '',
			div_for_hide_element_option = '',
			id_of_option__show_to_links__div = '',
			div_for_show_to_element_option = '',
			id_of_option__show_from_links__div = '',
			div_for_show_from_element_option = '';
			

		id_of_option_hide_div = 'option_hide_element_' + the_element_to_display.id();
		div_for_hide_element_option = $('<div></div>').append('hide'
			).attr('id', id_of_option_hide_div).addClass('element_option');
		
		if (connection_elements_connecting_from_this_element.length < 1) {
			div_for_show_to_element_option = $('<div></div>').append('links to none');			
		} else {
			if (connection_elements_connecting_from_this_element.length === 1) {
				//give short cut ids for just the connection element and the element it connects to
				id_of_option__show_to_links__div = 'option__show_elements_' + connection_elements_connecting_from_this_element[0].connect_to() + '_' + connection_elements_connecting_from_this_element[0].id();
			} else {
				alert(' need to implement selector box for when an element like this has multiple lements it links to');
				id_of_option__show_to_links__div = 'option__show_links_from_element_' + the_element_to_display.id();
			}
			div_for_show_to_element_option = 
				$('<div></div>').append('links to ' + AJP.utilities.pluralize(connection_elements_connecting_from_this_element.length, 'other'))
				.attr('id', id_of_option__show_to_links__div).addClass('element_option');
		}
		
		
			
		id_of_option__show_from_links__div = 'option__show_links_to_element_' + the_element_to_display.id();
		div_for_show_from_element_option = $('<div></div>').append('linked to from ' + AJP.utilities.pluralize(connection_elements_connecting__to__this_element.length, 'other')
			).attr('id', id_of_option__show_from_links__div).addClass('element_option');
		
		html_options = html_options.concat(div_for_hide_element_option[0]);
		html_options = html_options.concat(div_for_show_to_element_option[0]);
		html_options = html_options.concat(div_for_show_from_element_option[0]);
		
		
		return html_options;
	};
	
	
	

	CSD.views.add_onclick_handlers = function () {
		// add onClick handlers
		$('.element_option').click(function() {
  			//alert('Handler for .click() called on ' + this.id);
  			//alert(AJP.utilities.hello());
  			var clicked_html_id = this.id, 
  				html_id_to_test_for = /this_has_not_been_defined_yet/, 
  				element_id,
  				element_ids = [],
  				id_of_element_to_get,
  				element_to_display;
  				 
  			
  			//  option__show_to_links_for_element_
  			html_id_to_test_for = /option__show_elements_/;
  			if (html_id_to_test_for.test(clicked_html_id)){
  				element_ids = clicked_html_id.replace(html_id_to_test_for, "");
  				element_ids = element_ids.split('_');
  				//var a_connection_element_to_this_element = CSD.data.element_by_id[element_id].connection_elements().connection_elements_connecting_from_this_element[0]; //@TODO  replace [0] with iteration
  				//id_of_element_to_get = a_connection_element_to_this_element.content().split(',')[1];  //  [1] pulls out the second value from the content field,
  																									  //  which is the id of the element connecting from this element.
  				//CSD.model.get_element_by_id_and_call_function(id_of_element_to_get, function () {
  				
  						CSD.views_manager.add_element(element_ids[0]);
  						CSD.views_manager.add_element(element_ids[1]);
  						CSD.views.show_view();
  				//	}
  				//);
  				
  			}


  			//  option__show_from_links_for_element_
  			html_id_to_test_for = /option__show_links_to_element_/;
  			if (html_id_to_test_for.test(clicked_html_id)){
  				element_id = clicked_html_id.replace(html_id_to_test_for, "");
  				var a_connection_element_from_this_element = CSD.data.element_by_id[element_id].connection_elements().connection_elements_connecting__to__this_element[0];  //@TODO  replace [0] with iteration
  				
  				id_of_element_to_get = a_connection_element_from_this_element.content().split(',')[0];  //  [0] pulls out the first value from the content field, 
  																										//  which is the id of the element connecting to this element.
  				$.getJSON("http://localhost:3000/elements/" + id_of_element_to_get + ".js", function(data) {
					var items = [];
				
					$.each(data, function(key, val) {
						items.push('<li id="' + key + '">' + val + '</li>');
					});
					
					$('<ul/>', {
						'class': 'my-new-list',
						html: items.join('')
					}).appendTo('body');
				});
  			} 
  			
		});
	};
	
	
	CSD.views.for_displaying_element = function(an_element, element_iel_link_to_parent, indentation) {
		
	};
	
	
//	CSD.views.add_element_to_view = function(an_element) {
//		CSD.views_manager.add_element(an_element);
//		CSD.views.show_view();
//	}


//############################### 
//###############################    VIEWS HELPER       
//############################### 
		
	CSD.views_helper.find_root_element_id_to_display = function (array_of_element_ids) {
		// go through array of element_ids and pull out each element in turn.
		//	Record each element that has no connections to any other elements in the 
		//	'array_of_element_ids'.  If there is only 1, then this is the root and return that ( as an array of length 1).  
		//	If there is more than 1 (i.e. the list of element id_s results in the layout having 
		//	an upwards branch) or 0 (i.e. is cyclic) then
		//	return an array containing those multiple values or an array of length 0.
		
		var i = 0, 
			len = array_of_element_ids.length, 
			result_id = [],
			an_element = undefined,
			i_two = 0,
			len_two = 0,
			connections_from_this_elements = [],
			number_of_connections_from_an_element = 0,
			a_connected_to_element = undefined,
			id_of_a_connected_to_element = undefined;
		
		// loop through all element_ids in 'array_of_element_ids'
		for (i=0; i < len; i += 1) {
			// for each id, recover it's corresponding element
			an_element = CSD.model.get_element_by_id_and_call_function(array_of_element_ids[i]);
			// if it doesn't exist yet, then log and error.... as it should.
			if (an_element === undefined) {
				console.log('Requested element id of ' + array_of_element_ids[i] + ' does not exist locally so will be ignored from finding the root element for displaying the view.  # in CSD.views_helper.find_root_element_id_to_display');
			} else {
				//  cycle through each element that the current element 'an_element' connects to.
				connections_from_this_elements = an_element.connection_elements().connection_elements_connecting_from_this_element; 
				len_two = connections_from_this_elements.length;
				number_of_connections_from_an_element = 0;
				
				for (i_two=0; i_two < len_two; i_two += 1) {
					//	get each "connected to" element's id.  
					id_of_a_connected_to_element = connections_from_this_elements[i_two].id();
					
					// If it's in the 'array_of_element_ids', add 1 to number_of_connections_from_an_element
					if ( ($.inArray(id_of_a_connected_to_element, array_of_element_ids)) !== -1) {
						number_of_connections_from_an_element += 1;
					}
				}
				
				// add the id of 'an_element' to the 'result_id' if it's number_of_connections_from_an_element == 0 
				//	i.e. this is the list of element's to display to the user to pick which root 
				//	of the discussion they'd like to see.
				if (number_of_connections_from_an_element === 0) {
					result_id.push(an_element.id());
				}
			}
		}
		
		return result_id;
	};
*/
//############################### 
//###############################    VIEWS MANAGER    - keeps track of what should and should not be displayed   
//############################### 
	
//	CSD.views_manager.set_up_views_data_structure = function () {
//		if (AJP.u.keys(CSD.views_data).length ===0) {
//			CSD.views_data = [];  // this will contain a { root_element: [and an array of elements that should connect to it that it can display.] }
//		}
//	};
	
	CSD.views_manager.add_element = function (element_to_add) {  //   element_to_add can be an element object or the id of an element.
		var ids_of_element_to_add = undefined,
			id_of_element_to_add = undefined,
			index_of_element_id = undefined;

		// ensure a valid id_of_element_to_add is calculated from the element_to_add parameter
		if (!AJP.u.is_array(element_to_add)) {
			if (typeof element_to_add === 'number') {
				id_of_element_to_add = element_to_add;
			} else if (typeof element_to_add === 'string') {
				id_of_element_to_add = parseInt(element_to_add);
				if (isNaN(id_of_element_to_add)) {
					console.log('a string of value: ' + element_to_add + ' has been fed to CSD.views_manager.add_element but does not evaluate to give a valid element id');
					throw {
						name: 'invalid string for CSD.views_manager.add_element',
						message: 'a string of value: ' + element_to_add + ' has been fed to CSD.views_manager.add_element but does not evaluate to give a valid element id\n' + 
									'please send a valid number containing string, valid number or an element object'
					};
				}
			} else {
				id_of_element_to_add = element_to_add.id();
			}
			ids_of_element_to_add = [id_of_element_to_add];
		} else {
			ids_of_element_to_add = element_to_add;
		}
		
		for (var i=0; i < ids_of_element_to_add.length; i += 1) {
			id_of_element_to_add = ids_of_element_to_add[i];
			//check if it's already in the array of element_ids to display to prevent duplicates
			index_of_element_id = $.inArray(id_of_element_to_add, CSD.views_data);
			
			if (index_of_element_id === -1 ) {
				// element_id is not in array so include it
				CSD.views_data.push(id_of_element_to_add);
			}
		};

		
	};



	CSD.views_manager.remove_element = function (element_to_add) { 
		var id_of_element_to_remove = element_to_remove.id();
		
		CSD.views_data = jQuery.grep(CSD.views_data, function(value) {  //@TODO reaplce with .remove! specified in AJP.utilities.
    		return value != id_of_element_to_remove;
		});
	};

//############################### 
//###############################    CONTROLLER & ROUTES   
//############################### 

	CSD.controller.display_discussion = function() {
		//var the_element_to_display = CSD.data.element_by_id["1"]; //@TODO  replace [0] with iteration
		//var a_string = CSD.views.for_an_element(the_element_to_display);//, the_element_to_display.connection_elements());

		//$('#discussion_container').prepend(a_string);  // using prepend so that '<div class="divClear"></div>' is maintained 

		CSD.views.show_view();
		
		
		
	}; //  end of   CSD.controller.display_discussion
	
	
	
});




