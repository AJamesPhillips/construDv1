/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.



//$(function () {    


//############################### 
//###############################	DATA MANAGER	//gets the data from the wbesite if it's not available to the models
//###############################

	CSD.data_manager.helper = {};
	CSD.data_manager.helper.new_data_holder = function () {
		var a_data_holder = {};
		var size = 0;
		var get_size = function () {
			return size;
		};
		var set_size = function (new_size) {
			size = parseInt(new_size);
		};
		var increment_size = function (increment_size_by) {
			size = size + parseInt(increment_size_by);
		};
			
		a_data_holder = {
			get_size: 		get_size,
			set_size: 		set_size,
			increment_size: increment_size};
		return a_data_holder;
	};
	
	
	CSD.data_manager.set_up_data_structure = function () {  // this functions is currently called in the javascript in elements/show.html.erb
		if (AJP.u.keys(CSD.data).length === 0) {

			CSD.data = { element_by_id: CSD.data_manager.helper.new_data_holder(),
						 inter_element_link_by_id: CSD.data_manager.helper.new_data_holder(),
						 belief_state_by_author_id: CSD.data_manager.helper.new_data_holder(),
						 belief_state_by_element_id: CSD.data_manager.helper.new_data_holder()
						};
		}
	};
	
	CSD.data_manager.set_up_data_structure();
	
	
	
	CSD.data_manager.ensure_array_of_elements_are_available_or_retrieve_them_and_then_call_function = function (array_of_element_ids_to_get, degrees_of_view, function_to_call_once_data_is_available, parameters_for_function) {
		var array_of_missing_element_ids = [];
		
		// iterate over array_of_element_ids_to_get, getting each using  CSD.data.element_by_id[ an_id ];
		//	if it returns undefined, then add it to the list of ids to get from data_manager	
		array_of_missing_element_ids = CSD.model.identify_unavailable_elements(array_of_element_ids_to_get, degrees_of_view);
		
		if (array_of_missing_element_ids.length !== 0) {
			CSD.data_manager.get_data_by_ajax(array_of_missing_element_ids, function_to_call_once_data_is_available, parameters_for_function);
			return false;
		} else {
			return true;
		}
	};
	
	
	
	// array_of_elements_ids_to_get  will be in the form of N-n,N-n,N-n Where N is the id of 
	//  the element to get and 'n' is the degrees of view around that element.
	CSD.data_manager.get_data_by_ajax = function (array_of_elements_ids_to_get, function_to_call_once_data_is_available, parameters_for_function) {  //, degrees_of_neighbours) {
		// implement AJAX for single element request
		if (array_of_elements_ids_to_get.length !== 0) {
			$.getJSON(("/elements/" + array_of_elements_ids_to_get + ".json"), function(data) {
				var an_element_id;
				var an_element = undefined;
				var i = 0;
				var len = array_of_elements_ids_to_get.length;
				var all_elements_are_now_present = true;
				
				CSD.data_manager.add_data(data);
				//d/ alert('I am ready noiw! and array_of_elements_ids_to_get is_array = ' + (AJP.u.is_array(array_of_elements_ids_to_get)) + ' typeof = ' + (typeof array_of_elements_ids_to_get));

				
				// check each element is now available
				for (i = 0; i < len; i += 1) {
					an_element_id = array_of_elements_ids_to_get[i];
					an_element_id = an_element_id.split('-')[0];  //because some id's will be in the form of 23(4) where the 4 is the number of degrees of connections to obtain.
					an_element = CSD.data.element_by_id[an_element_id];
					if (an_element === undefined) {
						all_elements_are_now_present = false;
						console.log('invalid request\n  element id of ' + array_of_elements_ids_to_get[i] + ' does not exist.  # in CSD.data_manager.get_data_by_ajax');
						//throw {
						//	name: 'invalid request',
						//	message: 'element id of ' + array_of_elements_ids_to_get + 'does not exist'
						//};
					}
				}
				
				if (all_elements_are_now_present) {
					CSD.helper.call_provided_function(function_to_call_once_data_is_available, parameters_for_function);
				}
			});
		} else {
			console.log('invalid request\n  Array_of_elements_ids_to_get of ' + array_of_elements_ids_to_get + ' is empty.  # in CSD.data_manager.get_data_by_ajax');
		}
		
//  	$.getScript("http://localhost:3000/elements/" + id_of_element_to_get + ".js", function(data, textStatus){
//  	   console.log(data); //data returned
//  	   console.log(textStatus); //success
//  	   console.log('Load was performed.');
//  	});
		//return the_element_to_get;
	};
	
	
	CSD.data_manager.add_data = function (some_json_element_and_iel_link_data) {  // this functions is currently called in the javascript in elements/show.html.erb
		var new_elements = some_json_element_and_iel_link_data["elements"];
		var new_iel_links = some_json_element_and_iel_link_data["inter_element_links"];
		var new_belief_states = some_json_element_and_iel_link_data["belief_states"];
		CSD.data_manager.add_new_elements_from_data( new_elements );
		CSD.data_manager.add_new_iel_links_from_data( new_iel_links );
		CSD.data_manager.add_new_belief_states_from_data( new_belief_states );
	};
	
	
	CSD.data_manager.add_new_elements_from_data = function (new_elements) {
		var i = 0, len = new_elements.length, num_of_elements_added = 0;
		
		for (i = 0; i < len; i += 1){
			var the_potential_new_element = CSD.model.element(new_elements[i]);
			var id_of_the_potential_new_element = the_potential_new_element.id();
			if (!CSD.data.element_by_id[id_of_the_potential_new_element]) {
				CSD.data.element_by_id[id_of_the_potential_new_element] = the_potential_new_element;
				num_of_elements_added += 1;
			} //d/ else { alert('Already have element of id = ' + keys[i] + ' in CSD.data.element_by_id'); }
		}
		CSD.data.element_by_id.increment_size(num_of_elements_added);
	};
	
	
	CSD.data_manager.add_new_iel_links_from_data = function (new_iel_links) {
		var i = 0, len = new_iel_links.length, num_of_iel_links_added = 0;

		for (i = 0; i < len; i +=1){
			var new_iel_link_object = CSD.model.inter_element_link(new_iel_links[i]);
			if ( CSD.data_manager.add_an_inter_element_link( new_iel_link_object ) ) { 
				num_of_iel_links_added += 1; // CSD.data_manager.add_an_inter_element_link() returns true if it's added a new link, therefore, increase size by 1.
			};
		}
		// set new 'size?' of CSD.data.element_by_id
		CSD.data.inter_element_link_by_id.increment_size(num_of_iel_links_added);
	};
	
	
	
	
	
	CSD.data_manager.add_new_belief_states_from_data = function (new_belief_states) {
		var i = 0, len = new_belief_states.length
		var num_of_belief_state_authors_added = 0;
		var num_of_belief_state_elements_added = 0;
			var some_potentially_new_author_ids = []; //@TODO, move this from here and into CSD.views_manger (some how, and at some time)

		for (i = 0; i < len; i +=1){
			var new_belief_state_object = CSD.model.belief_state( new_belief_states[i] );
			var author_id_of_the_new_belief_state_object = new_belief_state_object.author_id();
			var element_id_of_the_new_belief_state_object = new_belief_state_object.element_id();
			
			//add belief_states by author_id and then by element_id
			if (!CSD.data.belief_state_by_author_id[author_id_of_the_new_belief_state_object]) {
				CSD.data.belief_state_by_author_id[author_id_of_the_new_belief_state_object] = CSD.data_manager.helper.new_data_holder();
				CSD.data.belief_state_by_author_id[author_id_of_the_new_belief_state_object][element_id_of_the_new_belief_state_object] = new_belief_state_object;
				CSD.data.belief_state_by_author_id[author_id_of_the_new_belief_state_object].increment_size(1);
				num_of_belief_state_authors_added += 1;
			} else {
				if (!CSD.data.belief_state_by_author_id[author_id_of_the_new_belief_state_object][element_id_of_the_new_belief_state_object]) {
					CSD.data.belief_state_by_author_id[author_id_of_the_new_belief_state_object][element_id_of_the_new_belief_state_object] = new_belief_state_object;
					CSD.data.belief_state_by_author_id[author_id_of_the_new_belief_state_object].increment_size(1);
				} else {
					console.log('WARN:  did not update CSD.data.belief_state_by_author_id of author_id = "' + author_id_of_the_new_belief_state_object + '"  #in CSD.data_manager.add_new_belief_states_from_data.  As there is an existing value.');
				}
			}
			
			//add belief_states by element_id and then by author_id
			if (!CSD.data.belief_state_by_element_id[element_id_of_the_new_belief_state_object]) {
				CSD.data.belief_state_by_element_id[element_id_of_the_new_belief_state_object] = CSD.data_manager.helper.new_data_holder();
				CSD.data.belief_state_by_element_id[element_id_of_the_new_belief_state_object][author_id_of_the_new_belief_state_object] = new_belief_state_object;
				CSD.data.belief_state_by_element_id[element_id_of_the_new_belief_state_object].increment_size(1);
				num_of_belief_state_elements_added += 1;
			} else {
				if (!CSD.data.belief_state_by_element_id[element_id_of_the_new_belief_state_object][author_id_of_the_new_belief_state_object]) {
					CSD.data.belief_state_by_element_id[element_id_of_the_new_belief_state_object][author_id_of_the_new_belief_state_object] = new_belief_state_object;
					CSD.data.belief_state_by_element_id[element_id_of_the_new_belief_state_object].increment_size(1);
				} else {
					console.log('WARN:  did not update CSD.data.belief_state_by_element_id of element_id = "' + element_id_of_the_new_belief_state_object + '"  #in CSD.data_manager.add_new_belief_states_from_data.  As there is an existing value.');
				}
			}
			
			
			some_potentially_new_author_ids.push( author_id_of_the_new_belief_state_object ); //@TODO, move this from here and into CSD.views_manger (some how, and at some time)
		}
		
		//@TODO move this from here and into CSD.views_manger (some how, and at some time)
		var sides = CSD.views_manager.all_discussion_contexts();
		var i = 0, len = sides.length;
		
		for (i=0; i < len; i += 1) {
			CSD.session.view[sides[i]].author_ids( CSD.session.view[sides[i]].author_ids().concat( some_potentially_new_author_ids ).unique() );
		};
		
		
		// set new 'size?' of CSD.data.belief_state_by_author_id   and  belief_state_by_element_id
		CSD.data.belief_state_by_author_id.increment_size(num_of_belief_state_authors_added);
		CSD.data.belief_state_by_element_id.increment_size(num_of_belief_state_elements_added);
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




	
	
	
//});




