/*global CSD, AJP*/ // Used by JSLint to exclude CSD from search of undefined variables and functions.

	
	// define the single global variable, CSD for the application Javascript
	if (typeof(CSD)=="undefined") {
    	CSD = {	data: {},
        		model: {},
    			data_manager: {},
    			views: {},
    			views_helper: {},
    			views_manager: {},
    			controller: {element: {}},
    						 //discussion_container: {}},
    			routes: {helper: {}},
    			session: {},
    			helper: {},
    			debugging: {}
    			};
    	CSD.dm = CSD.data_manager; 	// set alias for data_manager as dm
    	CSD.rh = CSD.routes.helper;	// set alias for routes.helper as rh
    };
    

	CSD.debugging.attempts_to_run_CSD_controller_display_discussion = 0;

