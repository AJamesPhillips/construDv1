/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.
	
	
//############################### 
//###############################    VIEWS MANAGER    - keeps track of what should and should not be displayed   
//############################### 
	
	CSD.views_manager.degrees_of_view = function () {
		return 2;
	};
	CSD.views_manager.minimum_buffer_degrees_of_view = function () {
		return 2;
	};
	CSD.views_manager.max_degrees_of_view = function () {
		return 6;
	};

	
	
	// each is recording which part of the view should be displayed, and which element is the root.
	CSD.session.view = {};
	CSD.session.view.type = 'general';

	CSD.session.view.general =  {root_element_id: undefined, ids_in_view: [], html_id_of_view_container: 'main_discussion_container'};   
	CSD.session.view.question = {root_element_id: undefined, ids_in_view: [], html_id_of_view_container: 'discussion_definition', minimised: false};
	CSD.session.view.pro =  	{root_element_id: undefined, ids_in_view: [], html_id_of_view_container: 'pro_side_discussion_container',  minimised: false, all_answer_ids: []};
	CSD.session.view.dn =   	{root_element_id: undefined, ids_in_view: [], html_id_of_view_container: 'dn_side_discussion_container',   minimised: false, all_answer_ids: []};
	CSD.session.view.anti = 	{root_element_id: undefined, ids_in_view: [], html_id_of_view_container: 'anti_side_discussion_container', minimised: false, all_answer_ids: []};
	//n.b. for pro, dn and anti, if root_element_id === undefined, and all_answer_ids === [], there is no know answer for the question posed
	//							 if root_element_id === undefined, and all_answer_ids === [some-ids], there are several answers, and one has yet to be chosen for display
	//							 if root_element_id === some-id, and all_answer_ids === [], there  is only 1 answers, and it's chosen for display
	//							 if root_element_id === some-id, and all_answer_ids === [some-ids], there are several answers and 1 has been chosen for display
	
	
	
	CSD.views_manager.answer_discussion_contexts = function () {
		return ['pro', 'dn', 'anti'];
	};
	CSD.views_manager.eqivalent_intent_names = function () {
		return ['supporting', 'questioning', 'refuting'];
	};
	CSD.views_manager.all_discussion_contexts = function () {
		return CSD.views_manager.answer_discussion_contexts().concat(['general', 'question']);
	};
	
	
	
	CSD.views_manager.set_view_as_question = function (question_node_id, do_not_update_view_to_find_answers) {
		CSD.session.view.type = 'question';
		CSD.session.view.question.minimised = false;
		CSD.session.view.question.root_element_id = question_node_id;
		
		//set the question as being in the view of CSD.session.view.question
		CSD.views_manager.add_element_and_degrees_of_linkage_to_a_view_context(question_node_id, 'question', 4);
		
		//find any answers to this question and display them in their appropriate contexts
		var the_question_node = CSD.model.get_element_by_id(question_node_id);
		var results = the_question_node.answer_connections_and_nodes_for_this_question();
		var answer_nodes = results.answer_nodes;
		var answer_connection_ids = []
		
		// do all processing for each side of the discussion
		var sides = CSD.views_manager.answer_discussion_contexts();
		var sides2 = CSD.views_manager.eqivalent_intent_names();
		var side;
		var i = 0, len = sides.length;
		
		for (i=0; i < len; i += 1) {
			//collect all answer_connection_ids
			answer_connection_ids = answer_connection_ids.concat(results.answer_connections__to__this_element[sides2[i]].ids);
			
			if (!do_not_update_view_to_find_answers) {
				side = sides[i];
				
				//set the minimised values  to false;
				CSD.session.view[side].minimised = false;
				
				//if there is are only one answer for this discussion side, then set this as the root element_id
				var answers_for_this_side = answer_nodes[sides2[i]];
				var number_of_answers_for_this_side = answers_for_this_side.ids.length
				if (number_of_answers_for_this_side === 0) {
					CSD.session.view[side].root_element_id = undefined;
					CSD.session.view[side].all_answer_ids = [];
				} else if (number_of_answers_for_this_side === 1) {
					CSD.session.view[side].root_element_id = answers_for_this_side.ids[0];
					CSD.session.view[side].all_answer_ids = [];
					//calculate ids in view
					CSD.views_manager.add_element_and_degrees_of_linkage_to_a_view_context( CSD.session.view[side].root_element_id, side, 4);
				} else {
					CSD.session.view[side].root_element_id = undefined;
					CSD.session.view[side].all_answer_ids = answers_for_this_side.ids;
					CSD.views_manager.add__multiple_elements_to_a_degree_of_linkage_to_a_view_context( answers_for_this_side.ids, side, 0);
				}
			}
		}
		
		//remove the answer connection ids from being in the 'question' view context
		CSD.session.view.question.ids_in_view = CSD.session.view.question.ids_in_view.remove_array(answer_connection_ids);
		
	};
	
	
	
	CSD.views_manager.set_the_answer_to_view = function (answer_node_id, discussion_context) {
		if (CSD.session.view.type === 'question') {
			//check it is a valid answer discussion_context
			if (CSD.views_manager.answer_discussion_contexts().contains( discussion_context )) {
				CSD.session.view[discussion_context].root_element_id = answer_node_id;
				CSD.session.view[discussion_context].minimised = false;
				
				CSD.views_manager.add_element_and_degrees_of_linkage_to_a_view_context(answer_node_id, discussion_context, 4);
				
			} else {
				console.log('invalid discussion_context: "' + discussion_context + '" #in CSD.views_manager.set_the_answer_to_view');
			}
		} else {
			console.log('can not set an answer whilst CSD.session.view.type !== "question"  (currently it is set to: "' + CSD.session.view.type + '" #in CSD.views_manager.set_the_answer_to_view');
		}
	};
	
	
	CSD.views_manager.set_view_as_general = function (a_discussion_element_id) {
		CSD.session.view.type = 'general';
		CSD.session.view.general.root_element_id = a_discussion_element_id;

		CSD.views_manager.add_element_and_degrees_of_linkage_to_a_view_context(a_discussion_element_id, 'general', 4);
	};

	//add the 'a_discussion_element_id' and the ids of any linked elements (to a degree 
	//  of 'degrees_of_view') to CSD.session.view[discussion_context].ids_in_view
	//		n.b. @TODO would be nice to implement this where, if the discussion_element.type() === node, it only finds elements that are either connections to the 
	//		discussion_element or are parts, or if discussion_element.type() === connection then only nodes connected from the discussion_element, or connections to it. 
	CSD.views_manager.add_element_and_degrees_of_linkage_to_a_view_context = function (a_discussion_element_id, discussion_context, degrees_of_view, clear_ids_to_view) {
		//check it is a valid discussion_context
		if (CSD.views_manager.all_discussion_contexts().contains( discussion_context )) {
			if (clear_ids_to_view) {
				CSD.session.view[discussion_context].ids_in_view = [];
			}
			//set the element as being in the view of CSD.session.view.[context]
			CSD.session.view[discussion_context].ids_in_view.push(a_discussion_element_id);
			
			var the_element = CSD.model.get_element_by_id(a_discussion_element_id);
			//find all of the elements linked to this element
			if (degrees_of_view !== 0) { //test for not being 0, otherwise .ids_of_linked_elements() method will change 0 into 1.
				var elements_ids_linked_to_this_element = the_element.ids_of_linked_elements(degrees_of_view);  // n.b. this doesn't ensure it will actually go to 'degrees_of_view' degrees of linkage
				//add these to the ids_in_view for this view context:
				CSD.session.view[discussion_context].ids_in_view = CSD.session.view[discussion_context].ids_in_view.concat(elements_ids_linked_to_this_element);
			}
			
			CSD.session.view[discussion_context].ids_in_view = CSD.session.view[discussion_context].ids_in_view.unique();
		}
	};
	
	//takes an array of element ids and iterates over this calling CSD.views_manager.add_element_and_degrees_of_linkage_to_a_view_context 
	CSD.views_manager.add__multiple_elements_to_a_degree_of_linkage_to_a_view_context = function (a_array_of_discussion_element_ids, discussion_context, degrees_of_view) {
		var i = 0, len = a_array_of_discussion_element_ids.length;
		var a_discussion_element_id;
		
		for (i=0; i < len; i += 1) {
			a_discussion_element_id = a_array_of_discussion_element_ids[i];
			CSD.views_manager.add_element_and_degrees_of_linkage_to_a_view_context(a_discussion_element_id, discussion_context, degrees_of_view);
		};
	};
	
	
	
	
	
	//  ids_of_elements_to_add can be:
	//		an array of element ids
	//		@TODO: or an object where the keys are the element ids and the values are the degrees of view
	//n.b. never send a 'discussion_context'  of value 'all' as this will screw things up.
	CSD.views_manager.add_elements = function (ids_of_elements_to_add, discussion_context) {
		var i = 0, len = ids_of_elements_to_add.length;  
		var id_of_element_to_add = undefined;
		var index_of_element_id = undefined;
		
		////check discussion context exists, if not initialise it to an empty array.
		//CSD.session.views_data.to_display[discussion_context] = CSD.session.view[discussion_context].ids_in_view || [];
		
		for (i=0; i < len; i += 1) {
			id_of_element_to_add = ids_of_elements_to_add[i];
			//check if it's already in the array of element_ids to display to prevent duplicates
			index_of_element_id = $.inArray(id_of_element_to_add, CSD.session.view[discussion_context].ids_in_view);
			
			if (index_of_element_id === -1 ) {
				// element_id is not in array so include it
				CSD.session.view[discussion_context].ids_in_view.push(id_of_element_to_add);
				//CSD.session.views_data.to_display.all.push(id_of_element_to_add);
			}
		};
	};
	
	
	CSD.views_manager.remove_elements = function (element_ids_to_remove, discussion_context) {
		if (CSD.session.view[discussion_context]) {
			CSD.session.view[discussion_context].ids_in_view.remove_array(element_ids_to_remove);
			CSD.session.view[discussion_context].ids_in_view.remove_array(element_ids_to_remove);
		} else {
			console.log('invalid discussion context: "' + discussion_context + '" sent to CSD.views_manager.remove_elements');
		}
	};
	
	
	
	
	// find all elements in this array of discussion elements that are marked as being in the view.
	CSD.views_manager.return_elements_in_view = function (an_array_of_discussion_elements, optional_discussion_context) {
		
		var iterate_over_a_view_context_for_presence_of_id_in_array_of_supplied_elements = function (discussion_context, an_array_of_discussion_elements) {
			function element_in_view (element, index, array) {
				// element = a discussion element in the 'connections_to_this_node' array
				return (CSD.session.view[discussion_context].ids_in_view.contains(element.id()));
			}
			return an_array_of_discussion_elements.filter(element_in_view);
		}
		
		var results = CSD.views_manager.iterate_over_a_or_all_view_contexts( iterate_over_a_view_context_for_presence_of_id_in_array_of_supplied_elements, optional_discussion_context, 'CSD.views_manager.return_elements_NOT_in_view', an_array_of_discussion_elements);
		//results.elements = results.elements.unique().remove(undefined);
		//results.ids = results.ids.unique().remove(undefined);
		return results;
	};
	
	CSD.views_manager.from_ids_return_elements_in_view = function (an_array_of_discussion_element_ids, optional_discussion_context) {
		var elements = [];
		var i = 0, len = an_array_of_discussion_element_ids.length;
		
		for (i=0; i < len; i += 1) {
			elements.push(CSD.model.get_element_by_id(an_array_of_discussion_element_ids[i]));
		};
		
		return CSD.views_manager.return_elements_in_view(elements, optional_discussion_context);
	};
	
	
	// find all elements in this array of discussion elements that are marked as NOT being in the view.
	CSD.views_manager.return_elements_NOT_in_view = function (an_array_of_discussion_elements, optional_discussion_context) {
		var iterate_over_a_view_context_for_absence_of_id_in_array_of_supplied_elements = function (discussion_context, an_array_of_discussion_elements) {
			function element_in_view (element, index, array) {
				return (!(CSD.session.view[discussion_context].ids_in_view.contains(element.id())));
			}
			return an_array_of_discussion_elements.filter(element_in_view);
		}
		
		var results = CSD.views_manager.iterate_over_a_or_all_view_contexts( iterate_over_a_view_context_for_absence_of_id_in_array_of_supplied_elements, optional_discussion_context, 'CSD.views_manager.return_elements_NOT_in_view', an_array_of_discussion_elements);
		//results.elements = results.elements.unique().remove(undefined);
		//results.ids = results.ids.unique().remove(undefined);
		return results;
	};
	
	
	CSD.views_manager.return_all_part_elements_in_view = function (optional_discussion_context) {
		var iterate_over_a_view_context_for_part_elements = function (discussion_context) {
			//iterate through list of elements in view for a particular discussion_context and return only those which have the element_type 'part'
			var i = 0, len = CSD.session.view[discussion_context].ids_in_view.length;
			var an_element;
			var elements_that_are_parts = [];//= {ids: [], elements: []};
			
			for (i=0; i < len; i += 1 ) {
				an_element = CSD.model.get_element_by_id(CSD.session.view[discussion_context].ids_in_view[i]);
				if (an_element.is_a_part_element_q()) {
					//elements_that_are_parts.ids.push(an_element.id());
					//elements_that_are_parts.elements.push(an_element);
					elements_that_are_parts.push(an_element);
				}
			};
			return elements_that_are_parts;
		};
		
		var results = CSD.views_manager.iterate_over_a_or_all_view_contexts( iterate_over_a_view_context_for_part_elements, optional_discussion_context, 'CSD.views_manager.return_elements_that_are_parts_that_are_in_view');
		
		return results.unique();
	};
	
	
	
	CSD.views_manager.iterate_over_a_or_all_view_contexts = function (filter_function, optional_discussion_context, calling_function_name, additional_parameters_for_function) {
		//if there's a valid discussion_context, the just return the parts that are in that context.
		if (optional_discussion_context) {
			if (CSD.session.view[optional_discussion_context]) {
				return filter_function(optional_discussion_context, additional_parameters_for_function);
			} else {
				console.log('invalid discussion context: "' + optional_discussion_context + '" sent to ' + calling_function_name);
			}
		}
		
		//default action: find, then iterate over all discussion contexts
		var all_discussion_contexts = CSD.views_manager.all_discussion_contexts();
		var i = 0, len = all_discussion_contexts.length;
		var results = {};
		var results_from_all_discussion_context = [];// = {ids: [], elements: []};
		
		for (i=0; i < len; i += 1 ) {
			results = filter_function(all_discussion_contexts[i], additional_parameters_for_function);
			results_from_all_discussion_context = results_from_all_discussion_context.concat(results);
			//results_from_all_discussion_context.ids = results_from_all_discussion_context.ids.concat( results.ids );
			//results_from_all_discussion_context.elements = results_from_all_discussion_context.elements.concat( results.elements );
		}
		return results_from_all_discussion_context;
	};
	
	
	
	
	

