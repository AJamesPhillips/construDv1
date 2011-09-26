/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.



//############################### 
//###############################    SESSION   
//############################### 
	
	//set default of this session to not editing.
	CSD.session.editing = false;
	
	//store, retrieve and destroy record of current selected discussion element
	CSD.session.selected_element_html_id = function (the_selection_element) {
		if (the_selection_element) {
			CSD.session.selected_element_html_id.element_html_id = the_selection_element.id;
		} else if (the_selection_element === false) {
			CSD.session.selected_element_html_id.element_html_id = undefined;
		} else {
			return CSD.session.selected_element_html_id.element_html_id;
		}
	};
	
	
	
	CSD.session.save_selection = function (clicked_element_html_id, start_point_of_selection, end_point_of_selection) {
		CSD.session.save_selection.selections = CSD.session.save_selection.selections || {};
		CSD.session.save_selection.selections[clicked_element_html_id] = CSD.session.save_selection.selections[clicked_element_html_id] || [];
		var elements_selection_components = CSD.session.save_selection.selections[clicked_element_html_id];
		var copy_of_elements_selection_components = [].concat(CSD.session.save_selection.selections[clicked_element_html_id]); // creates a copy of it.
		var i=0, len = elements_selection_components.length;
		var a_selection_component;
		var still_need_to_inserted_start_position = still_need_to_inserted_end_position = true;
		var start_selection_componenet = {position: start_point_of_selection, type: 'start', span_id: ('A_SPAN_'+len)};
		var end_selection_componenet = {position: end_point_of_selection, type: 'end', span_id: ('A_SPAN_'+len)};
		
		if (start_point_of_selection < end_point_of_selection) {
			//get each selection component and read it's position.
			// Insert the start and stop points at the suitable positions
			for (i=0; i < len; i += 1) {
				a_selection_component = elements_selection_components[i];
				//assess if the start selection component should be inserted
				if ((a_selection_component.position >= start_point_of_selection) && (still_need_to_inserted_start_position)) {
					if ((a_selection_component.type === 'end') && (a_selection_component.position === start_point_of_selection)) {
						//don't insert this start point before the end point that it's co-locating with... this will make the 'TEMP.draw_selections' function easier
					} else {
						copy_of_elements_selection_components.splice(i, 0, start_selection_componenet);
						still_need_to_inserted_start_position = false;
					}
				}
				
				//assess if the end selection component should be inserted
				if ((a_selection_component.position >= end_point_of_selection) && (still_need_to_inserted_end_position)) {
					copy_of_elements_selection_components.splice(i+1, 0, end_selection_componenet);//i+1 because the start element will always be insert before the end element
					still_need_to_inserted_end_position = false;
				}
			};
			if (still_need_to_inserted_start_position) {
				copy_of_elements_selection_components.push(start_selection_componenet);
			}
			if (still_need_to_inserted_end_position) {
				copy_of_elements_selection_components.push(end_selection_componenet);
			}
			
			//reassign values stored in shorthand variable name
			CSD.session.save_selection.selections[clicked_element_html_id] = copy_of_elements_selection_components;
		} else {
			console.log('invalid parameters:\nStart point needs to be < than end point.  start_point_of_selection = ' + start_point_of_selection + ' but end_point_of_selection = ' + end_point_of_selection + '  #in .save_selection');
		}
		
	};

