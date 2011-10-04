/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.


//############################### 
//###############################    VIEWS
//###############################    

	//   render argument elements in html using divs and jQuery
	CSD.views.show_view = function (discussion_layout_type_or_view_context) {
		CSD.views_helper.recalculate_element_parts_for_draw_selections_method(); // needs to be before CSD.views.render_discussion_html(); so that 'if (content_for_part_node) { save_selection' works properly in 'CSD.views.html_for_a_node'  
		if (discussion_layout_type_or_view_context === 'as_general') {
			CSD.views.prepare_document.for_rendering_a_general_discussion();
			CSD.routes.setup();
			var discussion_context = 'general';
			CSD.views.render_discussion_html(discussion_context);
		} else if (discussion_layout_type_or_view_context === 'as_question') {
			CSD.views.prepare_document.for_rendering_a_question_and_its_answers();
			CSD.routes.setup();
			var discussion_context = 'question';
			CSD.views.render_discussion_html(discussion_context);

			//now render the argument sides
				//n.b. for pro, dn and anti, 
				//  if root_element_id === undefined, and all_answer_ids === [], there is no know answer for the question posed
				//			=> render a "add an answer" box
				//	if root_element_id === undefined, and all_answer_ids === [some-ids], there are several answers, and one has yet to be chosen for display
				//			=> render multiple answers (unless all bar one are absent from the 'ids_in_view')
				//	if root_element_id === some-id, and all_answer_ids === [], there  is only 1 answers, and it's chosen for display
				//			=> render this element as root
				//	if root_element_id === some-id, and all_answer_ids === [some-ids], there are several answers and 1 has been chosen for display
				//			=> render this element as root
			var sides = CSD.views_manager.answer_discussion_contexts();
			var i = 0, len = sides.length;
				var side;
				
			for (i=0; i < len; i += 1) {
				side = sides[i];
				CSD.views.show_view.show_a_side(side);
			};
			
		} else if (CSD.views_manager.all_discussion_contexts().contains(discussion_layout_type_or_view_context)) {
			CSD.views.show_view.show_a_side(discussion_layout_type_or_view_context);
		} else {
			console.log('error, discussion_layout_type_or_view_context = "' + discussion_layout_type_or_view_context + '"  #in CSD.views.show_view');
		}
		
		CSD.routes.refresh();
		CSD.views.draw_selections();
	};
	
	
	CSD.views.show_view.show_a_side = function (discussion_context) {
		var context_data = CSD.session.view[discussion_context];
		var root_element_id = context_data.root_element_id();
		var number_of_other_answers;

		if (root_element_id) {
			number_of_other_answers = context_data.all_answer_ids;
			CSD.views.render_discussion_html(discussion_context);
		} else {
			if (true) {
				CSD.views.render_multiple_answer_selection_html(discussion_context);
			} else {
				CSD.views.render_multiple_answer_selection_html(discussion_context);
			}
		}
	};


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   Editing options
	
	
	CSD.views.options = {editing_button: {},
						 editing_panel:  {}};
						 
	CSD.views.options.editing_button.update = function (currently_editing) {
		var jquery_of_edit_button = $('#edit_discussion');
		
		if (currently_editing) {
			jquery_of_edit_button.attr('value','stop editing').addClass('option_enabled');
		} else {
			jquery_of_edit_button.attr('value','edit').removeClass('option_enabled');
		}
	};
	
	
	CSD.views.options.editing_panel.visibilty = function (show_panel) {
		var jquery_of_editing_panel = $('#editing_panel');
		
		if (show_panel) {
			jquery_of_editing_panel.attr('style','display: block;');
		} else {
			jquery_of_editing_panel.attr('style','display: none;');
		}
	};


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//###############################    VIEWS (render discussions in nested divs, no html5)  
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	CSD.views.render_discussion_html = function (discussion_context) {
		var context_data = CSD.session.view[discussion_context];
		var element_id_it_connects_to;
		var element_it_connects_to;
		var other_parameters = {};
		var root_element_id = context_data.root_element_id();
		var root_element = CSD.model.get_element_by_id(root_element_id);
		var html_div_to_render_in = $('#' + context_data.html_id_of_view_container).text('');
		
		
		//find out if it's a connection element.  if it is, find out if it connects to a node element, 
		// if so, pass it {array_of_remaining_sibling_vertical_connections: []} so it renders as a vertical connection, rather than a horizontal one.
		if (root_element.element_type() === 'connection') {
			element_id_it_connects_to = root_element.connects_to();
			element_it_connects_to = CSD.model.get_element_by_id(element_id_it_connects_to);
			if (element_it_connects_to.element_type() === 'node') {
				other_parameters = {array_of_remaining_sibling_vertical_connections: []};
			}
		}
		
		root_element.render_in_html(discussion_context, html_div_to_render_in, other_parameters); // other_parameters is only needed when the root element is a connection element
		
		html_div_to_render_in.append($('<div></div>').addClass('divClear'));
	};
	
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	//this is only ever called when we have a question_node as the root element.
	//CSD.views.render_node_as_question_format_in_html = function (the_question_node, html_div_to_render_in) {
	//	//find all the answer nodes for this question node
	//	var results = the_question_node.answer_connections_and_nodes_for_this_question();
	//	//save time later and assign these values to the CSD.session.root_element
	//	
	//	//get the non_answer_connections to this question node
	//	var non_answer_connections = results.non_answer_connections__to__this_element.elements;
	//	
	//	//render the question
	//	html_div_to_render_in.append(CSD.views.html_for_a_node(the_question_node));
	//	
	//	// render each non-answer connection to this node element that's in the current view
	//	var non_answer_connections = CSD.views_manager.return_elements_in_view(non_answer_connections);
	//	if (non_answer_connections.length > 0) {
	//		non_answer_connections.shift().render_in_html(html_div_to_render_in, {array_of_remaining_sibling_vertical_connections: non_answer_connections});
	//	}
	//	
	//	
	//	//prepare discussion container for rendering views:
	//	//  there are two routes to getting to this method call, route one, the user has made a 
	//	//  direct request for a question_node, route two, the user has navigated here from a discussion chain
	//	CSD.views.prepare_document.for_rendering_a_question_and_its_answers();
	//	
	//	
	//	//render a 'select answer discussion' box that contains the titles: '"Yes" answers', '"Don't know" answers', '"No" answers'
	//	// under each heading put the list of statement elements that were linked with an answer connection 
	//	// at this point answers."whatever" will contain all the answers irrespective of whether they're in view or not.
	//	var jquery_answer_container = $('#pro_side_discussion_container').text('');
	//	CSD.views.render_node_as_question_format_in_html.render_answers(results.answer_nodes.supporting, jquery_answer_container);
	//	var jquery_answer_container = $('#dn_side_discussion_container').text('');
	//	CSD.views.render_node_as_question_format_in_html.render_answers(results.answer_nodes.questioning, jquery_answer_container);
	//	var jquery_answer_container = $('#anti_side_discussion_container').text('');
	//	CSD.views.render_node_as_question_format_in_html.render_answers(results.answer_nodes.refuting, jquery_answer_container);
	//};
	
	
	
	CSD.views.prepare_document = {};
	CSD.views.prepare_document.for_rendering_a_general_discussion = function () {
		$('#discussion_definition').text('');
		$('#main_discussion_container').text('');
	};
	
	CSD.views.prepare_document.for_rendering_a_question_and_its_answers = function () {
		$('#discussion_definition').text('');
		
		var discussion_container = $('#main_discussion_container').text('');
		var html_discussion_side = function (id_name, content) {
			return $('<div></div>').attr('id', id_name)
								   .addClass('discussion_side')
								   .append(content);
		};
		var html_discussion_side_options = function (id_name) {
			return $('<input type="submit" />').attr('id', id_name)
											   .addClass('option_button')
											   .attr('value', 'other answers');
		};
		var html_discussion_side_container = function (id_name) {
			return $('<div></div>').attr('id', id_name)
									.addClass('discussion_container');
		};
		var padding_between_discussion_sides = function () {
			return $('<div></div>').addClass('padding_between_discussion_sides');
		};
		
		
		var pro_side = html_discussion_side('pro_side', 'Yes because...');
		var dn_side = html_discussion_side('dn_side', "We don't know because...");
		var anti_side = html_discussion_side('anti_side', 'No because...');
		
		var show_other_pro_answers_option = html_discussion_side_options('show_other_pro_answers');
		var show_other_dn_answers_option = html_discussion_side_options('show_other_dn_answers');
		var show_other_anti_answers_option = html_discussion_side_options('show_other_anti_answers');
		
		var pro_side_discussion_container = html_discussion_side_container('pro_side_discussion_container');
		var dn_side_discussion_container = html_discussion_side_container('dn_side_discussion_container');
		var anti_side_discussion_container = html_discussion_side_container('anti_side_discussion_container');
		
		pro_side.append(show_other_pro_answers_option).append(pro_side_discussion_container);
		dn_side.append(show_other_dn_answers_option).append(dn_side_discussion_container);
		anti_side.append(show_other_anti_answers_option).append(anti_side_discussion_container);
		
		discussion_container.append(pro_side).append(padding_between_discussion_sides())
							.append(dn_side).append(padding_between_discussion_sides())
							.append(anti_side);
	};
	
	
	
	CSD.views.render_multiple_answer_selection_html = function (discussion_context) {
		//if this is being called, there should be no root_element_id for this view context
		var context_data = CSD.session.view[discussion_context];
		if (context_data.root_element_id()) {
			//fail
			console.log('CSD.views.render_multiple_answer_selection_html  has been called with discussion_context = "' + discussion_context + '", but this already has a root_element_id of: "' + context_data.root_element_id() + '" defined.')
		} else {
			var html_div_to_render_in = $('#' + context_data.html_id_of_view_container);
			var answer_ids = context_data.all_answer_ids();
			var len_all = answer_ids.length;
			if (len_all === 0) {
				// no "other answers" available and not root element so offer the user to submit and answer
				html_div_to_render_in.append('There are no proposed answers yet.');
			} else {
				// find which answers are in the view.  
				var answers_in_view = CSD.views_manager.from_ids_return_elements_in_view(answer_ids, discussion_context);
				var i_view = 0, len_view = answers_in_view.length;
				if (len_view === 0) {
					// there are answers to this question in this view context but we can't show the user any of them.
					html_div_to_render_in.append('There are some proposed answers, please click the "other answers" button to see them.');
				} else {
					// there is more than one answer in the view, so loop through them and display them.
					var an_answer_node;
					for (i_view=0; i_view < len_view; i_view += 1) {
						an_answer_node = answers_in_view[i_view];
						html_div_to_render_in.append(CSD.views.html_for_a_node(an_answer_node, discussion_context, undefined, {middle:' answer_node'}));
					}
				}
			}
		}
	};
	
	
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	CSD.views.render_node_in_html = function (the_node, discussion_context, html_div_to_render_in) {
		var a_debug = the_node.id();
		var connections_for_this_node;
		var connections__to__this_node;
		
		if (the_node.element_type() === 'part') {
			html_div_to_render_in.append(CSD.views.html_for_a_node(the_node, discussion_context, the_node.text_part()));
			connections__to__this_node = the_node.connections__to__this_element();
		} else {
			html_div_to_render_in.append(CSD.views.html_for_a_node(the_node, discussion_context));
			connections_for_this_node = the_node.connection_elements_for_this_node_and_its_parts();
			connections__to__this_node = connections_for_this_node.connections__to__these_elements;
		}
		
		
		// render each connection to this node element that's in the current view
		var connections_to_this_node_in_view_in_an_array = CSD.views_manager.return_elements_in_view(connections__to__this_node.elements, discussion_context);
		if (connections_to_this_node_in_view_in_an_array.length > 0) {
			connections_to_this_node_in_view_in_an_array.shift().render_in_html(discussion_context, html_div_to_render_in, {array_of_remaining_sibling_vertical_connections: connections_to_this_node_in_view_in_an_array});
		}
		
	};
	
	
	CSD.views.html_for_a_node = function (the_node, discussion_context, content_for_part_node, optional_css) {
		var a_debug = the_node.id();
		
		var the_content = content_for_part_node || the_node.content();
		var css = optional_css || {};
		css.inner = css.inner || '';
		css.middle = css.middle || '';
		css.outer = css.outer || '';
	
		
		//if content_for_part_node has been supplied, then we're rendering a part node as a root
		//  if we didn't change anything then it would look like an element, so instead
		//  save a selection, selecting this content as if it were an element, but without changing the div id
		//  to that of that parent element id (which might confuse things latter in development, dunno)
		//n.b. this temporary selection will be over written once the parent of this part node is displayed
		if (content_for_part_node) {
			CSD.session.save_selection(the_node.id(), 0, content_for_part_node.length, the_node.id(), 'discussion_node_part');
		}
		
		 
		
		var inner_div_html;
		var outer_div_html;
		
		inner_div_html = $('<div></div>')
						.append(the_content)//CSD.views.html_for_statement_parts(the_node))
						.addClass('element_inner' + css.inner);
						//.attr('element_id', the_node.id())
						//.attr('discussion_context', discussion_context);
		middle_div_html = $('<div></div>')
						.append(inner_div_html)
						.addClass('element_middle' + css.middle)
						.attr('element_id', the_node.id())
						.attr('discussion_context', discussion_context);
		CSD.views.add_believed_state_for_element(the_node, middle_div_html, discussion_context)
		outer_div_html = $('<div></div>')
						.append(middle_div_html)
						.addClass('element_outer' + css.outer);  
		CSD.views.options_for_element(the_node, middle_div_html, discussion_context);
		
		return outer_div_html;
	};
	
	//CSD.views.html_for_statement_parts = function (the_node) {
	//	var parts_of_a_node = the_node.parts();
	//	if (parts_of_a_node) {
	//		return ( + parts_of_a_node.length); 
	//	} else {
	//		return the_node.content();
	//	}
	//};
	
	
	CSD.views.html_for_a_horizontal_node = function (the_horizontal_node, discussion_context, html_div_to_render_in) {
		var a_debug = the_horizontal_node.id();
		
		var is_for_horizontal_node = true;
		var horizontal_element_group_html;
		
		horizontal_element_group_html = CSD.views.html_for_an_element_group(is_for_horizontal_node);
		the_horizontal_node.render_in_html( discussion_context, horizontal_element_group_html);
		html_div_to_render_in.append(horizontal_element_group_html);
	};
	
	

	
	CSD.views.html_for_a_connection = function (the_connection, discussion_context, html_div_to_render_in, other_parameters) {
		var a_debug = the_connection.id();
		//connection is either:
		// > known to connect to a node, so it will have an 'array_of_remaining_sibling_vertical_connections' (even if it's an empty array) and will call 'html_for_a_vertical_connection'
		// > known to connect to a vertical connection, so it will not have an 'array_of_remaining_sibling_vertical_connections' and will call 'html_for_a_horizontal_connection' (passing the_horizontal_node if it's available)
		// > known to connect to a horizontal connection, so it will have an 'array_of_remaining_sibling_vertical_connections' (even if it's an empty array) and will call 'html_for_a_vertical_connection' without a corresponding 'the_horizontal_node'
		// > is not known to connect to either node, or horizontal or vertical connection to so will be called with an empty array for 'array_of_remaining_sibling_vertical_connections' and will render as a vertical connection.
		if (other_parameters.array_of_remaining_sibling_vertical_connections) {
			CSD.views.html_for_a_vertical_connection(the_connection, discussion_context, html_div_to_render_in, other_parameters);
		} else {
			var a_debug = the_connection.id();
			CSD.views.html_for_a_horizontal_connection(the_connection, discussion_context, html_div_to_render_in);
		}
	};

	
	CSD.views.html_for_a_vertical_connection = function (the_connection, discussion_context, html_div_to_render_in, other_parameters) {
		var a_debug = the_connection.id();
		
		var array_of_remaining_sibling_vertical_connections = other_parameters.array_of_remaining_sibling_vertical_connections;
		var the_horizontal_node = other_parameters.the_horizontal_node;
		
		var symbol_container_html;
		var vertical_connection_html;
		var element_group_html;
		var horizontal_element_group_html;
		var array_of_horizontal_connections;
		var i = 0, len;
		var id_of_next_potential_node;
		var next_node;
		
		symbol_container_html = CSD.views.html_for_a_connection_symbol_container(the_connection, discussion_context);
		vertical_connection_html = $('<div></div>').append(symbol_container_html).addClass('vertical_connection');
		CSD.views.add_believed_state_for_element(the_connection, vertical_connection_html, discussion_context);
		
		
		//check if there are any more sibling vertical connections to render
		if (array_of_remaining_sibling_vertical_connections.length > 0) {
			element_group_html = CSD.views.html_for_an_element_group();
			array_of_remaining_sibling_vertical_connections.shift().render_in_html( discussion_context, element_group_html, {array_of_remaining_sibling_vertical_connections: array_of_remaining_sibling_vertical_connections, 
																															 the_horizontal_node: the_horizontal_node})
			vertical_connection_html.append(element_group_html);

		} else {
			//check if there's the_horizontal_node to render
			if (the_horizontal_node) {
				CSD.views.html_for_a_horizontal_node(the_horizontal_node, discussion_context, vertical_connection_html);
			}
		}
		html_div_to_render_in.append(vertical_connection_html);

		
		
		//check if there are any connections that connect to this vertical connection element
		array_of_horizontal_connections = the_connection.connections__to__this_element();
		array_of_horizontal_connections = CSD.views_manager.return_elements_in_view(array_of_horizontal_connections.elements);
		len = array_of_horizontal_connections.length;
		for (i = 0; i < len; i += 1) {
			array_of_horizontal_connections[i].render_in_html( discussion_context, vertical_connection_html);
		};
		
		
		//check if there are any nodes that this connection element connects from
		id_of_next_potential_node = the_connection.connects_from();
		if (CSD.session.view[discussion_context].ids_in_view().contains(id_of_next_potential_node)) {
			next_node = CSD.model.get_element_by_id(id_of_next_potential_node);
			if (next_node) {
				next_node.render_in_html( discussion_context, html_div_to_render_in);
			} else {
				console.log("error.  Requested element node of id = '" + id_of_next_potential_node + "' but it's not available.  #in CSD.views.html_for_a_vertical_connection");
			}
		}
		
		//return the most inner
	};
	
	
	

	
	CSD.views.html_for_a_horizontal_connection = function (the_connection, discussion_context, html_div_to_render_in) {
		var a_debug = the_connection.id();
		
		var the_horizontal_node_id = the_connection.connects_from(),
			the_horizontal_node = undefined,
			is_a_horizontal_connection_symbol = true,
			symbol_container_html,
			horizontal_connection_html,
			vertical_connections_to_this_horizontal_connection = the_connection.connections__to__this_element(),
			vertical_element_group_html,
			horizontal_element_group_html;
		
		symbol_container_html = CSD.views.html_for_a_connection_symbol_container(the_connection, discussion_context, is_a_horizontal_connection_symbol);
		horizontal_connection_html = $('<div></div>').append(symbol_container_html).addClass('horizontal_connection');
		CSD.views.add_believed_state_for_element(the_connection, horizontal_connection_html, discussion_context);
		
		//find if the horizontal node is in the elements to display
		if (CSD.session.view[discussion_context].ids_in_view().contains(the_horizontal_node_id)) {
			the_horizontal_node = CSD.model.get_element_by_id(the_horizontal_node_id);
		}
		
		//find which of the vertical connections to this horizontal connection is in the elements to display
		vertical_connections_to_this_horizontal_connection = CSD.views_manager.return_elements_in_view(vertical_connections_to_this_horizontal_connection.elements);
		//render any vertical connections to this horizontal connection
		if (vertical_connections_to_this_horizontal_connection.length > 0) {
			vertical_element_group_html = CSD.views.html_for_an_element_group();
			vertical_connections_to_this_horizontal_connection.shift().render_in_html( discussion_context, vertical_element_group_html, {array_of_remaining_sibling_vertical_connections: vertical_connections_to_this_horizontal_connection, 
																																		 the_horizontal_node: the_horizontal_node});
			horizontal_connection_html.append(vertical_element_group_html);
		} else {
			//check if there's the_horizontal_node to render
			if (the_horizontal_node) {
				CSD.views.html_for_a_horizontal_node(the_horizontal_node, discussion_context, horizontal_connection_html);
			}
		}
		
		
		
		html_div_to_render_in.append(horizontal_connection_html);
	};
	
	
	
	CSD.views.html_for_a_connection_symbol_container = function (the_connection, discussion_context, is_a_horizontal_connection_symbol) {
		var a_debug = the_connection.id();
		
		is_a_horizontal_connection_symbol = is_a_horizontal_connection_symbol || false;
		var symbol_html;
		var line_html;
		var symbol_container_html;
		var connection_direction = 'vertical';
		var connection_type = the_connection.subtype();
		var connection_symbol = '&#9650;'; // default is an up arrow
			
		if (connection_type === 'supports') {
			if (is_a_horizontal_connection_symbol) {
				connection_symbol = '&#9664;';
			}
		} else if (connection_type === 'questions') {
			connection_symbol = '?';
		} else if (connection_type === 'refutes') {
			connection_symbol = 'X';
		} else {
			console.log('ERROR: connection_type = "' + connection_type + '"   #in CSD.views.html_for_a_connection_symbol_container')
		}
		
		
		if (is_a_horizontal_connection_symbol) {
				connection_direction = 'horizontal';
		}
		
		
		symbol_html = $('<div></div>').append(connection_symbol).addClass( connection_type + ' ' + 'symbol');
		line_html = $('<div></div>').append(symbol_html).addClass(connection_direction + '_line');
		symbol_container_html = $('<div></div>').append(line_html).addClass('symbol_container').attr('element_id', the_connection.id()).attr('discussion_context', discussion_context);
		
		return symbol_container_html;
	};
	
	
	CSD.views.html_for_an_element_group = function (is_for_horizontal_node) {
		var element_group_html = $('<div></div>').addClass('element_group');
		
		if (is_for_horizontal_node) {
			element_group_html.addClass('horizontal');
		}
		
		return element_group_html;
	};
	
	
	
	
	
	CSD.views.options_for_element = function(the_element_to_display, html_to_render_in, discussion_context) {
		var the_element_id = the_element_to_display.id(),
			connection_elements_for_this_element = the_element_to_display.connection_elements(),
			connection_elements_connecting_from_this_element = CSD.views_manager.return_elements_NOT_in_view(connection_elements_for_this_element.connections_from_this_element.elements, discussion_context ),
			connection_elements_connecting__to__this_element = CSD.views_manager.return_elements_NOT_in_view(connection_elements_for_this_element.connections__to__this_element.elements, discussion_context ),
			options_div_html,
			div_for_hide_element_option,
			div_for_show_to_element_option = $('<div></div>').attr('element_id', the_element_id).attr('discussion_context', discussion_context).addClass('show_to option'),
			div_for_show_from_element_option = $('<div></div>').attr('element_id', the_element_id).attr('discussion_context', discussion_context).addClass('show_from option');
		
		//check there are any options to render in the first place
		//	Test 1: are there 'connection_elements_connecting_from_this_element' and or 'connection_elements_connecting__to__this_element'?
		if ((connection_elements_connecting_from_this_element.length > 0) || (connection_elements_connecting__to__this_element.length > 0)) {
			options_div_html = $('<div></div>').addClass('element_options');	

			//div_for_hide_element_option = $('<div></div>').append('hide')
			//											  .attr('id', the_element_id)
			//											  .addClass('hide_element, option');
			
			if (connection_elements_connecting_from_this_element.length < 1) {
				div_for_show_to_element_option.css('display', 'none');
			} else {
				console.log(' need to implement selector box for when an element like this has multiple elements it links to  #in CSD.views.options_for_element');
				div_for_show_to_element_option.append('to ' + connection_elements_connecting_from_this_element.length);
			}
			if (connection_elements_connecting__to__this_element.length < 1) {
				div_for_show_from_element_option.css('display', 'none');
			} else {
				div_for_show_from_element_option.append('from ' + connection_elements_connecting__to__this_element.length);
			}	
			
			options_div_html.append(div_for_hide_element_option)
							.append(div_for_show_to_element_option)
							.append(div_for_show_from_element_option);
							
			html_to_render_in.append($('<div></div>').addClass('divClear'));
			html_to_render_in.append(options_div_html);
		}
	};
	
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~	
	
	CSD.views.add_believed_state_for_element = function (the_element, the_element_div, discussion_context) {
		// get the authors for this view_context
		var author_ids = CSD.session.view[discussion_context].author_ids();
		//see if this element has any of those authors and, if so, what they believe the state of this element is
		var authors_of_belief_states_for_element = CSD.model.get_belief_states_by_element_id( the_element.id() );
		//check authors_of_belief_states_for_element !== undefined, as not all element will have belief states
		if (authors_of_belief_states_for_element !== undefined) {
			var i = 0, len = author_ids.length;
			var sum_of_elements_belief_states = {t: 0, f: 0, d: 0};
			
			for (i=0; i < len; i += 1) {
				//for each author id from the  'CSD.session.view[discussion_context].author_ids' check to see if this element has an entry for that author
				var an_author_id = author_ids[i];
				var a_belief_state = authors_of_belief_states_for_element[an_author_id];
				
				if (a_belief_state) {
					sum_of_elements_belief_states[a_belief_state.belief_state()] += 1;
				}
			};
			
			
			//apply the appropriate CSS to the element:  
			//believed_true, believed_false, unsure, dispute
			// and can have 'many' and 'consensus' as well.
			var sum = sum_of_elements_belief_states;
			if ((sum.t === 0) && (sum.f === 0) && (sum.d === 0)) {
				// no belief states for this element so do nothing
				
			} else if ((sum.t === 0) && (sum.f === 0)) {
				//mark as 'unsure'
				the_element_div.addClass(' ' + 'unsure');
				
			} else if ((sum.t === 0) && (sum.d === 0)) {
				//mark as 'believed_false'
				the_element_div.addClass(' ' + 'believed_false');
				
			} else if ((sum.f === 0) && (sum.d === 0)) {
				//mark as 'believed_true'
				the_element_div.addClass(' ' + 'believed_true');
				
			} else {
				//mark as 'dispute'
				the_element_div.addClass(' ' + 'dispute');
				
			}
		}
		
		
	};
	
	
	
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
//###############################    VIEWS (drawing selection boxes)       
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
	
	
	//highlight selected text with spans
	CSD.views.draw_selections = function (a_specific_element_id) {
		var html_elements_with_selections = AJP.u.keys(CSD.session.save_selection.selections);
		var i = 0, len;
			var selection_components_for_one_element;
			var jquery_element;
			var this_divs_original_text;
			//var previous_starting_point;
			var html_sections;
			var i_2 = 0, len_2;
				var a_selection_component;
				var this_selection_components_type;
				var i_3 = 0, len_3;
				var another_selection_component;
				var co_position_components;
				var number_of_selection_components_to_skip_in_loop;
				var this_and_co_position_components;
					var i_4 = 0, len_4;
				
				var open_selections = [];
				var next_selection_component;
				
				var start_point_of_this_section;
				var end_point_of_section;
				
				
				var text_for_this_section;
				var span_ids;
				var jquery_html_for_this_section;
		
		//reduce html_elements_with_selections array to contain only the a_specific_element_id
		if (a_specific_element_id) {
			html_elements_with_selections = [];
			//check it's in html_elements_with_selections
			if (CSD.session.save_selection.selections[a_specific_element_id]) {
				html_elements_with_selections.push(a_specific_element_id);
			}
			// else, leave the html_elements_with_selections array empty so we do nothing
		}
		
		
		len = html_elements_with_selections.length;
		for (i=0; i < len; i += 1) {
			selection_components_for_one_element = CSD.session.save_selection.selections[html_elements_with_selections[i]];
			jquery_element = $('[element_id="' + html_elements_with_selections[i] + '"]').children('.element_inner');
			this_divs_original_text = jquery_element.text();
			//reset
			number_of_selection_components_to_skip_in_loop = 0;
			html_sections = [];
			//set default value for html_sections[0]
			html_sections[0] = this_divs_original_text;
			
			
			len_2 = selection_components_for_one_element.length;
			for (i_2=0; i_2 < len_2; i_2 += 1) {
				a_selection_component = selection_components_for_one_element[i_2];
				this_selection_components_type = a_selection_component.type;
				
				//find start point of this selection/selection group
				start_point_of_this_section = a_selection_component.position;
				
				//find if there are any co-position components of the same type
				len_3 = len_2;
				co_position_components = [];
				this_and_co_position_components = [];
				for (i_3 = (i_2+1); i_3 < len_3; i_3 += 1) {
					another_selection_component = selection_components_for_one_element[i_3];
					if ((another_selection_component.position === start_point_of_this_section) && (another_selection_component.type === this_selection_components_type)) {
						co_position_components.push(another_selection_component);
					} else {
						break; // we can do this as the selection_components should be in order and grouped by type 'end' first, then type 'start' for co-position selection compoenents 
					}
				};
				number_of_selection_components_to_skip_in_loop = co_position_components.length;
				this_and_co_position_components.push(a_selection_component);
				this_and_co_position_components = this_and_co_position_components.concat(co_position_components);
				
				//update list of open_selections
				if (a_selection_component.type === 'start') {
					//add this selection & any co-position 'start'ing selections to the list of open_selections
					open_selections = open_selections.concat(this_and_co_position_components);
				} else { // selection component is an 'end' component
					//find and remove this and all other co-position 'end' components from the list of open_selections

					len_4 = this_and_co_position_components.length;
					for (i_4=0; i_4 < len_4; i_4 += 1) {  //loop through each co-position 'end' selection_component
						//var copy_of_open_selections = [].concat(open_selections);
						len_3 = open_selections.length;
						for (i_3=0; i_3 < len_3; i_3 += 1) { //loop through each open_selection
							if (open_selections[i_3].span_id === this_and_co_position_components[i_4].span_id) {
								//this open selection is in the list of selections that are ending, so remove it from the list of open_selections.
								//copy_of_open_selections.splice(i_3,1);		
								open_selections.splice(i_3,1);
								break;
							}
						};
						//open_selections = copy_of_open_selections;
					};
					
				}
				
				// the first time this loop runs, overwrite the default value for html_sections[0]
				if (i_2 === 0) {  
					html_sections[0] = this_divs_original_text.slice(0, start_point_of_this_section);
				}
				
				//find next component
				if ((i_2 + 1 + number_of_selection_components_to_skip_in_loop) < len_2) {
					next_selection_component = selection_components_for_one_element[i_2+1+number_of_selection_components_to_skip_in_loop];
					end_point_of_section = next_selection_component.position;
				} else if (a_selection_component.type !== 'end') {
					console.log("something's gone wrong #in CSD.views.draw_selections"); 
				} else {
					//we've reached the end so set the end_point_of_section to the maximum
					end_point_of_section = this_divs_original_text.length;
				}
				
				
				//get the text with in this div for this selection/selection group or this 'end selection component' to 'start selection component' section
				text_for_this_section = this_divs_original_text.substring(start_point_of_this_section, end_point_of_section);
				
				
				//check if there are any open_selections, 
				if (open_selections.length !== 0) {
					//for each of the 'start' selection components that are currently 'open', make a span with their ids in the multi_id attribute
					len_3 = open_selections.length;
					span_ids = [];
					for (i_3=0; i_3 < len_3; i_3 += 1) {
						span_ids.push(open_selections[i_3].span_id);
					};
					jquery_html_for_this_section = $('<span></span>').append(text_for_this_section).attr('span_ids', span_ids.join(' ')).addClass(open_selections[0].style);
					
					html_sections.push(jquery_html_for_this_section);
				} else {
					//there are no open_selections so just add the text_for_this_section to the html_sections
					html_sections.push(text_for_this_section);
				}
				
				//advance loop over already processed co-position elements.
				i_2 += number_of_selection_components_to_skip_in_loop;
			};
			
			//replace html contents of an element div with selections, with the generated html and jquery content of those selections:
			len_2 = html_sections.length;
			jquery_element.html('');
			for (i_2=0; i_2 < len_2; i_2 += 1) {
				html_sections[i_2];
				jquery_element.append(html_sections[i_2]);
			};
			
			//html_sections 
		}; // end of loop over html_elements_with_selections
		
	}; // end of drawing selections
	

	


//############################### 
//###############################    VIEWS HELPER       
//############################### 
	
	
	
	CSD.views_helper.recalculate_element_parts_for_draw_selections_method = function (optional_discussion_context) {
		CSD.session.clear_all_selections();
		
		//find any 'part' elements in CSD.views
		var part_elements_in_view = CSD.views_manager.return_all_part_elements_in_view(optional_discussion_context);
		var i = 0, len = part_elements_in_view.length;
		var a_part_element;
		var return_id_only = true;
		
		for (i=0; i < len; i += 1) {
			a_part_element = part_elements_in_view[i];
			CSD.session.save_selection(a_part_element.belonging_to_discussion_node(return_id_only), a_part_element.start(), a_part_element.end(), a_part_element.id(), 'discussion_node_part');
		};
		
	};
	
	
	
	CSD.views_helper.find_root_element_to_display = function (array_of_element_ids_in_view) {
		// go through array of element_ids and pull out each element in turn.
		//	Record each element that has no iel_links to any other elements in the 
		//	'array_of_element_ids_in_view'.  If there is only 1, then this is the root and return that ( as an array of length 1).  
		//	If there is more than 1 (i.e. the list of element id_s results in the layout having 
		//	an upwards branch) or 0 (i.e. is cyclic) then
		//	return an array containing those multiple values or an array of length 0.
		
		var i = 0, len = array_of_element_ids_in_view.length, 
			resulting_elements = [],
			an_element = undefined,
			i_two = 0, len_two = 0,
			connections_from_this_element = [],
			number_of_connections_from_an_element = 0,
			a_connected_to_element = undefined,
			id_of_a_connected_to_element = undefined,
			return_only_ids = true;
		
		// loop through all element_ids in 'array_of_element_ids_in_view'
		for (i=0; i < len; i += 1) {
			// for each id, recover it's corresponding element
			an_element = CSD.model.get_element_by_id(array_of_element_ids_in_view[i]);
			// if it doesn't exist yet, then log and error.... as it should.
			if (an_element === undefined) {
				console.log('Requested element id of ' + array_of_element_ids_in_view[i] + ' does not exist locally so will be ignored from finding the root element for displaying the view.  # in CSD.views_helper.find_root_element_id_to_display');
			} else {
				type_of_an_element = an_element.element_type();
				if (type_of_an_element === 'connection') {
					//the element is a connection so see if it connects to any elements in the 'array_of_element_ids_in_view'
					// if yes: don't do any thing.  If no: then this is a root element
					//d/var debug_a = an_element.connects_to(),
					//d/	debug_b = $.inArray(an_element.connects_to(), array_of_element_ids_in_view);
					if (array_of_element_ids_in_view.does_not_contain(an_element.connects_to())) {
						resulting_elements.push(an_element);
					}
					
				} else if (type_of_an_element === 'node') {
					//  cycle through each element that the current node element ('an_element') connects to.
					connections_from_this_element = an_element.connections_from_this_element(return_only_ids); 
					len_two = connections_from_this_element.length;
					number_of_connections_from_an_element = 0;
					
					for (i_two=0; i_two < len_two; i_two += 1) {
						//	get each "connected to" element's id.  
						id_of_a_connected_to_element = connections_from_this_element[i_two];
						
						// If it's in the 'array_of_element_ids_in_view', add 1 to number_of_connections_from_an_element
						if (array_of_element_ids_in_view.contains(id_of_a_connected_to_element)) {
							number_of_connections_from_an_element += 1;
						}
					}
					
					// add the id of 'an_element' to the 'resulting_elements' if it's number_of_connections_from_an_element == 0 
					//	i.e. this is the list of element's to display to the user to pick which root 
					//	of the discussion they'd like to see.
					if (number_of_connections_from_an_element === 0) {
						resulting_elements.push(an_element);
					}
					
				} else if (type_of_an_element === 'part') {
					if (array_of_element_ids_in_view.does_not_contain(an_element.belonging_to_discussion_node(return_only_ids))) {
						resulting_elements.push(an_element);
					}
					
				} else {
					console.log("unsupported element type: '" + an_element.element_type() + "' for element.id() = '" + an_element.id() + "' # in 'find_root_element_id_to_display' in 'csd.views' ")
				}
			}
		}
		
		return resulting_elements;
	};
	
	
	
