/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.



//without editing enabled:
//left mouse_down selects element, finds linked elements, adds those to views_manager, refreshes display


//with editing enabled:
//left mouse_down on element selects it (stores it in the CSD.session.selected_element_html_id)
//left mouse_up (any where in document): we get any selected text
//		if length of selected text === 0  don't do anything
//		otherwise, select all the appropriate text within the mouse_DOWN element div and stores it (for the moment) in the CSD.session.save_selection
//			then call a refresh of the selection components to highlight the text




//############################### 
//###############################    ROUTES   
//############################### 
	
	CSD.routes.setup = function () {
		CSD.routes.add__edit_discussion__button_handlers();
		CSD.routes.add_discussion_container_handlers();
	};
	
	CSD.routes.refresh = function () {
		CSD.routes.add_element_click_handlers();
	};

	// add onClick handlers for the elements
	CSD.routes.add_element_click_handlers = function () {
	    
		$(".element_inner, .symbol_container").bind('mousedown', function (e) {
			CSD.session.selected_element_html_id(this);
			
			if (!CSD.session.editing) {
				var the_element = CSD.model.get_element_by_id(CSD.session.selected_element_html_id());
				CSD.controller.element.left_mouse_down(the_element);
			}
		});
		
		
		//$('.element_inner, .symbol_container').bind('mouseup.CSD', function (event1, ui) {
	    //	var element_id = this.id;
	    //	var the_element = CSD.model.get_element_by_id(element_id);
	    //	var the_selection = undefined;
	    //		
		//    switch (event1.which) {
		//        case 1:
		//            //Left mouse button pressed on a discussion element.
//		//            CSD.controller.selection_occured();
		//            CSD.controller.element.left_mouse_up(the_element);
		//            event1.stopPropagation();
		//            break;
		//        case 2: //Middle mouse button pressed
		//            break;
		//        case 3: //Right mouse button pressed on a discussion element.
		//        		//	select this discussion element and allow event to propagate to 
		//        		//	the discussion container where it will trigger creating a new discussion element
		//        		
		//            break;
		//        default: //You have a strange mouse
		//    }
	    //});

	};
	
	
	CSD.routes.add__edit_discussion__button_handlers = function () {
		$("#edit_discussion").bind('mousedown', function (e) {
			CSD.session.editing = !CSD.session.editing;
			CSD.views.update_editing_button();
		});
	
		$("#edit_discussion").bind('mouseup', function (e) {
			e.stopPropagation();  // probably not really needed but prevents aberrant calls to 
			// .get_selected_text which fails to provide the selected_text needed for 
		});
	};
	
	
	// add onClick handlers for the discussion container
	CSD.routes.add_discussion_container_handlers = function () {
		//$(document).bind('mouseup', function () {

		//});
			
	    $('#discussion_container').bind('mouseup.CSD', function(event2) {
			event2.stopPropagation();
		    switch (event2.which) {
		        case 1: //Left mouse button pressed
					var selected_element_html_id = CSD.session.selected_element_html_id();
					//check that user is in editing mode and had clicked on valid element
					if (CSD.session.editing && selected_element_html_id) {
						//find the text selected by the user
						CSD.rh.find_selected_parts_of_discussion_elements(selected_element_html_id);
						//highlight selected text with spans
						CSD.views.draw_selections(selected_element_html_id);
					}
		        	//alert('left');
		            break;
		        case 2: //Middle mouse button pressed
		            break;
		        case 3: //Right mouse button pressed
		        	//alert('right');
		            break;
		        default: //You have a strange mouse
		    }
		});
	};
	
	
//############################### 
//###############################    ROUTES HELPER   
//############################### 

	

	CSD.rh.find_selected_parts_of_discussion_elements = function (id_of_mousedown_element) {
		var user_selection = CSD.rh.get_selection();
		var range_object = CSD.rh.get_range_object(user_selection);
		var the_mousedown_node = range_object.startContainer;
		var the_mousedown_node_startOffset = range_object.startOffset;
		
		//because range_object has startContainer set to the mouse_up element of a reverse selection as opposed to the mouse_down element, 
		// we need to test that the start container has the same id as the CSD.session.selected_element_html_id()
		// if not, then we'll choose the range_object.endContainer as the value for the_mousedown_node
		if (CSD.session.selected_element_html_id() !== $(the_mousedown_node).closest('.element').attr('id')) {
			the_mousedown_node = range_object.endContainer;
			the_mousedown_node_startOffset = range_object.endOffset
		}
		
		//get all the textNode children in the mouse down div.
		var text_nodes_in_selected_html_element = AJP.u.get_text_nodes_in(document.getElementById(id_of_mousedown_element));

		//now go down through textNode children of div.element that had the mousedown, adding the 
		// lengths of the textNodes until, you reach the_mousedown_node
		var a_text_node = text_nodes_in_selected_html_element.shift();
		var length_of_text_to_range_start_offset = 0;
		while (a_text_node !== the_mousedown_node) {
			length_of_text_to_range_start_offset += a_text_node.length;
			a_text_node = text_nodes_in_selected_html_element.shift();
		}
		length_of_text_to_range_start_offset += the_mousedown_node_startOffset;
		
		
		//var startNode = range_object.startContainer.childNodes[range_object.startOffset] || range_object.startContainer;
		
		var selected_text_string = user_selection.toString().replace(/\n/,'', 'g').replace(/\r/,'', 'g');
		var length_of_raw_selection = selected_text_string.length;
		var the_mousedown_div = $('#'+id_of_mousedown_element);
		var clicked_div_text = the_mousedown_div.text();
		//var clicked_div_html = the_mousedown_div.html();
		var max_length_of_selection_within_an_element = clicked_div_text.length;
		
		//check there's been a selection or just a mouse click
		if (length_of_raw_selection > 0) {
			var starting_point = length_of_text_to_range_start_offset;
			var length_to_take_from_selection;
			var part_of_div_text_to_test;
			var direction_of_selection_is_forward;
			var selected_text_within_mousedown_element_div = '';
			
			//unfortunately there's no nice way to tell if selection is going forwards or backwards from the starting_point
			// so take the text going forward from starting_point, to a maximum of length_of_raw_selection, or 
			// (max_length_of_selection_within_an_element-starting_point), which ever is smaller.  and see if this 
			// matches the first characters of selected_text_string, if so we'll make the (potentially erroneous) assumption that 
			// the user has selected forwards
			// if no match is found at the beginning, we'll assume the selection was made backwards and take
			// a length of the selected_textstring from the end to a length of starting_point or length_of_raw_selection, again
			// whichever is smaller.
			
			if ((max_length_of_selection_within_an_element-starting_point) < length_of_raw_selection) {
				length_to_take_from_selection = (max_length_of_selection_within_an_element-starting_point);
			} else {
				length_to_take_from_selection = length_of_raw_selection;
			}
			
			part_of_div_text_to_test = clicked_div_text.substr(starting_point, length_to_take_from_selection);
			
			//test if the part_of_div_text_to_test is at the start of the user_selection, if yes, we have to test the selection to make sure it's not backwards.
			if ((selected_text_string.indexOf_v2(part_of_div_text_to_test) === 0) && (part_of_div_text_to_test !== '')) {
				//part_of_div_text_to_test is very LIKELY at the start of the user_selection and the selection went forwards
				// so leave length_to_take_from_selection unaltered
				direction_of_selection_is_forward = true;
				
			} else {
				// selection could have gone backwards and the selected_text_within_mousedown_element_div COULD be at the end of the user_selection
				if (length_of_raw_selection < starting_point) {
					length_to_take_from_selection = length_of_raw_selection;
					part_of_div_text_to_test = clicked_div_text.substr((starting_point - length_of_raw_selection), length_to_take_from_selection);
				} else {
					//selection is backwards and length equals or exceeds the element_div it started in.
					length_to_take_from_selection = starting_point;
					part_of_div_text_to_test = clicked_div_text.substr(0, length_to_take_from_selection);
				}
				var a = selected_text_string.indexOf_v2(part_of_div_text_to_test);
				if (selected_text_string.lastIndexOf_v2(part_of_div_text_to_test) === (length_of_raw_selection - part_of_div_text_to_test.length)) {
					//it's very LIKELY that the text has been selected backwards from the start point
					direction_of_selection_is_forward = false;
					if (starting_point < length_of_raw_selection) {
						length_to_take_from_selection = starting_point;
					} else {
						length_to_take_from_selection = length_of_raw_selection;
					}
				} else {
					//the user has likely started selection at the end of an element and gone forwards.
					//  it has failed the (part_of_div_text_to_test !== '') test 
					//  but we'll now avoid taking text backwards from the start point in the_mousedown_div, which would be nonsense.
					direction_of_selection_is_forward = true;
					length_to_take_from_selection = 0;
				}
			}
			
			if (direction_of_selection_is_forward) {
				// don't need to do anything to starting_point value 
			} else {
				starting_point = (starting_point-length_to_take_from_selection);
			}
			selected_text_within_mousedown_element_div = clicked_div_text.substr(starting_point,length_to_take_from_selection);
			
			
			$("#selected_text").html("object id = " + id_of_mousedown_element + "<br />toString = " + user_selection.toString() + "<br />From: " + starting_point + "<br />Length: " + length_of_raw_selection + "<br />max_length_of_selection_within_an_element: " + max_length_of_selection_within_an_element + "<br />selected_text_within_mousedown_element_div: " + selected_text_within_mousedown_element_div);
			
			
			//remove users selection
			user_selection.collapseToStart();
			
			//save selection to list of selections
			CSD.session.save_selection(id_of_mousedown_element, starting_point, (starting_point+length_to_take_from_selection));
			
		} else {
			//just treat this as a mouse click and just
			//store the id of the selected element
			//// CSD.session.selected_element_html_id(this);
			//// $('#selected_text').text(id_of_mousedown_element);
		}
		
	};
	
	
	
	CSD.rh.get_selection = function () {
		var user_selection = '';
		if (window.getSelection) {
			user_selection = window.getSelection();
		} else if (document.getSelection) {
			user_selection = document.getSelection();
		} else if (document.selection) {  // should come last; Opera!
			user_selection = document.selection.createRange().text;
		}
		return user_selection;
	};
	

	CSD.rh.get_range_object = function (selection_object) {  // code from: http://www.quirksmode.org/dom/range_intro.html
		if (selection_object.getRangeAt) {
			return selection_object.getRangeAt(0);
		} else { // Safari!
			var range = document.createRange();
			range.setStart(selection_object.anchorNode,selection_object.anchorOffset);
			range.setEnd(selection_object.focusNode,selection_object.focusOffset);
			return range;
		}
	};
