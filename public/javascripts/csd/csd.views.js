//$(function () {    

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
		
		//find the element id which has no connections to another element in CSD.views_data, i.e. which is on display.
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
			child_div_for_connection_to_parent = '',
			child_div_for_element = '',
			options_for_element = '',
			child_div_for_options = '';
		
		if (connection_element_from_this_element_to_a_parent_element !== undefined) {
			child_div_for_connection_to_parent = $('<div></div>').append(
				(connection_element_from_this_element_to_a_parent_element.connect_to() + ' <- ' + connection_element_from_this_element_to_a_parent_element.connect_from()).toString()
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
  			//d/ alert('Handler for .click() called on ' + this.id);
  			//d/ alert(AJP.utilities.hello());
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
  				//d/ var a_connection_element_to_this_element = CSD.data.element_by_id[element_id].connection_elements().connection_elements_connecting_from_this_element[0]; //@TODO  replace [0] with iteration
  				//d/ id_of_element_to_get = a_connection_element_to_this_element.content().split(',')[1];  //  [1] pulls out the second value from the content field,
  																									  //  which is the id of the element connecting from this element.
  						CSD.views_manager.add_element([parseInt(element_ids[0]), parseInt(element_ids[1])]);
  						CSD.views.show_view();
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
		//	Record each element that has no iel_links to any other elements in the 
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
			connections_from_this_element = [],
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
				if (an_element.element_type() === 'connection') {
					//the element is a connection so see if it connects to any elements in the 'array_of_element_ids'
					// if yes: don't do any thing.  If no: then this is a root element
					var a = an_element.connect_to(),
						b = $.inArray(an_element.connect_to(), array_of_element_ids);
					
					if ( ($.inArray(an_element.connect_to(), array_of_element_ids)) === -1 ) {
						result_id.push(an_element.id());
					}
						
				} else {
				//
				
					//  cycle through each element that the current element 'an_element' connects to.
					connections_from_this_element = an_element.connection_elements().connection_elements_connecting_from_this_element; 
					len_two = connections_from_this_element.length;
					number_of_connections_from_an_element = 0;
					
					for (i_two=0; i_two < len_two; i_two += 1) {
						//	get each "connected to" element's id.  
						id_of_a_connected_to_element = connections_from_this_element[i_two].id();
						
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
		}
		
		return result_id;
	};
	
	
	
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
				CSD.views_data.push(parseInt(id_of_element_to_add));
			}
		};

		
	};



	CSD.views_manager.remove_element = function (element_to_add) { 
		var id_of_element_to_remove = element_to_remove.id();
		
		CSD.views_data = jQuery.grep(CSD.views_data, function(value) {  //@TODO reaplce with .remove! specified in AJP.utilities.
    		return value != id_of_element_to_remove;
		});
	};

//});

