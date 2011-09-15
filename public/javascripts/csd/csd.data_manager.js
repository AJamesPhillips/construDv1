
//$(function () {    


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




	
	
	
//});




