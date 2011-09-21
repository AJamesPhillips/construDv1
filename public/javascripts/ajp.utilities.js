 
	

	// Augment basic types with useful functions
	// a safe 'method' method for adding new methods to objects.
	Function.prototype.method = function (name, func) {
		try {
			if (!this.prototype[name]) {  // check to see if this method name has already been used.
				this.prototype[name] = func;
				return this;
			} else {
				//d/alert('you tried to assign a function with the name: \'' + name + '\' to a function that already has this.  Function = ' + this);
				throw {
					name: 'Immutable error, from Function.prototype.method()',
					message: 'you tried to assign a function with the name: \'' + name + '\' to a function that already has this.  Function = ' + this
				};
			}
		} catch (e) {
			console.log ('error: ' + e.name + '\n ' + e.message);
		}
	};
	
	
	/*
	Object.prototype.safely_add_new_attribute: function (name, attribute) {
		if (!this[name]) {  // check to see if this attribute name has already been used.
			this[name] = attribute;
			return this;
		} else {
			throw {
				name: 'Immutable error, from safely_add_new_attribute()',
				message: 'you tried to assign \'' + name + '\' to an object that already has this.  Object = ' + this
			}
		}
	}
	*/
	(Object.prototype.this_is_to_remind_me_to_use_hasOwnProperty_incase_someone_has_extended_Object_prototype = function () {
		var no_value = 0;
	})();
	

	//// method to find integer of a number 
	Number.method('integer', function () {
		return Math[this < 0 ? 'ceil' : 'floor'](this);
	});
		
	//// method to remove white spaces from end of strings 
	String.method('trim', function () {
		return this.replace(/^\s+|\s+$/g, '');
	});
	
	//// method to remove white spaces from end of strings 
	Array.method('matrix', function (m, n, inital_value) {
		var a, i, j, matrix = [];
		for (i = 0; i < m; i += 1) {
			a = [];
			for (j = 0; j < n; j += 1) {
				a[j] = inital_value;
			};
			matrix[i] = a;
		};
		return matrix;
	});
	
	
	//// add the filter method to arrays, as described in https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
	Array.method('filter', function(a_function /*, thisp */) {  

		"use strict";  
		
		if (this === void 0 || this === null)  
			throw new TypeError();  
		
		var t = Object(this),
			len = t.length >>> 0,
			result = [],
			thisp = arguments[1],
			i = 0,
			val = undefined;
			  
		if (typeof a_function !== "function")  
			throw new TypeError();  
		
		for (i = 0; i < len; i += 1)  
		{  
			if (i in t)  
			{  
		    	val = t[i]; // in case a_function mutates this  
		    	if (a_function.call(thisp, val, i, t))  
		    		result.push(val);  
			}  
		}  
		
		return result;  
	});  
	
	
	//// add the indexOf method to arrays, as described in https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
	Array.method('some', function(a_function /*, thisp */)	{
		"use strict";
		
		if (this === void 0 || this === null)
			throw new TypeError();
		
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof a_function !== "function")
			throw new TypeError();
		
		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in t && a_function.call(thisp, t[i], i, t))
		    	return true;
		}
		
		return false;
	});
	
	
	////   an every filter, might be useful to add sometime:  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
	
	
	
	// Production steps of ECMA-262, Edition 5, 15.4.4.19  
    // Reference: http://es5.github.com/#x15.4.4.19  
    Array.method('map', function(callback, thisArg) {
	    var T, A, k;  
      
        if (this == null) {  
          throw new TypeError(" this is null or not defined");  
        }  
      
        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.  
        var O = Object(this);  
      
        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".  
        // 3. Let len be ToUint32(lenValue).  
        var len = O.length >>> 0;  
      
        // 4. If IsCallable(callback) is false, throw a TypeError exception.  
        // See: http://es5.github.com/#x9.11  
        if ({}.toString.call(callback) != "[object Function]") {  
          throw new TypeError(callback + " is not a function");  
        }  
      
        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.  
        if (thisArg) {  
          T = thisArg;  
        }  
      
        // 6. Let A be a new array created as if by the expression new Array(len) where Array is  
        // the standard built-in constructor with that name and len is the value of len.  
        A = new Array(len);  
      
        // 7. Let k be 0  
        k = 0;  
      
        // 8. Repeat, while k < len  
        while(k < len) {  
      
          var kValue, mappedValue;  
      
          // a. Let Pk be ToString(k).  
          //   This is implicit for LHS operands of the in operator  
          // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.  
          //   This step can be combined with c  
          // c. If kPresent is true, then  
          if (k in O) {  
      
            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.  
            kValue = O[ k ];  
      
            // ii. Let mappedValue be the result of calling the Call internal method of callback  
            // with T as the this value and argument list containing kValue, k, and O.  
            mappedValue = callback.call(T, kValue, k, O);  
      
            // iii. Call the DefineOwnProperty internal method of A with arguments  
            // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},  
            // and false.  
      
            // In browsers that support Object.defineProperty, use the following:  
            // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });  
      
            // For best browser support, use the following:  
            A[ k ] = mappedValue;  
          }  
          // d. Increase k by 1.  
          k++;  
        }  
      
        // 9. return A  
        return A;  
	});
	
	
	
	
	//// add the indexOf method to arrays, as described in https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
    Array.method('indexOf', function (search_element /*, fromIndex */ ) {  
	    "use strict";  
	    if (this === void 0 || this === null) {  
	        throw new TypeError();  
	    }  
	    var t = Object(this);  
	    var len = t.length >>> 0;  
	    if (len === 0) {  
	        return -1;  
	    }  
	    var n = 0;  
	    if (arguments.length > 0) {  
	        n = Number(arguments[1]);  
	        if (n !== n) { // shortcut for verifying if it's NaN  
	            n = 0;  
	        } else if (n !== 0 && n !== window.Infinity && n !== -window.Infinity) {  
	            n = (n > 0 || -1) * Math.floor(Math.abs(n));  
	        }  
	    }  
	    if (n >= len) {  
	        return -1;  
	    }  
	    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);  
	    for (; k < len; k++) {  
	        if (k in t && t[k] === search_element) {  
	            return k;  
	        }  
	    }  
	    return -1;
	});

	
	//// method returns an array where all of a certain value are removed from the original array.
	Array.method('remove', function (value) {
		
		var is_not_equal = function(element, index, array) {
			return (element !== value);
		};
		
		return this.filter(is_not_equal);
	});


	Array.method('contains', function (value) {
		
		var is_equal = function(element, index, array) {
			return (element === value);
		};
		
		return this.some(is_equal);
	});
	Array.method('does_not_contain', function (value) {
		return (!this.contains(value));
	});
	
	

	//// method returns an array containing only values present in both arrays.
	Array.method('match', function (an_array) {
		
		var is_contained_in = function(element, index, array) {
			return (an_array.contains(element));
		};
		
		return this.filter(is_contained_in);
	});
	
	
	//// method returns an array containing only parseInt(values,10)
	Array.method('to_int', function (radix) {
		radix = radix || 10;
		
		var convert_to_int = function(element, index, array) {
			return parseInt(element, radix);
		};
		
		return this.map(convert_to_int);
	});



// couldn't get 'is_array' to work so have moved them to AJP.utilities.	
//		Object.method('is_array', function () { // allows us to tell if an object is an array or not.
//			return true;
//			//return Object.prototype.toString.apply(value) === '[object Array]';  //from p61 of JavaScript: the good parts
//		});
//		
//		
//		// 'superior' method allows you to do things like:
//		//
//		//	@TODO fill in description
//		//
//		Object.method('superior', function (name) {  
//			var that = this, a_method = that[name];
//			return function () {
//				return a_method.apply(that, arguments);
//			};
//		});
		




	
	
	// define the single global variable, AJP for the application Javascript
	if (typeof AJP === 'undefined') {
		AJP = {};
    }
	// Flesh out the single global AJP variable with necessary functions.
	AJP.utilities = {	
		safely_add_new_attribute: function (object_to_add_attribute_to, name, attribute) {
			//alert('safely_add_new_attribute has been called with name: ' + name + ' and attribute = ' + attribute);
			if (!object_to_add_attribute_to[name]) {  // check to see if this attribute name has already been used.
				object_to_add_attribute_to[name] = attribute;
				return object_to_add_attribute_to;
			} else {
				throw {
					name: 'Immutable error, from safely_add_new_attribute()',
					message: 'you tried to assign \'' + name + '\' to an object that already has this.  Object = ' + object_to_add_attribute_to
				};
			}
		}
	};
	
	
	AJP.utilities.safely_add_new_attribute(AJP, 'u', AJP.utilities);  //set short hand alias for AJP.utilities  as AJP.u
	AJP.u.safely_add_new_attribute(AJP.u, 'safely_add', AJP.u.safely_add_new_attribute);  //set short hand alias for AJP.utilities.safely_add_new_attribute  as AJP.u.safely_add
	
	AJP.u.safely_add(AJP.u, 'add_attributes_from_object', function (object_to_add_attributes_to, an_object_to_get_attributes_from) {
		var key = null;
		for (key in an_object_to_get_attributes_from) { // go through the objects keys and if they're not the same as the object on which this is being called, then add them.
			if (an_object_to_get_attributes_from.hasOwnProperty(key)) {  // 'an_object_to_get_attributes_from.hasOwnProperty(key' is required because if anything has been added to Object.prototype, it will be dredged up by for...in
				if (!object_to_add_attributes_to[key]) {
					AJP.u.safely_add(object_to_add_attributes_to, key, an_object_to_get_attributes_from[key]);	
				}
			}
		}
	});
		
	
	AJP.u.safely_add(AJP.u, 'keys', function (an_object) {
		var array_of_keys = [], key = null;
		for (key in an_object) {
			if (an_object.hasOwnProperty(key)) {
				array_of_keys.push(key);
			}
		}
		return array_of_keys;
	});
	
	
	
	AJP.u.safely_add(AJP.u, 'is_array', function (value) { // allows us to tell if an object is an array or not.
		return Object.prototype.toString.apply(value) === '[object Array]';  //from p61 of JavaScript: the good parts
	});
	
	AJP.u.safely_add(AJP.u, 'is_number', function (value) { // allows us to tell if an object is a number or something else (like a NaN or Infinite, the former of which is still a number according to js!)
		return typeof value === 'number' && isFinite(value);  //from p105 of JavaScript: the good parts,  isFinite() rejects NaN and Infinite
	});
	
	
	// 'superior' method allows you to do things like:
	//
	//	@TODO fill in description
	//
	AJP.u.safely_add(AJP.u, 'superior', function (name) {  
		var that = this, a_method = that[name];
		return function () {
			return a_method.apply(that, arguments);
		};
	});
		
		
	AJP.u.safely_add(AJP.u, 'hello', function () {
		alert('hello');
		alert(AJP.utilities.pluralize(4, 'house'));		
	});

	

	AJP.u.add_attributes_from_object(AJP.utilities, {
	    // The order of all these lists has been reversed from the way 
	    // ActiveSupport had them to keep the correct priority.
	    plural: [
	        [/(quiz)$/i,               "$1zes"  ],
	        [/^(ox)$/i,                "$1en"   ],
	        [/([m|l])ouse$/i,          "$1ice"  ],
	        [/(matr|vert|ind)ix|ex$/i, "$1ices" ],
	        [/(x|ch|ss|sh)$/i,         "$1es"   ],
	        [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
	        [/(hive)$/i,               "$1s"    ],
	        [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
	        [/sis$/i,                  "ses"    ],
	        [/([ti])um$/i,             "$1a"    ],
	        [/(buffal|tomat)o$/i,      "$1oes"  ],
	        [/(bu)s$/i,                "$1ses"  ],
	        [/(alias|status)$/i,       "$1es"   ],
	        [/(octop|vir)us$/i,        "$1i"    ],
	        [/(ax|test)is$/i,          "$1es"   ],
	        [/s$/i,                    "s"      ],
	        [/$/,                      "s"      ]
	    ],
	    singular: [
	        [/(quiz)zes$/i,                                                    "$1"     ],
	        [/(matr)ices$/i,                                                   "$1ix"   ],
	        [/(vert|ind)ices$/i,                                               "$1ex"   ],
	        [/^(ox)en/i,                                                       "$1"     ],
	        [/(alias|status)es$/i,                                             "$1"     ],
	        [/(octop|vir)i$/i,                                                 "$1us"   ],
	        [/(cris|ax|test)es$/i,                                             "$1is"   ],
	        [/(shoe)s$/i,                                                      "$1"     ],
	        [/(o)es$/i,                                                        "$1"     ],
	        [/(bus)es$/i,                                                      "$1"     ],
	        [/([m|l])ice$/i,                                                   "$1ouse" ],
	        [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
	        [/(m)ovies$/i,                                                     "$1ovie" ],
	        [/(s)eries$/i,                                                     "$1eries"],
	        [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
	        [/([lr])ves$/i,                                                    "$1f"    ],
	        [/(tive)s$/i,                                                      "$1"     ],
	        [/(hive)s$/i,                                                      "$1"     ],
	        [/([^f])ves$/i,                                                    "$1fe"   ],
	        [/(^analy)ses$/i,                                                  "$1sis"  ],
	        [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
	        [/([ti])a$/i,                                                      "$1um"   ],
	        [/(n)ews$/i,                                                       "$1ews"  ],
	        [/s$/i,                                                            ""       ]
	    ],
	    irregular: [
	        ['move',   'moves'   ],
	        ['sex',    'sexes'   ],
	        ['child',  'children'],
	        ['man',    'men'     ],
	        ['person', 'people'  ]
	    ],
	    uncountable: [
	        "sheep",
	        "fish",
	        "series",
	        "species",
	        "money",
	        "rice",
	        "information",
	        "equipment"
	    ],
	    initialize: function () {
	        // Nothing here now
	    },
	    ordinalize: function (number) {
	        if ((11 <= (number.integer() % 100)) && ((number.integer() % 100) <= 13)) {
	            return number + "th";
	        } else {
	            switch (number.integer() % 10) {
	                case 1:  return number + "st";
	                case 2:  return number + "nd";
	                case 3:  return number + "rd";
	                default: return number + "th";
	            }
	        }
	    },
	    pluralize_a_word: function (word) {
			var i = 0;
			for (i = 0; i < this.uncountable.length; i += 1) {
				var uncountable = this.uncountable[i];
				if (word.toLowerCase() === uncountable) {
					return uncountable;
				}
			}
			for (i = 0; i < this.irregular.length; i += 1) {
				var singular = this.irregular[i][0];
				var plural   = this.irregular[i][1];
				if ((word.toLowerCase() === singular) || (word === plural)) {
					return plural;
				}
			}
			for (i = 0; i < this.plural.length; i += 1) {
				var regex          = this.plural[i][0];
				var replace_string = this.plural[i][1];
				if (regex.test(word)) {
					return word.replace(regex, replace_string);
				}
			}
		},
	    
		// pluralize expects between 2 to 3 arguments.
		// 1. The count of items to pluralize
		// 2. The singular form of the item to pluralize
		// 3. The plural form of the item to pluralize (optional)
	    pluralize: function (count, singular, plural) {
			if (arguments.length < 2) {
				throw {
					name: 'Too few arguments',
					message: 'pluralize function requires arguments.length >= 2'
				};
			}
			if (isNaN(count)) {
				throw {
					name: 'Wrong argument type',
					message: 'isNaN(count) = ' + isNaN(count)
				};
			}
			
			return count + " " + (1 === count.integer() ?
					singular :
					plural || this.pluralize_a_word(singular));
		},
	    singularize: function (word) {
			var i = 0;
			for (i = 0; i < this.uncountable.length; i += 1) {
			    var uncountable = this.uncountable[i];
			    if (word.toLowerCase() === uncountable) {
					return uncountable;
			    }
			}
			for (i = 0; i < this.irregular.length; i += 1) {
			    var singular = this.irregular[i][0];
			    var plural   = this.irregular[i][1];
			    if ((word.toLowerCase() === singular) || (word === plural)) {
					return singular;
			    }
			}
			for (i = 0; i < this.singular.length; i += 1) {
			    var regex          = this.singular[i][0];
			    var replace_string = this.singular[i][1];
			    if (regex.test(word)) {
					return word.replace(regex, replace_string);
			    }
			}
	    }
	});



	AJP.u.safely_add(AJP.u, 'ensure_css_class_of_first_hovered_parent_of_correct_class_is_altered', function (e, classes_to_test_for, class_to_assign) {
		// This function is typically called on the mouseOut event (i.e. in the second function you pass to Jquery's hover function)
		
		// This function checks we're not moving back to a parent element that needs 
		// to be highlighted, but that won't have its hover (i.e. its mouseOver) event triggered
		// as we never left it (as it's a parent element of the current nested element).
		    	
		if (!e) {var e = window.event;}
		var new_hovered_html = e.relatedTarget || e.toElement,
			an_html_element = undefined,
			i = 0,
			len = classes_to_test_for.length;
			new_hovered_html = $(new_hovered_html);
		
		//check to see if the new_hovered_html is a classes_to_test_for
		for (i = 0; i < len; i +=  1) {
			classes_to_test_for[i];
		};
		
		if (new_hovered_html.attr('class').indexOf(class_to_test_for) !== -1) {
			new_hovered_html.addClass(class_to_assign);
			
		} else {
			//check to see if any of the parents of the new_hovered_html 
			// are a class_to_test_for, and apply the CSS class in class_to_assign
			// to the first one only. 
			new_hovered_html.parents().each( function (index, dom_element) {
				an_html_element = $(dom_element);
				if (an_html_element.attr('class').indexOf(class_to_test_for) !== -1) {
					an_html_element.addClass(class_to_assign);
					return false;
				}
			});
		}
	});
	
	//} catch (e) {
		//document.writeln(e.name + ': ' + e.message)
	//}















