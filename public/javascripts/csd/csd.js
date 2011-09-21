/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.



//$(function () {    
	
	// define the single global variable, CSD for the application Javascript
	if (typeof(CSD)=="undefined") {
    	CSD = {	data: {},
        		model: {},
    			data_manager: {},
    			views: {},
    			views_helper: {},
    			views_manager: {},
    			views_data: {to_display: [],
    						 rendered: []},
    			controller: {},
    			routes: {}
    			};
    	CSD.dm = CSD.data_manager; // set alias for data_manager as dm
    };
	


//############################### 
//###############################    CONTROLLER & ROUTES   
//############################### 

	CSD.controller.display_discussion = function() {

		CSD.views.show_view();
		
	}; //  end of   CSD.controller.display_discussion
	
	
	
//});




