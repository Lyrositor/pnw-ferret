"use strict";
// Transcrypt'ed from Python, 2018-05-19 17:32:52
function pnw () {
   var __symbols__ = ['__py3.6__', '__esv6__'];
    var __all__ = {};
    var __world__ = __all__;
    
    // Nested object creator, part of the nesting may already exist and have attributes
    var __nest__ = function (headObject, tailNames, value) {
        // In some cases this will be a global object, e.g. 'window'
        var current = headObject;
        
        if (tailNames != '') {  // Split on empty string doesn't give empty list
            // Find the last already created object in tailNames
            var tailChain = tailNames.split ('.');
            var firstNewIndex = tailChain.length;
            for (var index = 0; index < tailChain.length; index++) {
                if (!current.hasOwnProperty (tailChain [index])) {
                    firstNewIndex = index;
                    break;
                }
                current = current [tailChain [index]];
            }
            
            // Create the rest of the objects, if any
            for (var index = firstNewIndex; index < tailChain.length; index++) {
                current [tailChain [index]] = {};
                current = current [tailChain [index]];
            }
        }
        
        // Insert it new attributes, it may have been created earlier and have other attributes
        for (var attrib in value) {
            current [attrib] = value [attrib];          
        }       
    };
    __all__.__nest__ = __nest__;
    
    // Initialize module if not yet done and return its globals
    var __init__ = function (module) {
        if (!module.__inited__) {
            module.__all__.__init__ (module.__all__);
            module.__inited__ = true;
        }
        return module.__all__;
    };
    __all__.__init__ = __init__;
    
    
    // Proxy switch, controlled by __pragma__ ('proxy') and __pragma ('noproxy')
    var __proxy__ = false;  // No use assigning it to __all__, only its transient state is important
    
    
    // Since we want to assign functions, a = b.f should make b.f produce a bound function
    // So __get__ should be called by a property rather then a function
    // Factory __get__ creates one of three curried functions for func
    // Which one is produced depends on what's to the left of the dot of the corresponding JavaScript property
    var __get__ = function (self, func, quotedFuncName) {
        if (self) {
            if (self.hasOwnProperty ('__class__') || typeof self == 'string' || self instanceof String) {           // Object before the dot
                if (quotedFuncName) {                                   // Memoize call since fcall is on, by installing bound function in instance
                    Object.defineProperty (self, quotedFuncName, {      // Will override the non-own property, next time it will be called directly
                        value: function () {                            // So next time just call curry function that calls function
                            var args = [] .slice.apply (arguments);
                            return func.apply (null, [self] .concat (args));
                        },              
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
                return function () {                                    // Return bound function, code dupplication for efficiency if no memoizing
                    var args = [] .slice.apply (arguments);             // So multilayer search prototype, apply __get__, call curry func that calls func
                    return func.apply (null, [self] .concat (args));
                };
            }
            else {                                                      // Class before the dot
                return func;                                            // Return static method
            }
        }
        else {                                                          // Nothing before the dot
            return func;                                                // Return free function
        }
    }
    __all__.__get__ = __get__;

    var __getcm__ = function (self, func, quotedFuncName) {
        if (self.hasOwnProperty ('__class__')) {
            return function () {
                var args = [] .slice.apply (arguments);
                return func.apply (null, [self.__class__] .concat (args));
            };
        }
        else {
            return function () {
                var args = [] .slice.apply (arguments);
                return func.apply (null, [self] .concat (args));
            };
        }
    }
    __all__.__getcm__ = __getcm__;
    
    var __getsm__ = function (self, func, quotedFuncName) {
        return func;
    }
    __all__.__getsm__ = __getsm__;
        
    // Mother of all metaclasses        
    var py_metatype = {
        __name__: 'type',
        __bases__: [],
        
        // Overridable class creation worker
        __new__: function (meta, name, bases, attribs) {
            // Create the class cls, a functor, which the class creator function will return
            var cls = function () {                     // If cls is called with arg0, arg1, etc, it calls its __new__ method with [arg0, arg1, etc]
                var args = [] .slice.apply (arguments); // It has a __new__ method, not yet but at call time, since it is copied from the parent in the loop below
                return cls.__new__ (args);              // Each Python class directly or indirectly derives from object, which has the __new__ method
            };                                          // If there are no bases in the Python source, the compiler generates [object] for this parameter
            
            // Copy all methods, including __new__, properties and static attributes from base classes to new cls object
            // The new class object will simply be the prototype of its instances
            // JavaScript prototypical single inheritance will do here, since any object has only one class
            // This has nothing to do with Python multiple inheritance, that is implemented explictly in the copy loop below
            for (var index = bases.length - 1; index >= 0; index--) {   // Reversed order, since class vars of first base should win
                var base = bases [index];
                for (var attrib in base) {
                    var descrip = Object.getOwnPropertyDescriptor (base, attrib);
                    Object.defineProperty (cls, attrib, descrip);
                }           

                for (var symbol of Object.getOwnPropertySymbols (base)) {
                    var descrip = Object.getOwnPropertyDescriptor (base, symbol);
                    Object.defineProperty (cls, symbol, descrip);
                }
                
            }
            
            // Add class specific attributes to the created cls object
            cls.__metaclass__ = meta;
            cls.__name__ = name;
            cls.__bases__ = bases;
            
            // Add own methods, properties and own static attributes to the created cls object
            for (var attrib in attribs) {
                var descrip = Object.getOwnPropertyDescriptor (attribs, attrib);
                Object.defineProperty (cls, attrib, descrip);
            }

            for (var symbol of Object.getOwnPropertySymbols (attribs)) {
                var descrip = Object.getOwnPropertyDescriptor (attribs, symbol);
                Object.defineProperty (cls, symbol, descrip);
            }
            
            // Return created cls object
            return cls;
        }
    };
    py_metatype.__metaclass__ = py_metatype;
    __all__.py_metatype = py_metatype;
    
    // Mother of all classes
    var object = {
        __init__: function (self) {},
        
        __metaclass__: py_metatype, // By default, all classes have metaclass type, since they derive from object
        __name__: 'object',
        __bases__: [],
            
        // Object creator function, is inherited by all classes (so could be global)
        __new__: function (args) {  // Args are just the constructor args       
            // In JavaScript the Python class is the prototype of the Python object
            // In this way methods and static attributes will be available both with a class and an object before the dot
            // The descriptor produced by __get__ will return the right method flavor
            var instance = Object.create (this, {__class__: {value: this, enumerable: true}});
            
            if ('__getattr__' in this || '__setattr__' in this) {
                instance = new Proxy (instance, {
                    get: function (target, name) {
                        var result = target [name];
                        if (result == undefined) {  // Target doesn't have attribute named name
                            return target.__getattr__ (name);
                        }
                        else {
                            return result;
                        }
                    },
                    set: function (target, name, value) {
                        try {
                            target.__setattr__ (name, value);
                        }
                        catch (exception) {         // Target doesn't have a __setattr__ method
                            target [name] = value;
                        }
                        return true;
                    }
                })
            }

            // Call constructor
            this.__init__.apply (null, [instance] .concat (args));

            // Return constructed instance
            return instance;
        }   
    };
    __all__.object = object;
    
    // Class creator facade function, calls class creation worker
    var __class__ = function (name, bases, attribs, meta) {         // Parameter meta is optional
        if (meta == undefined) {
            meta = bases [0] .__metaclass__;
        }
                
        return meta.__new__ (meta, name, bases, attribs);
    }
    __all__.__class__ = __class__;
    
    // Define __pragma__ to preserve '<all>' and '</all>', since it's never generated as a function, must be done early, so here
    var __pragma__ = function () {};
    __all__.__pragma__ = __pragma__;
    
    	__nest__ (
		__all__,
		'org.transcrypt.__base__', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var __Envir__ = __class__ ('__Envir__', [object], {
						get __init__ () {return __get__ (this, function (self) {
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							self.interpreter_name = 'python';
							self.transpiler_name = 'transcrypt';
							self.transpiler_version = '3.6.54';
							self.target_subdir = '__javascript__';
						});}
					});
					var __envir__ = __Envir__ ();
					__pragma__ ('<all>')
						__all__.__Envir__ = __Envir__;
						__all__.__envir__ = __envir__;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'org.transcrypt.__standard__', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var Exception = __class__ ('Exception', [object], {
						get __init__ () {return __get__ (this, function (self) {
							var kwargs = dict ();
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											default: kwargs [__attrib0__] = __allkwargs0__ [__attrib0__];
										}
									}
									delete kwargs.__kwargtrans__;
								}
								var args = tuple ([].slice.apply (arguments).slice (1, __ilastarg0__ + 1));
							}
							else {
								var args = tuple ();
							}
							self.__args__ = args;
							try {
								self.stack = kwargs.error.stack;
							}
							catch (__except0__) {
								self.stack = 'No stack trace available';
							}
						});},
						get __repr__ () {return __get__ (this, function (self) {
							if (len (self.__args__)) {
								return '{}{}'.format (self.__class__.__name__, repr (tuple (self.__args__)));
							}
							else {
								return '{}()'.format (self.__class__.__name__);
							}
						});},
						get __str__ () {return __get__ (this, function (self) {
							if (len (self.__args__) > 1) {
								return str (tuple (self.__args__));
							}
							else if (len (self.__args__)) {
								return str (self.__args__ [0]);
							}
							else {
								return '';
							}
						});}
					});
					var IterableError = __class__ ('IterableError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, "Can't iterate over non-iterable", __kwargtrans__ ({error: error}));
						});}
					});
					var StopIteration = __class__ ('StopIteration', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Iterator exhausted', __kwargtrans__ ({error: error}));
						});}
					});
					var ValueError = __class__ ('ValueError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Erroneous value', __kwargtrans__ ({error: error}));
						});}
					});
					var KeyError = __class__ ('KeyError', [Exception], {
						get __init__ () {return __get__ (this, function (self, error) {
							Exception.__init__ (self, 'Invalid key', __kwargtrans__ ({error: error}));
						});}
					});
					var AssertionError = __class__ ('AssertionError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							if (message) {
								Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
							}
							else {
								Exception.__init__ (self, __kwargtrans__ ({error: error}));
							}
						});}
					});
					var NotImplementedError = __class__ ('NotImplementedError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var IndexError = __class__ ('IndexError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var AttributeError = __class__ ('AttributeError', [Exception], {
						get __init__ () {return __get__ (this, function (self, message, error) {
							Exception.__init__ (self, message, __kwargtrans__ ({error: error}));
						});}
					});
					var Warning = __class__ ('Warning', [Exception], {
					});
					var UserWarning = __class__ ('UserWarning', [Warning], {
					});
					var DeprecationWarning = __class__ ('DeprecationWarning', [Warning], {
					});
					var RuntimeWarning = __class__ ('RuntimeWarning', [Warning], {
					});
					var __sort__ = function (iterable, key, reverse) {
						if (typeof key == 'undefined' || (key != null && key .hasOwnProperty ("__kwargtrans__"))) {;
							var key = null;
						};
						if (typeof reverse == 'undefined' || (reverse != null && reverse .hasOwnProperty ("__kwargtrans__"))) {;
							var reverse = false;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'iterable': var iterable = __allkwargs0__ [__attrib0__]; break;
										case 'key': var key = __allkwargs0__ [__attrib0__]; break;
										case 'reverse': var reverse = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (key) {
							iterable.sort ((function __lambda__ (a, b) {
								if (arguments.length) {
									var __ilastarg0__ = arguments.length - 1;
									if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
										var __allkwargs0__ = arguments [__ilastarg0__--];
										for (var __attrib0__ in __allkwargs0__) {
											switch (__attrib0__) {
												case 'a': var a = __allkwargs0__ [__attrib0__]; break;
												case 'b': var b = __allkwargs0__ [__attrib0__]; break;
											}
										}
									}
								}
								else {
								}
								return (key (a) > key (b) ? 1 : -(1));
							}));
						}
						else {
							iterable.sort ();
						}
						if (reverse) {
							iterable.reverse ();
						}
					};
					var sorted = function (iterable, key, reverse) {
						if (typeof key == 'undefined' || (key != null && key .hasOwnProperty ("__kwargtrans__"))) {;
							var key = null;
						};
						if (typeof reverse == 'undefined' || (reverse != null && reverse .hasOwnProperty ("__kwargtrans__"))) {;
							var reverse = false;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'iterable': var iterable = __allkwargs0__ [__attrib0__]; break;
										case 'key': var key = __allkwargs0__ [__attrib0__]; break;
										case 'reverse': var reverse = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (py_typeof (iterable) == dict) {
							var result = copy (iterable.py_keys ());
						}
						else {
							var result = copy (iterable);
						}
						__sort__ (result, key, reverse);
						return result;
					};
					var map = function (func, iterable) {
						return function () {
							var __accu0__ = [];
							for (var item of iterable) {
								__accu0__.append (func (item));
							}
							return __accu0__;
						} ();
					};
					var filter = function (func, iterable) {
						if (func == null) {
							var func = bool;
						}
						return function () {
							var __accu0__ = [];
							for (var item of iterable) {
								if (func (item)) {
									__accu0__.append (item);
								}
							}
							return __accu0__;
						} ();
					};
					var __Terminal__ = __class__ ('__Terminal__', [object], {
						get __init__ () {return __get__ (this, function (self) {
							self.buffer = '';
							try {
								self.element = document.getElementById ('__terminal__');
							}
							catch (__except0__) {
								self.element = null;
							}
							if (self.element) {
								self.element.style.overflowX = 'auto';
								self.element.style.boxSizing = 'border-box';
								self.element.style.padding = '5px';
								self.element.innerHTML = '_';
							}
						});},
						get print () {return __get__ (this, function (self) {
							var sep = ' ';
							var end = '\n';
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'sep': var sep = __allkwargs0__ [__attrib0__]; break;
											case 'end': var end = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
								var args = tuple ([].slice.apply (arguments).slice (1, __ilastarg0__ + 1));
							}
							else {
								var args = tuple ();
							}
							self.buffer = '{}{}{}'.format (self.buffer, sep.join (function () {
								var __accu0__ = [];
								for (var arg of args) {
									__accu0__.append (str (arg));
								}
								return __accu0__;
							} ()), end).__getslice__ (-(4096), null, 1);
							if (self.element) {
								self.element.innerHTML = self.buffer.py_replace ('\n', '<br>');
								self.element.scrollTop = self.element.scrollHeight;
							}
							else {
								console.log (sep.join (function () {
									var __accu0__ = [];
									for (var arg of args) {
										__accu0__.append (str (arg));
									}
									return __accu0__;
								} ()));
							}
						});},
						get input () {return __get__ (this, function (self, question) {
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'question': var question = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							self.print ('{}'.format (question), __kwargtrans__ ({end: ''}));
							var answer = window.prompt ('\n'.join (self.buffer.py_split ('\n').__getslice__ (-(16), null, 1)));
							self.print (answer);
							return answer;
						});}
					});
					var __terminal__ = __Terminal__ ();
					__pragma__ ('<all>')
						__all__.AssertionError = AssertionError;
						__all__.AttributeError = AttributeError;
						__all__.DeprecationWarning = DeprecationWarning;
						__all__.Exception = Exception;
						__all__.IndexError = IndexError;
						__all__.IterableError = IterableError;
						__all__.KeyError = KeyError;
						__all__.NotImplementedError = NotImplementedError;
						__all__.RuntimeWarning = RuntimeWarning;
						__all__.StopIteration = StopIteration;
						__all__.UserWarning = UserWarning;
						__all__.ValueError = ValueError;
						__all__.Warning = Warning;
						__all__.__Terminal__ = __Terminal__;
						__all__.__sort__ = __sort__;
						__all__.__terminal__ = __terminal__;
						__all__.filter = filter;
						__all__.map = map;
						__all__.sorted = sorted;
					__pragma__ ('</all>')
				}
			}
		}
	);
    var __call__ = function (/* <callee>, <this>, <params>* */) {   // Needed for __base__ and __standard__ if global 'opov' switch is on
        var args = [] .slice.apply (arguments);
        if (typeof args [0] == 'object' && '__call__' in args [0]) {        // Overloaded
            return args [0] .__call__ .apply (args [1], args.slice (2));
        }
        else {                                                              // Native
            return args [0] .apply (args [1], args.slice (2));
        }
    };
    __all__.__call__ = __call__;

    // Initialize non-nested modules __base__ and __standard__ and make its names available directly and via __all__
    // They can't do that itself, because they're regular Python modules
    // The compiler recognizes their names and generates them inline rather than nesting them
    // In this way it isn't needed to import them everywhere

    // __base__

    __nest__ (__all__, '', __init__ (__all__.org.transcrypt.__base__));
    var __envir__ = __all__.__envir__;

    // __standard__

    __nest__ (__all__, '', __init__ (__all__.org.transcrypt.__standard__));

    var Exception = __all__.Exception;
    var IterableError = __all__.IterableError;
    var StopIteration = __all__.StopIteration;
    var ValueError = __all__.ValueError;
    var KeyError = __all__.KeyError;
    var AssertionError = __all__.AssertionError;
    var NotImplementedError = __all__.NotImplementedError;
    var IndexError = __all__.IndexError;
    var AttributeError = __all__.AttributeError;

    // Warnings Exceptions
    var Warning = __all__.Warning;
    var UserWarning = __all__.UserWarning;
    var DeprecationWarning = __all__.DeprecationWarning;
    var RuntimeWarning = __all__.RuntimeWarning;

    var __sort__ = __all__.__sort__;
    var sorted = __all__.sorted;

    var map = __all__.map;
    var filter = __all__.filter;

    __all__.print = __all__.__terminal__.print;
    __all__.input = __all__.__terminal__.input;

    var __terminal__ = __all__.__terminal__;
    var print = __all__.print;
    var input = __all__.input;

    // Complete __envir__, that was created in __base__, for non-stub mode
    __envir__.executor_name = __envir__.transpiler_name;

    // Make make __main__ available in browser
    var __main__ = {__file__: ''};
    __all__.main = __main__;

    // Define current exception, there's at most one exception in the air at any time
    var __except__ = null;
    __all__.__except__ = __except__;
    
     // Creator of a marked dictionary, used to pass **kwargs parameter
    var __kwargtrans__ = function (anObject) {
        anObject.__kwargtrans__ = null; // Removable marker
        anObject.constructor = Object;
        return anObject;
    }
    __all__.__kwargtrans__ = __kwargtrans__;

    // 'Oneshot' dict promotor, used to enrich __all__ and help globals () return a true dict
    var __globals__ = function (anObject) {
        if (isinstance (anObject, dict)) {  // Don't attempt to promote (enrich) again, since it will make a copy
            return anObject;
        }
        else {
            return dict (anObject)
        }
    }
    __all__.__globals__ = __globals__
    
    // Partial implementation of super () .<methodName> (<params>)
    var __super__ = function (aClass, methodName) {
        // Lean and fast, no C3 linearization, only call first implementation encountered
        // Will allow __super__ ('<methodName>') (self, <params>) rather than only <className>.<methodName> (self, <params>)
        
        for (let base of aClass.__bases__) {
            if (methodName in base) {
               return base [methodName];
            }
        }

        throw new Exception ('Superclass method not found');    // !!! Improve!
    }
    __all__.__super__ = __super__
        
    // Python property installer function, no member since that would bloat classes
    var property = function (getter, setter) {  // Returns a property descriptor rather than a property
        if (!setter) {  // ??? Make setter optional instead of dummy?
            setter = function () {};
        }
        return {get: function () {return getter (this)}, set: function (value) {setter (this, value)}, enumerable: true};
    }
    __all__.property = property;
    
    // Conditional JavaScript property installer function, prevents redefinition of properties if multiple Transcrypt apps are on one page
    var __setProperty__ = function (anObject, name, descriptor) {
        if (!anObject.hasOwnProperty (name)) {
            Object.defineProperty (anObject, name, descriptor);
        }
    }
    __all__.__setProperty__ = __setProperty__
    
    // Assert function, call to it only generated when compiling with --dassert option
    function assert (condition, message) {  // Message may be undefined
        if (!condition) {
            throw AssertionError (message, new Error ());
        }
    }

    __all__.assert = assert;

    var __merge__ = function (object0, object1) {
        var result = {};
        for (var attrib in object0) {
            result [attrib] = object0 [attrib];
        }
        for (var attrib in object1) {
            result [attrib] = object1 [attrib];
        }
        return result;
    };
    __all__.__merge__ = __merge__;

    // Manipulating attributes by name
    
    var dir = function (obj) {
        var aList = [];
        for (var aKey in obj) {
            aList.push (aKey);
        }
        aList.sort ();
        return aList;
    };
    __all__.dir = dir;

    var setattr = function (obj, name, value) {
        obj [name] = value;
    };
    __all__.setattr = setattr;

    var getattr = function (obj, name) {
        return obj [name];
    };
    __all__.getattr= getattr;

    var hasattr = function (obj, name) {
        try {
            return name in obj;
        }
        catch (exception) {
            return false;
        }
    };
    __all__.hasattr = hasattr;

    var delattr = function (obj, name) {
        delete obj [name];
    };
    __all__.delattr = (delattr);

    // The __in__ function, used to mimic Python's 'in' operator
    // In addition to CPython's semantics, the 'in' operator is also allowed to work on objects, avoiding a counterintuitive separation between Python dicts and JavaScript objects
    // In general many Transcrypt compound types feature a deliberate blend of Python and JavaScript facilities, facilitating efficient integration with JavaScript libraries
    // If only Python objects and Python dicts are dealt with in a certain context, the more pythonic 'hasattr' is preferred for the objects as opposed to 'in' for the dicts
    var __in__ = function (element, container) {
        if (py_typeof (container) == dict) {        // Currently only implemented as an augmented JavaScript object
            return container.hasOwnProperty (element);
        }
        else {                                      // Parameter 'element' itself is an array, string or a plain, non-dict JavaScript object
            return (
                container.indexOf ?                 // If it has an indexOf
                container.indexOf (element) > -1 :  // it's an array or a string,
                container.hasOwnProperty (element)  // else it's a plain, non-dict JavaScript object
            );
        }
    };
    __all__.__in__ = __in__;

    // Find out if an attribute is special
    var __specialattrib__ = function (attrib) {
        return (attrib.startswith ('__') && attrib.endswith ('__')) || attrib == 'constructor' || attrib.startswith ('py_');
    };
    __all__.__specialattrib__ = __specialattrib__;

    // Compute length of any object
    var len = function (anObject) {
        if (anObject === undefined || anObject === null) {
            return 0;
        }

        if (anObject.__len__ instanceof Function) {
            return anObject.__len__ ();
        }

        if (anObject.length !== undefined) {
            return anObject.length;
        }

        var length = 0;
        for (var attr in anObject) {
            if (!__specialattrib__ (attr)) {
                length++;
            }
        }

        return length;
    };
    __all__.len = len;

    // General conversions

    function __i__ (any) {  //  Conversion to iterable
        return py_typeof (any) == dict ? any.py_keys () : any;
    }

    // If the target object is somewhat true, return it. Otherwise return false.
    // Try to follow Python conventions of truthyness
    function __t__ (target) { 
        return (
            // Avoid invalid checks
            target === undefined || target === null ? false :
            
            // Take a quick shortcut if target is a simple type
            ['boolean', 'number'] .indexOf (typeof target) >= 0 ? target :
            
            // Use __bool__ (if present) to decide if target is true
            target.__bool__ instanceof Function ? (target.__bool__ () ? target : false) :
            
            // There is no __bool__, use __len__ (if present) instead
            target.__len__ instanceof Function ?  (target.__len__ () !== 0 ? target : false) :
            
            // There is no __bool__ and no __len__, declare Functions true.
            // Python objects are transpiled into instances of Function and if
            // there is no __bool__ or __len__, the object in Python is true.
            target instanceof Function ? target :
            
            // Target is something else, compute its len to decide
            len (target) !== 0 ? target :
            
            // When all else fails, declare target as false
            false
        );
    }
    __all__.__t__ = __t__;

    var bool = function (any) {     // Always truly returns a bool, rather than something truthy or falsy
        return !!__t__ (any);
    };
    bool.__name__ = 'bool';         // So it can be used as a type with a name
    __all__.bool = bool;

    var float = function (any) {
        if (any == 'inf') {
            return Infinity;
        }
        else if (any == '-inf') {
            return -Infinity;
        }
        else if (isNaN (parseFloat (any))) {    // Call to parseFloat needed to exclude '', ' ' etc.
            if (any === false) {
                return 0;
            }
            else if (any === true) {
                return 1;
            }
            else {  // Needed e.g. in autoTester.check, so "return any ? true : false" won't do
                throw ValueError (new Error ());
            }
        }
        else {
            return +any;
        }
    };
    float.__name__ = 'float';
    __all__.float = float;

    var int = function (any) {
        return float (any) | 0
    };
    int.__name__ = 'int';
    __all__.int = int;

    var py_typeof = function (anObject) {
        var aType = typeof anObject;
        if (aType == 'object') {    // Directly trying '__class__ in anObject' turns out to wreck anObject in Chrome if its a primitive
            try {
                return anObject.__class__;
            }
            catch (exception) {
                return aType;
            }
        }
        else {
            return (    // Odly, the braces are required here
                aType == 'boolean' ? bool :
                aType == 'string' ? str :
                aType == 'number' ? (anObject % 1 == 0 ? int : float) :
                null
            );
        }
    };
    __all__.py_typeof = py_typeof;

    var isinstance = function (anObject, classinfo) {
        function isA (queryClass) {
            if (queryClass == classinfo) {
                return true;
            }
            for (var index = 0; index < queryClass.__bases__.length; index++) {
                if (isA (queryClass.__bases__ [index], classinfo)) {
                    return true;
                }
            }
            return false;
        }

        if (classinfo instanceof Array) {   // Assume in most cases it isn't, then making it recursive rather than two functions saves a call
            for (let aClass of classinfo) {
                if (isinstance (anObject, aClass)) {
                    return true;
                }
            }
            return false;
        }

        try {                   // Most frequent use case first
            return '__class__' in anObject ? isA (anObject.__class__) : anObject instanceof classinfo;
        }
        catch (exception) {     // Using isinstance on primitives assumed rare
            var aType = py_typeof (anObject);
            return aType == classinfo || (aType == bool && classinfo == int);
        }
    };
    __all__.isinstance = isinstance;

    var callable = function (anObject) {
        if ( typeof anObject == 'object' && '__call__' in anObject ) {
            return true;
        }
        else {
            return typeof anObject === 'function';
        }
    };
    __all__.callable = callable;

    // Repr function uses __repr__ method, then __str__, then toString
    var repr = function (anObject) {
        try {
            return anObject.__repr__ ();
        }
        catch (exception) {
            try {
                return anObject.__str__ ();
            }
            catch (exception) { // anObject has no __repr__ and no __str__
                try {
                    if (anObject == null) {
                        return 'None';
                    }
                    else if (anObject.constructor == Object) {
                        var result = '{';
                        var comma = false;
                        for (var attrib in anObject) {
                            if (!__specialattrib__ (attrib)) {
                                if (attrib.isnumeric ()) {
                                    var attribRepr = attrib;                // If key can be interpreted as numerical, we make it numerical
                                }                                           // So we accept that '1' is misrepresented as 1
                                else {
                                    var attribRepr = '\'' + attrib + '\'';  // Alpha key in dict
                                }

                                if (comma) {
                                    result += ', ';
                                }
                                else {
                                    comma = true;
                                }
                                result += attribRepr + ': ' + repr (anObject [attrib]);
                            }
                        }
                        result += '}';
                        return result;
                    }
                    else {
                        return typeof anObject == 'boolean' ? anObject.toString () .capitalize () : anObject.toString ();
                    }
                }
                catch (exception) {
                    return '<object of type: ' + typeof anObject + '>';
                }
            }
        }
    };
    __all__.repr = repr;

    // Char from Unicode or ASCII
    var chr = function (charCode) {
        return String.fromCharCode (charCode);
    };
    __all__.chr = chr;

    // Unicode or ASCII from char
    var ord = function (aChar) {
        return aChar.charCodeAt (0);
    };
    __all__.ord = ord;

    // Maximum of n numbers
    var max = Math.max;
    __all__.max = max;

    // Minimum of n numbers
    var min = Math.min;
    __all__.min = min;

    // Absolute value
    var abs = Math.abs;
    __all__.abs = abs;

    // Bankers rounding
    var round = function (number, ndigits) {
        if (ndigits) {
            var scale = Math.pow (10, ndigits);
            number *= scale;
        }

        var rounded = Math.round (number);
        if (rounded - number == 0.5 && rounded % 2) {   // Has rounded up to odd, should have rounded down to even
            rounded -= 1;
        }

        if (ndigits) {
            rounded /= scale;
        }

        return rounded;
    };
    __all__.round = round;

    // BEGIN unified iterator model

    function __jsUsePyNext__ () {       // Add as 'next' method to make Python iterator JavaScript compatible
        try {
            var result = this.__next__ ();
            return {value: result, done: false};
        }
        catch (exception) {
            return {value: undefined, done: true};
        }
    }

    function __pyUseJsNext__ () {       // Add as '__next__' method to make JavaScript iterator Python compatible
        var result = this.next ();
        if (result.done) {
            throw StopIteration (new Error ());
        }
        else {
            return result.value;
        }
    }

    function py_iter (iterable) {                   // Alias for Python's iter function, produces a universal iterator / iterable, usable in Python and JavaScript
        if (typeof iterable == 'string' || '__iter__' in iterable) {    // JavaScript Array or string or Python iterable (string has no 'in')
            var result = iterable.__iter__ ();                          // Iterator has a __next__
            result.next = __jsUsePyNext__;                              // Give it a next
        }
        else if ('selector' in iterable) {                              // Assume it's a JQuery iterator
            var result = list (iterable) .__iter__ ();                  // Has a __next__
            result.next = __jsUsePyNext__;                              // Give it a next
        }
        else if ('next' in iterable) {                                  // It's a JavaScript iterator already,  maybe a generator, has a next and may have a __next__
            var result = iterable
            if (! ('__next__' in result)) {                             // If there's no danger of recursion
                result.__next__ = __pyUseJsNext__;                      // Give it a __next__
            }
        }
        else if (Symbol.iterator in iterable) {                         // It's a JavaScript iterable such as a typed array, but not an iterator
            var result = iterable [Symbol.iterator] ();                 // Has a next
            result.__next__ = __pyUseJsNext__;                          // Give it a __next__
        }
        else {
            throw IterableError (new Error ()); // No iterator at all
        }
        result [Symbol.iterator] = function () {return result;};
        return result;
    }

    function py_next (iterator) {               // Called only in a Python context, could receive Python or JavaScript iterator
        try {                                   // Primarily assume Python iterator, for max speed
            var result = iterator.__next__ ();
        }
        catch (exception) {                     // JavaScript iterators are the exception here
            var result = iterator.next ();
            if (result.done) {
                throw StopIteration (new Error ());
            }
            else {
                return result.value;
            }
        }
        if (result == undefined) {
            throw StopIteration (new Error ());
        }
        else {
            return result;
        }
    }

    function __PyIterator__ (iterable) {
        this.iterable = iterable;
        this.index = 0;
    }

    __PyIterator__.prototype.__next__ = function () {
        if (this.index < this.iterable.length) {
            return this.iterable [this.index++];
        }
        else {
            throw StopIteration (new Error ());
        }
    };

    function __JsIterator__ (iterable) {
        this.iterable = iterable;
        this.index = 0;
    }

    __JsIterator__.prototype.next = function () {
        if (this.index < this.iterable.py_keys.length) {
            return {value: this.index++, done: false};
        }
        else {
            return {value: undefined, done: true};
        }
    };

    // END unified iterator model

    // Reversed function for arrays
    var py_reversed = function (iterable) {
        iterable = iterable.slice ();
        iterable.reverse ();
        return iterable;
    };
    __all__.py_reversed = py_reversed;

    // Zip method for arrays and strings
    var zip = function () {
        var args = [] .slice.call (arguments);
        for (var i = 0; i < args.length; i++) {
            if (typeof args [i] == 'string') {
                args [i] = args [i] .split ('');
            }
            else if (!Array.isArray (args [i])) {
                args [i] = Array.from (args [i]);
            }
        }
        var shortest = args.length == 0 ? [] : args.reduce (    // Find shortest array in arguments
            function (array0, array1) {
                return array0.length < array1.length ? array0 : array1;
            }
        );
        return shortest.map (                   // Map each element of shortest array
            function (current, index) {         // To the result of this function
                return args.map (               // Map each array in arguments
                    function (current) {        // To the result of this function
                        return current [index]; // Namely it's index't entry
                    }
                );
            }
        );
    };
    __all__.zip = zip;

    // Range method, returning an array
    function range (start, stop, step) {
        if (stop == undefined) {
            // one param defined
            stop = start;
            start = 0;
        }
        if (step == undefined) {
            step = 1;
        }
        if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
            return [];
        }
        var result = [];
        for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
            result.push(i);
        }
        return result;
    };
    __all__.range = range;

    // Any, all and sum

    function any (iterable) {
        for (let item of iterable) {
            if (bool (item)) {
                return true;
            }
        }
        return false;
    }
    function all (iterable) {
        for (let item of iterable) {
            if (! bool (item)) {
                return false;
            }
        }
        return true;
    }
    function sum (iterable) {
        let result = 0;
        for (let item of iterable) {
            result += item;
        }
        return result;
    }

    __all__.any = any;
    __all__.all = all;
    __all__.sum = sum;

    // Enumerate method, returning a zipped list
    function enumerate (iterable) {
        return zip (range (len (iterable)), iterable);
    }
    __all__.enumerate = enumerate;

    // Shallow and deepcopy

    function copy (anObject) {
        if (anObject == null || typeof anObject == "object") {
            return anObject;
        }
        else {
            var result = {};
            for (var attrib in obj) {
                if (anObject.hasOwnProperty (attrib)) {
                    result [attrib] = anObject [attrib];
                }
            }
            return result;
        }
    }
    __all__.copy = copy;

    function deepcopy (anObject) {
        if (anObject == null || typeof anObject == "object") {
            return anObject;
        }
        else {
            var result = {};
            for (var attrib in obj) {
                if (anObject.hasOwnProperty (attrib)) {
                    result [attrib] = deepcopy (anObject [attrib]);
                }
            }
            return result;
        }
    }
    __all__.deepcopy = deepcopy;

    // List extensions to Array

    function list (iterable) {                                      // All such creators should be callable without new
        var instance = iterable ? Array.from (iterable) : [];
        // Sort is the normal JavaScript sort, Python sort is a non-member function
        return instance;
    }
    __all__.list = list;
    Array.prototype.__class__ = list;   // All arrays are lists (not only if constructed by the list ctor), unless constructed otherwise
    list.__name__ = 'list';

    /*
    Array.from = function (iterator) { // !!! remove
        result = [];
        for (item of iterator) {
            result.push (item);
        }
        return result;
    }
    */

    Array.prototype.__iter__ = function () {return new __PyIterator__ (this);};

    Array.prototype.__getslice__ = function (start, stop, step) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }
        else if (stop > this.length) {
            stop = this.length;
        }

        var result = list ([]);
        for (var index = start; index < stop; index += step) {
            result.push (this [index]);
        }

        return result;
    };

    Array.prototype.__setslice__ = function (start, stop, step, source) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }

        if (step == null) { // Assign to 'ordinary' slice, replace subsequence
            Array.prototype.splice.apply (this, [start, stop - start] .concat (source));
        }
        else {              // Assign to extended slice, replace designated items one by one
            var sourceIndex = 0;
            for (var targetIndex = start; targetIndex < stop; targetIndex += step) {
                this [targetIndex] = source [sourceIndex++];
            }
        }
    };

    Array.prototype.__repr__ = function () {
        if (this.__class__ == set && !this.length) {
            return 'set()';
        }

        var result = !this.__class__ || this.__class__ == list ? '[' : this.__class__ == tuple ? '(' : '{';

        for (var index = 0; index < this.length; index++) {
            if (index) {
                result += ', ';
            }
            result += repr (this [index]);
        }

        if (this.__class__ == tuple && this.length == 1) {
            result += ',';
        }

        result += !this.__class__ || this.__class__ == list ? ']' : this.__class__ == tuple ? ')' : '}';;
        return result;
    };

    Array.prototype.__str__ = Array.prototype.__repr__;

    Array.prototype.append = function (element) {
        this.push (element);
    };

    Array.prototype.clear = function () {
        this.length = 0;
    };

    Array.prototype.extend = function (aList) {
        this.push.apply (this, aList);
    };

    Array.prototype.insert = function (index, element) {
        this.splice (index, 0, element);
    };

    Array.prototype.remove = function (element) {
        var index = this.indexOf (element);
        if (index == -1) {
            throw ValueError (new Error ());
        }
        this.splice (index, 1);
    };

    Array.prototype.index = function (element) {
        return this.indexOf (element);
    };

    Array.prototype.py_pop = function (index) {
        if (index == undefined) {
            return this.pop ();  // Remove last element
        }
        else {
            return this.splice (index, 1) [0];
        }
    };

    Array.prototype.py_sort = function () {
        __sort__.apply  (null, [this].concat ([] .slice.apply (arguments)));    // Can't work directly with arguments
        // Python params: (iterable, key = None, reverse = False)
        // py_sort is called with the Transcrypt kwargs mechanism, and just passes the params on to __sort__
        // __sort__ is def'ed with the Transcrypt kwargs mechanism
    };

    Array.prototype.__add__ = function (aList) {
        return list (this.concat (aList));
    };

    Array.prototype.__mul__ = function (scalar) {
        var result = this;
        for (var i = 1; i < scalar; i++) {
            result = result.concat (this);
        }
        return result;
    };

    Array.prototype.__rmul__ = Array.prototype.__mul__;

    // Tuple extensions to Array

    function tuple (iterable) {
        var instance = iterable ? [] .slice.apply (iterable) : [];
        instance.__class__ = tuple; // Not all arrays are tuples
        return instance;
    }
    __all__.tuple = tuple;
    tuple.__name__ = 'tuple';

    // Set extensions to Array
    // N.B. Since sets are unordered, set operations will occasionally alter the 'this' array by sorting it

    function set (iterable) {
        var instance = [];
        if (iterable) {
            for (var index = 0; index < iterable.length; index++) {
                instance.add (iterable [index]);
            }


        }
        instance.__class__ = set;   // Not all arrays are sets
        return instance;
    }
    __all__.set = set;
    set.__name__ = 'set';

    Array.prototype.__bindexOf__ = function (element) { // Used to turn O (n^2) into O (n log n)
    // Since sorting is lex, compare has to be lex. This also allows for mixed lists

        element += '';

        var mindex = 0;
        var maxdex = this.length - 1;

        while (mindex <= maxdex) {
            var index = (mindex + maxdex) / 2 | 0;
            var middle = this [index] + '';

            if (middle < element) {
                mindex = index + 1;
            }
            else if (middle > element) {
                maxdex = index - 1;
            }
            else {
                return index;
            }
        }

        return -1;
    };

    Array.prototype.add = function (element) {
        if (this.indexOf (element) == -1) { // Avoid duplicates in set
            this.push (element);
        }
    };

    Array.prototype.discard = function (element) {
        var index = this.indexOf (element);
        if (index != -1) {
            this.splice (index, 1);
        }
    };

    Array.prototype.isdisjoint = function (other) {
        this.sort ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) != -1) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.issuperset = function (other) {
        this.sort ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) == -1) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.issubset = function (other) {
        return set (other.slice ()) .issuperset (this); // Sort copy of 'other', not 'other' itself, since it may be an ordered sequence
    };

    Array.prototype.union = function (other) {
        var result = set (this.slice () .sort ());
        for (var i = 0; i < other.length; i++) {
            if (result.__bindexOf__ (other [i]) == -1) {
                result.push (other [i]);
            }
        }
        return result;
    };

    Array.prototype.intersection = function (other) {
        this.sort ();
        var result = set ();
        for (var i = 0; i < other.length; i++) {
            if (this.__bindexOf__ (other [i]) != -1) {
                result.push (other [i]);
            }
        }
        return result;
    };

    Array.prototype.difference = function (other) {
        var sother = set (other.slice () .sort ());
        var result = set ();
        for (var i = 0; i < this.length; i++) {
            if (sother.__bindexOf__ (this [i]) == -1) {
                result.push (this [i]);
            }
        }
        return result;
    };

    Array.prototype.symmetric_difference = function (other) {
        return this.union (other) .difference (this.intersection (other));
    };

    Array.prototype.py_update = function () {   // O (n)
        var updated = [] .concat.apply (this.slice (), arguments) .sort ();
        this.clear ();
        for (var i = 0; i < updated.length; i++) {
            if (updated [i] != updated [i - 1]) {
                this.push (updated [i]);
            }
        }
    };

    Array.prototype.__eq__ = function (other) { // Also used for list
        if (this.length != other.length) {
            return false;
        }
        if (this.__class__ == set) {
            this.sort ();
            other.sort ();
        }
        for (var i = 0; i < this.length; i++) {
            if (this [i] != other [i]) {
                return false;
            }
        }
        return true;
    };

    Array.prototype.__ne__ = function (other) { // Also used for list
        return !this.__eq__ (other);
    };

    Array.prototype.__le__ = function (other) {
        return this.issubset (other);
    };

    Array.prototype.__ge__ = function (other) {
        return this.issuperset (other);
    };

    Array.prototype.__lt__ = function (other) {
        return this.issubset (other) && !this.issuperset (other);
    };

    Array.prototype.__gt__ = function (other) {
        return this.issuperset (other) && !this.issubset (other);
    };

    // String extensions

    function str (stringable) {
        try {
            return stringable.__str__ ();
        }
        catch (exception) {
            try {
                return repr (stringable);
            }
            catch (exception) {
                return String (stringable); // No new, so no permanent String object but a primitive in a temporary 'just in time' wrapper
            }
        }
    };
    __all__.str = str;

    String.prototype.__class__ = str;   // All strings are str
    str.__name__ = 'str';

    String.prototype.__iter__ = function () {new __PyIterator__ (this);};

    String.prototype.__repr__ = function () {
        return (this.indexOf ('\'') == -1 ? '\'' + this + '\'' : '"' + this + '"') .py_replace ('\t', '\\t') .py_replace ('\n', '\\n');
    };

    String.prototype.__str__ = function () {
        return this;
    };

    String.prototype.capitalize = function () {
        return this.charAt (0).toUpperCase () + this.slice (1);
    };

    String.prototype.endswith = function (suffix) {
        return suffix == '' || this.slice (-suffix.length) == suffix;
    };

    String.prototype.find  = function (sub, start) {
        return this.indexOf (sub, start);
    };

    String.prototype.__getslice__ = function (start, stop, step) {
        if (start < 0) {
            start = this.length + start;
        }

        if (stop == null) {
            stop = this.length;
        }
        else if (stop < 0) {
            stop = this.length + stop;
        }

        var result = '';
        if (step == 1) {
            result = this.substring (start, stop);
        }
        else {
            for (var index = start; index < stop; index += step) {
                result = result.concat (this.charAt(index));
            }
        }
        return result;
    }

    // Since it's worthwhile for the 'format' function to be able to deal with *args, it is defined as a property
    // __get__ will produce a bound function if there's something before the dot
    // Since a call using *args is compiled to e.g. <object>.<function>.apply (null, args), the function has to be bound already
    // Otherwise it will never be, because of the null argument
    // Using 'this' rather than 'null' contradicts the requirement to be able to pass bound functions around
    // The object 'before the dot' won't be available at call time in that case, unless implicitly via the function bound to it
    // While for Python methods this mechanism is generated by the compiler, for JavaScript methods it has to be provided manually
    // Call memoizing is unattractive here, since every string would then have to hold a reference to a bound format method
    __setProperty__ (String.prototype, 'format', {
        get: function () {return __get__ (this, function (self) {
            var args = tuple ([] .slice.apply (arguments).slice (1));
            var autoIndex = 0;
            return self.replace (/\{(\w*)\}/g, function (match, key) {
                if (key == '') {
                    key = autoIndex++;
                }
                if (key == +key) {  // So key is numerical
                    return args [key] == undefined ? match : str (args [key]);
                }
                else {              // Key is a string
                    for (var index = 0; index < args.length; index++) {
                        // Find first 'dict' that has that key and the right field
                        if (typeof args [index] == 'object' && args [index][key] != undefined) {
                            return str (args [index][key]); // Return that field field
                        }
                    }
                    return match;
                }
            });
        });},
        enumerable: true
    });

    String.prototype.isalnum = function () {
        return /^[0-9a-zA-Z]{1,}$/.test(this)
    }

    String.prototype.isalpha = function () {
        return /^[a-zA-Z]{1,}$/.test(this)
    }

    String.prototype.isdecimal = function () {
        return /^[0-9]{1,}$/.test(this)
    }

    String.prototype.isdigit = function () {
        return this.isdecimal()
    }

    String.prototype.islower = function () {
        return /^[a-z]{1,}$/.test(this)
    }

    String.prototype.isupper = function () {
        return /^[A-Z]{1,}$/.test(this)
    }

    String.prototype.isspace = function () {
        return /^[\s]{1,}$/.test(this)
    }

    String.prototype.isnumeric = function () {
        return !isNaN (parseFloat (this)) && isFinite (this);
    };

    String.prototype.join = function (strings) {
        strings = Array.from (strings); // Much faster than iterating through strings char by char
        return strings.join (this);
    };

    String.prototype.lower = function () {
        return this.toLowerCase ();
    };

    String.prototype.py_replace = function (old, aNew, maxreplace) {
        return this.split (old, maxreplace) .join (aNew);
    };

    String.prototype.lstrip = function () {
        return this.replace (/^\s*/g, '');
    };

    String.prototype.rfind = function (sub, start) {
        return this.lastIndexOf (sub, start);
    };

    String.prototype.rsplit = function (sep, maxsplit) {    // Combination of general whitespace sep and positive maxsplit neither supported nor checked, expensive and rare
        if (sep == undefined || sep == null) {
            sep = /\s+/;
            var stripped = this.strip ();
        }
        else {
            var stripped = this;
        }

        if (maxsplit == undefined || maxsplit == -1) {
            return stripped.split (sep);
        }
        else {
            var result = stripped.split (sep);
            if (maxsplit < result.length) {
                var maxrsplit = result.length - maxsplit;
                return [result.slice (0, maxrsplit) .join (sep)] .concat (result.slice (maxrsplit));
            }
            else {
                return result;
            }
        }
    };

    String.prototype.rstrip = function () {
        return this.replace (/\s*$/g, '');
    };

    String.prototype.py_split = function (sep, maxsplit) {  // Combination of general whitespace sep and positive maxsplit neither supported nor checked, expensive and rare
        if (sep == undefined || sep == null) {
            sep = /\s+/;
            var stripped = this.strip ();
        }
        else {
            var stripped = this;
        }

        if (maxsplit == undefined || maxsplit == -1) {
            return stripped.split (sep);
        }
        else {
            var result = stripped.split (sep);
            if (maxsplit < result.length) {
                return result.slice (0, maxsplit).concat ([result.slice (maxsplit).join (sep)]);
            }
            else {
                return result;
            }
        }
    };

    String.prototype.startswith = function (prefix) {
        return this.indexOf (prefix) == 0;
    };

    String.prototype.strip = function () {
        return this.trim ();
    };

    String.prototype.upper = function () {
        return this.toUpperCase ();
    };

    String.prototype.__mul__ = function (scalar) {
        var result = this;
        for (var i = 1; i < scalar; i++) {
            result = result + this;
        }
        return result;
    };

    String.prototype.__rmul__ = String.prototype.__mul__;

    // Dict extensions to object

    function __keys__ () {
        var keys = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                keys.push (attrib);
            }
        }
        return keys;
    }

    function __items__ () {
        var items = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                items.push ([attrib, this [attrib]]);
            }
        }
        return items;
    }

    function __del__ (key) {
        delete this [key];
    }

    function __clear__ () {
        for (var attrib in this) {
            delete this [attrib];
        }
    }

    function __getdefault__ (aKey, aDefault) {  // Each Python object already has a function called __get__, so we call this one __getdefault__
        var result = this [aKey];
        return result == undefined ? (aDefault == undefined ? null : aDefault) : result;
    }

    function __setdefault__ (aKey, aDefault) {
        var result = this [aKey];
        if (result != undefined) {
            return result;
        }
        var val = aDefault == undefined ? null : aDefault;
        this [aKey] = val;
        return val;
    }

    function __pop__ (aKey, aDefault) {
        var result = this [aKey];
        if (result != undefined) {
            delete this [aKey];
            return result;
        } else {
            // Identify check because user could pass None
            if ( aDefault === undefined ) {
                throw KeyError (aKey, new Error());
            }
        }
        return aDefault;
    }
    
    function __popitem__ () {
        var aKey = Object.keys (this) [0];
        if (aKey == null) {
            throw KeyError (aKey, new Error ());
        }
        var result = tuple ([aKey, this [aKey]]);
        delete this [aKey];
        return result;
    }
    
    function __update__ (aDict) {
        for (var aKey in aDict) {
            this [aKey] = aDict [aKey];
        }
    }
    
    function __values__ () {
        var values = [];
        for (var attrib in this) {
            if (!__specialattrib__ (attrib)) {
                values.push (this [attrib]);
            }
        }
        return values;

    }
    
    function __dgetitem__ (aKey) {
        return this [aKey];
    }
    
    function __dsetitem__ (aKey, aValue) {
        this [aKey] = aValue;
    }

    function dict (objectOrPairs) {
        var instance = {};
        if (!objectOrPairs || objectOrPairs instanceof Array) { // It's undefined or an array of pairs
            if (objectOrPairs) {
                for (var index = 0; index < objectOrPairs.length; index++) {
                    var pair = objectOrPairs [index];
                    if ( !(pair instanceof Array) || pair.length != 2) {
                        throw ValueError(
                            "dict update sequence element #" + index +
                            " has length " + pair.length +
                            "; 2 is required", new Error());
                    }
                    var key = pair [0];
                    var val = pair [1];
                    if (!(objectOrPairs instanceof Array) && objectOrPairs instanceof Object) {
                         // User can potentially pass in an object
                         // that has a hierarchy of objects. This
                         // checks to make sure that these objects
                         // get converted to dict objects instead of
                         // leaving them as js objects.
                         
                         if (!isinstance (objectOrPairs, dict)) {
                             val = dict (val);
                         }
                    }
                    instance [key] = val;
                }
            }
        }
        else {
            if (isinstance (objectOrPairs, dict)) {
                // Passed object is a dict already so we need to be a little careful
                // N.B. - this is a shallow copy per python std - so
                // it is assumed that children have already become
                // python objects at some point.
                
                var aKeys = objectOrPairs.py_keys ();
                for (var index = 0; index < aKeys.length; index++ ) {
                    var key = aKeys [index];
                    instance [key] = objectOrPairs [key];
                }
            } else if (objectOrPairs instanceof Object) {
                // Passed object is a JavaScript object but not yet a dict, don't copy it
                instance = objectOrPairs;
            } else {
                // We have already covered Array so this indicates
                // that the passed object is not a js object - i.e.
                // it is an int or a string, which is invalid.
                
                throw ValueError ("Invalid type of object for dict creation", new Error ());
            }
        }

        // Trancrypt interprets e.g. {aKey: 'aValue'} as a Python dict literal rather than a JavaScript object literal
        // So dict literals rather than bare Object literals will be passed to JavaScript libraries
        // Some JavaScript libraries call all enumerable callable properties of an object that's passed to them
        // So the properties of a dict should be non-enumerable
        __setProperty__ (instance, '__class__', {value: dict, enumerable: false, writable: true});
        __setProperty__ (instance, 'py_keys', {value: __keys__, enumerable: false});
        __setProperty__ (instance, '__iter__', {value: function () {new __PyIterator__ (this.py_keys ());}, enumerable: false});
        __setProperty__ (instance, Symbol.iterator, {value: function () {new __JsIterator__ (this.py_keys ());}, enumerable: false});
        __setProperty__ (instance, 'py_items', {value: __items__, enumerable: false});
        __setProperty__ (instance, 'py_del', {value: __del__, enumerable: false});
        __setProperty__ (instance, 'py_clear', {value: __clear__, enumerable: false});
        __setProperty__ (instance, 'py_get', {value: __getdefault__, enumerable: false});
        __setProperty__ (instance, 'py_setdefault', {value: __setdefault__, enumerable: false});
        __setProperty__ (instance, 'py_pop', {value: __pop__, enumerable: false});
        __setProperty__ (instance, 'py_popitem', {value: __popitem__, enumerable: false});
        __setProperty__ (instance, 'py_update', {value: __update__, enumerable: false});
        __setProperty__ (instance, 'py_values', {value: __values__, enumerable: false});
        __setProperty__ (instance, '__getitem__', {value: __dgetitem__, enumerable: false});    // Needed since compound keys necessarily
        __setProperty__ (instance, '__setitem__', {value: __dsetitem__, enumerable: false});    // trigger overloading to deal with slices
        return instance;
    }

    __all__.dict = dict;
    dict.__name__ = 'dict';
    
    // Docstring setter

    function __setdoc__ (docString) {
        this.__doc__ = docString;
        return this;
    }

    // Python classes, methods and functions are all translated to JavaScript functions
    __setProperty__ (Function.prototype, '__setdoc__', {value: __setdoc__, enumerable: false});

    // General operator overloading, only the ones that make most sense in matrix and complex operations

    var __neg__ = function (a) {
        if (typeof a == 'object' && '__neg__' in a) {
            return a.__neg__ ();
        }
        else {
            return -a;
        }
    };
    __all__.__neg__ = __neg__;

    var __matmul__ = function (a, b) {
        return a.__matmul__ (b);
    };
    __all__.__matmul__ = __matmul__;

    var __pow__ = function (a, b) {
        if (typeof a == 'object' && '__pow__' in a) {
            return a.__pow__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rpow__ (a);
        }
        else {
            return Math.pow (a, b);
        }
    };
    __all__.pow = __pow__;

    var __jsmod__ = function (a, b) {
        if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return a % b;
        }
    };
    __all__.__jsmod__ = __jsmod__;
    
    var __mod__ = function (a, b) {
        if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return ((a % b) + b) % b;
        }
    };
    __all__.mod = __mod__;

    // Overloaded binary arithmetic
    
    var __mul__ = function (a, b) {
        if (typeof a == 'object' && '__mul__' in a) {
            return a.__mul__ (b);
        }
        else if (typeof b == 'object' && '__rmul__' in b) {
            return b.__rmul__ (a);
        }
        else if (typeof a == 'string') {
            return a.__mul__ (b);
        }
        else if (typeof b == 'string') {
            return b.__rmul__ (a);
        }
        else {
            return a * b;
        }
    };
    __all__.__mul__ = __mul__;

    var __truediv__ = function (a, b) {
        if (typeof a == 'object' && '__truediv__' in a) {
            return a.__truediv__ (b);
        }
        else if (typeof b == 'object' && '__rtruediv__' in b) {
            return b.__rtruediv__ (a);
        }
        else if (typeof a == 'object' && '__div__' in a) {
            return a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return b.__rdiv__ (a);
        }
        else {
            return a / b;
        }
    };
    __all__.__truediv__ = __truediv__;

    var __floordiv__ = function (a, b) {
        if (typeof a == 'object' && '__floordiv__' in a) {
            return a.__floordiv__ (b);
        }
        else if (typeof b == 'object' && '__rfloordiv__' in b) {
            return b.__rfloordiv__ (a);
        }
        else if (typeof a == 'object' && '__div__' in a) {
            return a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return b.__rdiv__ (a);
        }
        else {
            return Math.floor (a / b);
        }
    };
    __all__.__floordiv__ = __floordiv__;

    var __add__ = function (a, b) {
        if (typeof a == 'object' && '__add__' in a) {
            return a.__add__ (b);
        }
        else if (typeof b == 'object' && '__radd__' in b) {
            return b.__radd__ (a);
        }
        else {
            return a + b;
        }
    };
    __all__.__add__ = __add__;

    var __sub__ = function (a, b) {
        if (typeof a == 'object' && '__sub__' in a) {
            return a.__sub__ (b);
        }
        else if (typeof b == 'object' && '__rsub__' in b) {
            return b.__rsub__ (a);
        }
        else {
            return a - b;
        }
    };
    __all__.__sub__ = __sub__;

    // Overloaded binary bitwise
    
    var __lshift__ = function (a, b) {
        if (typeof a == 'object' && '__lshift__' in a) {
            return a.__lshift__ (b);
        }
        else if (typeof b == 'object' && '__rlshift__' in b) {
            return b.__rlshift__ (a);
        }
        else {
            return a << b;
        }
    };
    __all__.__lshift__ = __lshift__;

    var __rshift__ = function (a, b) {
        if (typeof a == 'object' && '__rshift__' in a) {
            return a.__rshift__ (b);
        }
        else if (typeof b == 'object' && '__rrshift__' in b) {
            return b.__rrshift__ (a);
        }
        else {
            return a >> b;
        }
    };
    __all__.__rshift__ = __rshift__;

    var __or__ = function (a, b) {
        if (typeof a == 'object' && '__or__' in a) {
            return a.__or__ (b);
        }
        else if (typeof b == 'object' && '__ror__' in b) {
            return b.__ror__ (a);
        }
        else {
            return a | b;
        }
    };
    __all__.__or__ = __or__;

    var __xor__ = function (a, b) {
        if (typeof a == 'object' && '__xor__' in a) {
            return a.__xor__ (b);
        }
        else if (typeof b == 'object' && '__rxor__' in b) {
            return b.__rxor__ (a);
        }
        else {
            return a ^ b;
        }
    };
    __all__.__xor__ = __xor__;

    var __and__ = function (a, b) {
        if (typeof a == 'object' && '__and__' in a) {
            return a.__and__ (b);
        }
        else if (typeof b == 'object' && '__rand__' in b) {
            return b.__rand__ (a);
        }
        else {
            return a & b;
        }
    };
    __all__.__and__ = __and__;

    // Overloaded binary compare
    
    var __eq__ = function (a, b) {
        if (typeof a == 'object' && '__eq__' in a) {
            return a.__eq__ (b);
        }
        else {
            return a == b;
        }
    };
    __all__.__eq__ = __eq__;

    var __ne__ = function (a, b) {
        if (typeof a == 'object' && '__ne__' in a) {
            return a.__ne__ (b);
        }
        else {
            return a != b
        }
    };
    __all__.__ne__ = __ne__;

    var __lt__ = function (a, b) {
        if (typeof a == 'object' && '__lt__' in a) {
            return a.__lt__ (b);
        }
        else {
            return a < b;
        }
    };
    __all__.__lt__ = __lt__;

    var __le__ = function (a, b) {
        if (typeof a == 'object' && '__le__' in a) {
            return a.__le__ (b);
        }
        else {
            return a <= b;
        }
    };
    __all__.__le__ = __le__;

    var __gt__ = function (a, b) {
        if (typeof a == 'object' && '__gt__' in a) {
            return a.__gt__ (b);
        }
        else {
            return a > b;
        }
    };
    __all__.__gt__ = __gt__;

    var __ge__ = function (a, b) {
        if (typeof a == 'object' && '__ge__' in a) {
            return a.__ge__ (b);
        }
        else {
            return a >= b;
        }
    };
    __all__.__ge__ = __ge__;
    
    // Overloaded augmented general
    
    var __imatmul__ = function (a, b) {
        if ('__imatmul__' in a) {
            return a.__imatmul__ (b);
        }
        else {
            return a.__matmul__ (b);
        }
    };
    __all__.__imatmul__ = __imatmul__;

    var __ipow__ = function (a, b) {
        if (typeof a == 'object' && '__pow__' in a) {
            return a.__ipow__ (b);
        }
        else if (typeof a == 'object' && '__ipow__' in a) {
            return a.__pow__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rpow__ (a);
        }
        else {
            return Math.pow (a, b);
        }
    };
    __all__.ipow = __ipow__;

    var __ijsmod__ = function (a, b) {
        if (typeof a == 'object' && '__imod__' in a) {
            return a.__ismod__ (b);
        }
        else if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return a % b;
        }
    };
    __all__.ijsmod__ = __ijsmod__;
    
    var __imod__ = function (a, b) {
        if (typeof a == 'object' && '__imod__' in a) {
            return a.__imod__ (b);
        }
        else if (typeof a == 'object' && '__mod__' in a) {
            return a.__mod__ (b);
        }
        else if (typeof b == 'object' && '__rpow__' in b) {
            return b.__rmod__ (a);
        }
        else {
            return ((a % b) + b) % b;
        }
    };
    __all__.imod = __imod__;
    
    // Overloaded augmented arithmetic
    
    var __imul__ = function (a, b) {
        if (typeof a == 'object' && '__imul__' in a) {
            return a.__imul__ (b);
        }
        else if (typeof a == 'object' && '__mul__' in a) {
            return a = a.__mul__ (b);
        }
        else if (typeof b == 'object' && '__rmul__' in b) {
            return a = b.__rmul__ (a);
        }
        else if (typeof a == 'string') {
            return a = a.__mul__ (b);
        }
        else if (typeof b == 'string') {
            return a = b.__rmul__ (a);
        }
        else {
            return a *= b;
        }
    };
    __all__.__imul__ = __imul__;

    var __idiv__ = function (a, b) {
        if (typeof a == 'object' && '__idiv__' in a) {
            return a.__idiv__ (b);
        }
        else if (typeof a == 'object' && '__div__' in a) {
            return a = a.__div__ (b);
        }
        else if (typeof b == 'object' && '__rdiv__' in b) {
            return a = b.__rdiv__ (a);
        }
        else {
            return a /= b;
        }
    };
    __all__.__idiv__ = __idiv__;

    var __iadd__ = function (a, b) {
        if (typeof a == 'object' && '__iadd__' in a) {
            return a.__iadd__ (b);
        }
        else if (typeof a == 'object' && '__add__' in a) {
            return a = a.__add__ (b);
        }
        else if (typeof b == 'object' && '__radd__' in b) {
            return a = b.__radd__ (a);
        }
        else {
            return a += b;
        }
    };
    __all__.__iadd__ = __iadd__;

    var __isub__ = function (a, b) {
        if (typeof a == 'object' && '__isub__' in a) {
            return a.__isub__ (b);
        }
        else if (typeof a == 'object' && '__sub__' in a) {
            return a = a.__sub__ (b);
        }
        else if (typeof b == 'object' && '__rsub__' in b) {
            return a = b.__rsub__ (a);
        }
        else {
            return a -= b;
        }
    };
    __all__.__isub__ = __isub__;

    // Overloaded augmented bitwise
    
    var __ilshift__ = function (a, b) {
        if (typeof a == 'object' && '__ilshift__' in a) {
            return a.__ilshift__ (b);
        }
        else if (typeof a == 'object' && '__lshift__' in a) {
            return a = a.__lshift__ (b);
        }
        else if (typeof b == 'object' && '__rlshift__' in b) {
            return a = b.__rlshift__ (a);
        }
        else {
            return a <<= b;
        }
    };
    __all__.__ilshift__ = __ilshift__;

    var __irshift__ = function (a, b) {
        if (typeof a == 'object' && '__irshift__' in a) {
            return a.__irshift__ (b);
        }
        else if (typeof a == 'object' && '__rshift__' in a) {
            return a = a.__rshift__ (b);
        }
        else if (typeof b == 'object' && '__rrshift__' in b) {
            return a = b.__rrshift__ (a);
        }
        else {
            return a >>= b;
        }
    };
    __all__.__irshift__ = __irshift__;

    var __ior__ = function (a, b) {
        if (typeof a == 'object' && '__ior__' in a) {
            return a.__ior__ (b);
        }
        else if (typeof a == 'object' && '__or__' in a) {
            return a = a.__or__ (b);
        }
        else if (typeof b == 'object' && '__ror__' in b) {
            return a = b.__ror__ (a);
        }
        else {
            return a |= b;
        }
    };
    __all__.__ior__ = __ior__;

    var __ixor__ = function (a, b) {
        if (typeof a == 'object' && '__ixor__' in a) {
            return a.__ixor__ (b);
        }
        else if (typeof a == 'object' && '__xor__' in a) {
            return a = a.__xor__ (b);
        }
        else if (typeof b == 'object' && '__rxor__' in b) {
            return a = b.__rxor__ (a);
        }
        else {
            return a ^= b;
        }
    };
    __all__.__ixor__ = __ixor__;

    var __iand__ = function (a, b) {
        if (typeof a == 'object' && '__iand__' in a) {
            return a.__iand__ (b);
        }
        else if (typeof a == 'object' && '__and__' in a) {
            return a = a.__and__ (b);
        }
        else if (typeof b == 'object' && '__rand__' in b) {
            return a = b.__rand__ (a);
        }
        else {
            return a &= b;
        }
    };
    __all__.__iand__ = __iand__;
    
    // Indices and slices

    var __getitem__ = function (container, key) {                           // Slice c.q. index, direct generated call to runtime switch
        if (typeof container == 'object' && '__getitem__' in container) {
            return container.__getitem__ (key);                             // Overloaded on container
        }
        else {
            return container [key];                                         // Container must support bare JavaScript brackets
        }
    };
    __all__.__getitem__ = __getitem__;

    var __setitem__ = function (container, key, value) {                    // Slice c.q. index, direct generated call to runtime switch
        if (typeof container == 'object' && '__setitem__' in container) {
            container.__setitem__ (key, value);                             // Overloaded on container
        }
        else {
            container [key] = value;                                        // Container must support bare JavaScript brackets
        }
    };
    __all__.__setitem__ = __setitem__;

    var __getslice__ = function (container, lower, upper, step) {           // Slice only, no index, direct generated call to runtime switch
        if (typeof container == 'object' && '__getitem__' in container) {
            return container.__getitem__ ([lower, upper, step]);            // Container supports overloaded slicing c.q. indexing
        }
        else {
            return container.__getslice__ (lower, upper, step);             // Container only supports slicing injected natively in prototype
        }
    };
    __all__.__getslice__ = __getslice__;

    var __setslice__ = function (container, lower, upper, step, value) {    // Slice, no index, direct generated call to runtime switch
        if (typeof container == 'object' && '__setitem__' in container) {
            container.__setitem__ ([lower, upper, step], value);            // Container supports overloaded slicing c.q. indexing
        }
        else {
            container.__setslice__ (lower, upper, step, value);             // Container only supports slicing injected natively in prototype
        }
    };
    __all__.__setslice__ = __setslice__;
	__nest__ (
		__all__,
		'ferret.pnw.constants', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var AlliancePosition = __class__ ('AlliancePosition', [object], {
						NONE: 0,
						APPLICANT: 1,
						MEMBER: 2,
						OFFICER: 3,
						HEIR: 4,
						LEADER: 5
					});
					var Color = __class__ ('Color', [object], {
						AQUA: 0,
						BEIGE: 1,
						BLACK: 2,
						BLUE: 3,
						BROWN: 4,
						GRAY: 5,
						GREEN: 6,
						LIME: 7,
						MAROON: 8,
						OLIVE: 9,
						ORANGE: 10,
						PINK: 11,
						PURPLE: 12,
						RED: 13,
						WHITE: 14,
						YELLOW: 15
					});
					var Continent = __class__ ('Continent', [object], {
						NORTH_AMERICA: 0,
						SOUTH_AMERICA: 1,
						EUROPE: 2,
						AFRICA: 3,
						ASIA: 4,
						AUSTRALIA: 5
					});
					var DomesticPolicy = __class__ ('DomesticPolicy', [object], {
						MANIFEST_DESTINY: 0,
						OPEN_MARKETS: 1,
						TECHNOLOGICAL_ADVANCEMENT: 2,
						IMPERIALISM: 3,
						URBANIZATION: 4
					});
					var EconomicPolicy = __class__ ('EconomicPolicy', [object], {
						EXTREMELY_LEFT_WING: 0,
						FAR_LEFT_WING: 1,
						LEFT_WING: 2,
						MODERATE: 3,
						RIGHT_WING: 4,
						FAR_RIGHT_WING: 5,
						EXTREMELY_RIGHT_WING: 6
					});
					var Improvement = __class__ ('Improvement', [object], {
						COAL_POWER: 0,
						OIL_POWER: 1,
						NUCLEAR_POWER: 2,
						WIND_POWER: 3,
						COAL_MINE: 4,
						OIL_WELL: 5,
						IRON_MINE: 6,
						BAUXITE_MINE: 7,
						LEAD_MINE: 8,
						URANIUM_MINE: 9,
						FARM: 10,
						GASOLINE_REFINERY: 11,
						STEEL_MILL: 12,
						ALUMINUM_REFINERY: 13,
						MUNITIONS_FACTORY: 14,
						POLICE_STATION: 15,
						HOSPITAL: 16,
						RECYCLING_CENTER: 17,
						SUBWAY: 18,
						SUPERMARKET: 19,
						BANK: 20,
						MALL: 21,
						STADIUM: 22,
						BARRACKS: 23,
						FACTORY: 24,
						HANGAR: 25,
						DRYDOCK: 26
					});
					var ImprovementStats = __class__ ('ImprovementStats', [object], {
						get __init__ () {return __get__ (this, function (self, py_name, purchase, upkeep, production, usage, pollution, commerce, capacity, _max, power) {
							if (typeof upkeep == 'undefined' || (upkeep != null && upkeep .hasOwnProperty ("__kwargtrans__"))) {;
								var upkeep = 0.0;
							};
							if (typeof production == 'undefined' || (production != null && production .hasOwnProperty ("__kwargtrans__"))) {;
								var production = null;
							};
							if (typeof usage == 'undefined' || (usage != null && usage .hasOwnProperty ("__kwargtrans__"))) {;
								var usage = null;
							};
							if (typeof pollution == 'undefined' || (pollution != null && pollution .hasOwnProperty ("__kwargtrans__"))) {;
								var pollution = 0;
							};
							if (typeof commerce == 'undefined' || (commerce != null && commerce .hasOwnProperty ("__kwargtrans__"))) {;
								var commerce = 0.0;
							};
							if (typeof capacity == 'undefined' || (capacity != null && capacity .hasOwnProperty ("__kwargtrans__"))) {;
								var capacity = null;
							};
							if (typeof _max == 'undefined' || (_max != null && _max .hasOwnProperty ("__kwargtrans__"))) {;
								var _max = null;
							};
							if (typeof power == 'undefined' || (power != null && power .hasOwnProperty ("__kwargtrans__"))) {;
								var power = false;
							};
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'py_name': var py_name = __allkwargs0__ [__attrib0__]; break;
											case 'purchase': var purchase = __allkwargs0__ [__attrib0__]; break;
											case 'upkeep': var upkeep = __allkwargs0__ [__attrib0__]; break;
											case 'production': var production = __allkwargs0__ [__attrib0__]; break;
											case 'usage': var usage = __allkwargs0__ [__attrib0__]; break;
											case 'pollution': var pollution = __allkwargs0__ [__attrib0__]; break;
											case 'commerce': var commerce = __allkwargs0__ [__attrib0__]; break;
											case 'capacity': var capacity = __allkwargs0__ [__attrib0__]; break;
											case '_max': var _max = __allkwargs0__ [__attrib0__]; break;
											case 'power': var power = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							self.py_name = py_name;
							self.purchase = purchase;
							self.upkeep = upkeep;
							self.production = (production !== null ? production : dict ({}));
							self.usage = (usage !== null ? usage : dict ({}));
							self.pollution = pollution;
							self.commerce = commerce;
							self.capacity = (capacity !== null ? capacity : dict ({}));
							self.max = _max;
							self.power = power;
						});}
					});
					var Military = __class__ ('Military', [object], {
						SOLDIERS: 1,
						TANKS: 2,
						AIRCRAFT: 3,
						SHIPS: 4,
						SPIES: 5,
						MISSILES: 6,
						NUKES: 7
					});
					var MilitaryStats = __class__ ('MilitaryStats', [object], {
						get __init__ () {return __get__ (this, function (self, purchase, upkeep_peace, upkeep_war, battle) {
							if (typeof upkeep_war == 'undefined' || (upkeep_war != null && upkeep_war .hasOwnProperty ("__kwargtrans__"))) {;
								var upkeep_war = null;
							};
							if (typeof battle == 'undefined' || (battle != null && battle .hasOwnProperty ("__kwargtrans__"))) {;
								var battle = null;
							};
							if (arguments.length) {
								var __ilastarg0__ = arguments.length - 1;
								if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
									var __allkwargs0__ = arguments [__ilastarg0__--];
									for (var __attrib0__ in __allkwargs0__) {
										switch (__attrib0__) {
											case 'self': var self = __allkwargs0__ [__attrib0__]; break;
											case 'purchase': var purchase = __allkwargs0__ [__attrib0__]; break;
											case 'upkeep_peace': var upkeep_peace = __allkwargs0__ [__attrib0__]; break;
											case 'upkeep_war': var upkeep_war = __allkwargs0__ [__attrib0__]; break;
											case 'battle': var battle = __allkwargs0__ [__attrib0__]; break;
										}
									}
								}
							}
							else {
							}
							self.purchase = purchase;
							self.upkeep_peace = upkeep_peace;
							self.upkeep_war = (upkeep_war !== null ? upkeep_war : upkeep_peace);
							self.battle = battle;
						});}
					});
					var Project = __class__ ('Project', [object], {
						IRON_WORKS: 0,
						BAUXITE_WORKS: 1,
						ARMS_STOCK_PILE: 2,
						EMERGENCY_GAS_RESERVE: 3,
						MASS_IRRIGATION: 4,
						INTERNATIONAL_TRADE_CENTER: 5,
						MISSILE_LAUNCH_PAD: 6,
						NUCLEAR_RESEARCH_FACILITY: 7,
						IRON_DOME: 8,
						VITAL_DEFENSE_SYSTEM: 9,
						INTELLIGENCE_AGENCY: 10,
						URANIUM_ENRICHMENT_PROGRAM: 11,
						PROPAGANDA_BUREAU: 12,
						CENTER_CIVIL_ENGINEERING: 13
					});
					var Resource = __class__ ('Resource', [object], {
						MONEY: 0,
						FOOD: 1,
						COAL: 2,
						OIL: 3,
						URANIUM: 4,
						IRON: 5,
						BAUXITE: 6,
						LEAD: 7,
						GASOLINE: 8,
						STEEL: 9,
						ALUMINUM: 10,
						MUNITIONS: 11
					});
					var Season = __class__ ('Season', [object], {
						SUMMER: 0,
						FALL: 1,
						WINTER: 2,
						SPRING: 4
					});
					var SocialPolicy = __class__ ('SocialPolicy', [object], {
						ANARCHIST: 0,
						LIBERTARIAN: 1,
						LIBERAL: 2,
						MODERATE: 3,
						CONSERVATIVE: 4,
						AUTHORITARIAN: 5,
						FASCIST: 6
					});
					var WarPolicy = __class__ ('WarPolicy', [object], {
						ATTRITION: 0,
						TURTLE: 1,
						BLITZKRIEG: 2,
						FORTRESS: 3,
						MONEYBAGS: 4,
						PIRATE: 5,
						TACTICIAN: 6,
						GUARDIAN: 7,
						COVERT: 8,
						ARCANE: 9
					});
					var im = Improvement;
					var mil = Military;
					var pr = Project;
					var res = Resource;
					var CONTINENT_RESOURCES = dict ([[Continent.NORTH_AMERICA, tuple ([im.COAL_MINE, im.IRON_MINE, im.URANIUM_MINE])], [Continent.SOUTH_AMERICA, tuple ([im.OIL_POWER, im.BAUXITE_MINE, im.LEAD_MINE])], [Continent.EUROPE, tuple ([im.COAL_MINE, im.IRON_MINE, im.LEAD_MINE])], [Continent.AFRICA, tuple ([im.OIL_POWER, im.BAUXITE_MINE, im.URANIUM_MINE])], [Continent.ASIA, tuple ([im.OIL_POWER, im.IRON_MINE, im.URANIUM_MINE])], [Continent.AUSTRALIA, tuple ([im.COAL_MINE, im.BAUXITE_MINE, im.LEAD_MINE])]]);
					var CONTINENTS = tuple ([Continent.NORTH_AMERICA, Continent.SOUTH_AMERICA, Continent.EUROPE, Continent.AFRICA, Continent.ASIA, Continent.AUSTRALIA]);
					var ECONOMIC_POLICIES = tuple ([EconomicPolicy.EXTREMELY_LEFT_WING, EconomicPolicy.FAR_LEFT_WING, EconomicPolicy.LEFT_WING, EconomicPolicy.MODERATE, EconomicPolicy.RIGHT_WING, EconomicPolicy.FAR_RIGHT_WING, EconomicPolicy.EXTREMELY_RIGHT_WING]);
					var MILITARY = dict ([[mil.SOLDIERS, MilitaryStats (__kwargtrans__ ({purchase: dict ([[res.MONEY, 2.0]]), upkeep_peace: dict ([[res.MONEY, 1.25], [res.FOOD, 1 / 750]]), upkeep_war: dict ([[res.MONEY, 1.88], [res.FOOD, 1 / 500]]), battle: dict ([[res.MUNITIONS, 1 / 5000]])}))], [mil.TANKS, MilitaryStats (__kwargtrans__ ({purchase: dict ([[res.MONEY, 60.0], [res.STEEL, 1.0]]), upkeep_peace: dict ([[res.MONEY, 50.0]]), upkeep_war: dict ([[res.MONEY, 70.0]]), battle: dict ([[res.MUNITIONS, 1 / 100], [res.GASOLINE, 1 / 100]])}))], [mil.AIRCRAFT, MilitaryStats (__kwargtrans__ ({purchase: dict ([[res.MONEY, 4000.0], [res.ALUMINUM, 3.0]]), upkeep_peace: dict ([[res.MONEY, 500.0]]), upkeep_war: dict ([[res.MONEY, 750.0]]), battle: dict ([[res.MUNITIONS, 1 / 4], [res.GASOLINE, 1 / 4]])}))], [mil.SHIPS, MilitaryStats (__kwargtrans__ ({purchase: dict ([[res.MONEY, 50000.0], [res.STEEL, 25.0]]), upkeep_peace: dict ([[res.MONEY, 3750.0]]), upkeep_war: dict ([[res.MONEY, 5625.0]]), battle: dict ([[res.MUNITIONS, 3], [res.GASOLINE, 2]])}))], [mil.SPIES, MilitaryStats (__kwargtrans__ ({purchase: dict ([[res.MONEY, 50000.0]]), upkeep_peace: dict ([[res.MONEY, 2400.0]])}))], [mil.MISSILES, MilitaryStats (__kwargtrans__ ({purchase: dict ([[res.MONEY, 150000.0], [res.ALUMINUM, 100.0], [res.MUNITIONS, 75.0], [res.GASOLINE, 75.0]]), upkeep_peace: dict ([[res.MONEY, 21000.0]]), upkeep_war: dict ([[res.MONEY, 31500.0]])}))], [mil.NUKES, MilitaryStats (__kwargtrans__ ({purchase: dict ([[res.MONEY, 1750000.0], [res.ALUMINUM, 750.0], [res.MUNITIONS, 500.0], [res.URANIUM, 250.0]]), upkeep_peace: dict ([[res.MONEY, 35000.0]]), upkeep_war: dict ([[res.MONEY, 52500.0]])}))]]);
					var IMPROVEMENTS = dict ([[im.COAL_POWER, ImprovementStats (__kwargtrans__ ({py_name: 'Coal Power Plant', purchase: dict ([[res.MONEY, 5000.0]]), upkeep: 1200.0, pollution: 8, power: false}))], [im.OIL_POWER, ImprovementStats (__kwargtrans__ ({py_name: 'Oil Power Plant', purchase: dict ([[res.MONEY, 5000.0]]), upkeep: 1800.0, pollution: 6, power: false}))], [im.NUCLEAR_POWER, ImprovementStats (__kwargtrans__ ({py_name: 'Nuclear Power Plant', purchase: dict ([[res.MONEY, 500000.0], [res.STEEL, 100.0]]), upkeep: 10500.0, power: false}))], [im.WIND_POWER, ImprovementStats (__kwargtrans__ ({py_name: 'Wind Power Plant', purchase: dict ([[res.MONEY, 30000.0], [res.ALUMINUM, 25.0]]), upkeep: 500.0, power: false}))], [im.COAL_MINE, ImprovementStats (__kwargtrans__ ({py_name: 'Coal Mine', purchase: dict ([[res.MONEY, 1000.0]]), upkeep: 400.0, production: dict ([[res.COAL, 3.0]]), pollution: 12, _max: 12, power: false}))], [im.OIL_WELL, ImprovementStats (__kwargtrans__ ({py_name: 'Oil Well', purchase: dict ([[res.MONEY, 1500.0]]), upkeep: 600.0, production: dict ([[res.OIL, 3.0]]), pollution: 12, _max: 12, power: false}))], [im.IRON_MINE, ImprovementStats (__kwargtrans__ ({py_name: 'Iron Mine', purchase: dict ([[res.MONEY, 9500.0]]), upkeep: 1600.0, production: dict ([[res.IRON, 3.0]]), pollution: 12, _max: 6, power: false}))], [im.BAUXITE_MINE, ImprovementStats (__kwargtrans__ ({py_name: 'Bauxite Mine', purchase: dict ([[res.MONEY, 9500.0]]), upkeep: 1600.0, production: dict ([[res.BAUXITE, 3.0]]), pollution: 12, _max: 6, power: false}))], [im.LEAD_MINE, ImprovementStats (__kwargtrans__ ({py_name: 'Lead Mine', purchase: dict ([[res.MONEY, 7500.0]]), upkeep: 1500.0, production: dict ([[res.LEAD, 3.0]]), pollution: 12, _max: 10, power: false}))], [im.URANIUM_MINE, ImprovementStats (__kwargtrans__ ({py_name: 'Uranium Mine', purchase: dict ([[res.MONEY, 25000.0]]), upkeep: 5000.0, production: dict ([[res.URANIUM, 3.0]]), pollution: 20, _max: 3, power: false}))], [im.FARM, ImprovementStats (__kwargtrans__ ({py_name: 'Farm', purchase: dict ([[res.MONEY, 1000.0]]), upkeep: 300.0, production: dict ([[res.FOOD, 12.0 / 500.0]]), pollution: 2, _max: 20, power: false}))], [im.GASOLINE_REFINERY, ImprovementStats (__kwargtrans__ ({py_name: 'Oil Refinery', purchase: dict ([[res.MONEY, 45000.0]]), upkeep: 4000.0, production: dict ([[res.GASOLINE, 6.0]]), usage: dict ([[res.OIL, 3.0]]), pollution: 32, _max: 5, power: true}))], [im.STEEL_MILL, ImprovementStats (__kwargtrans__ ({py_name: 'Steel Mill', purchase: dict ([[res.MONEY, 45000.0]]), upkeep: 4000.0, production: dict ([[res.STEEL, 9.0]]), usage: dict ([[res.IRON, 3.0], [res.COAL, 3.0]]), pollution: 40, _max: 5, power: true}))], [im.ALUMINUM_REFINERY, ImprovementStats (__kwargtrans__ ({py_name: 'Aluminum Refinery', purchase: dict ([[res.MONEY, 30000.0]]), upkeep: 2500.0, production: dict ([[res.ALUMINUM, 9.0]]), usage: dict ([[res.BAUXITE, 3.0]]), pollution: 40, _max: 5, power: true}))], [im.MUNITIONS_FACTORY, ImprovementStats (__kwargtrans__ ({py_name: 'Munitions Factory', purchase: dict ([[res.MONEY, 35000.0]]), upkeep: 3500.0, production: dict ([[res.MUNITIONS, 18.0]]), usage: dict ([[res.LEAD, 6.0]]), pollution: 32, _max: 5, power: true}))], [im.POLICE_STATION, ImprovementStats (__kwargtrans__ ({py_name: 'Police Station', purchase: dict ([[res.MONEY, 75000.0], [res.STEEL, 20.0]]), upkeep: 750.0, pollution: 1, _max: 5, power: true}))], [im.HOSPITAL, ImprovementStats (__kwargtrans__ ({py_name: 'Hospital', purchase: dict ([[res.MONEY, 100000.0], [res.ALUMINUM, 25.0]]), upkeep: 1000.0, pollution: 4, _max: 5, power: true}))], [im.RECYCLING_CENTER, ImprovementStats (__kwargtrans__ ({py_name: 'Recycling Center', purchase: dict ([[res.MONEY, 125000.0]]), upkeep: 2500.0, pollution: -(70), _max: 3, power: true}))], [im.SUBWAY, ImprovementStats (__kwargtrans__ ({py_name: 'Subway', purchase: dict ([[res.MONEY, 250000.0], [res.ALUMINUM, 25], [res.STEEL, 50]]), upkeep: 3250.0, pollution: -(45), commerce: 8, _max: 1, power: true}))], [im.SUPERMARKET, ImprovementStats (__kwargtrans__ ({py_name: 'Supermarket', purchase: dict ([[res.MONEY, 5000.0]]), upkeep: 600.0, commerce: 3, _max: 6, power: true}))], [im.BANK, ImprovementStats (__kwargtrans__ ({py_name: 'Bank', purchase: dict ([[res.MONEY, 15000.0], [res.ALUMINUM, 10], [res.STEEL, 5]]), upkeep: 1800.0, commerce: 5, _max: 5, power: true}))], [im.MALL, ImprovementStats (__kwargtrans__ ({py_name: 'Shopping Mall', purchase: dict ([[res.MONEY, 45000.0], [res.ALUMINUM, 25], [res.STEEL, 20]]), upkeep: 5400.0, pollution: 2, commerce: 9, _max: 4, power: true}))], [im.STADIUM, ImprovementStats (__kwargtrans__ ({py_name: 'Stadium', purchase: dict ([[res.MONEY, 100000.0], [res.ALUMINUM, 50], [res.STEEL, 40]]), upkeep: 12150.0, pollution: 5, commerce: 12, _max: 3, power: true}))], [im.BARRACKS, ImprovementStats (__kwargtrans__ ({py_name: 'Barracks', purchase: dict ([[res.MONEY, 3000.0]]), _max: 5, capacity: dict ([[mil.SOLDIERS, 3000]]), power: true}))], [im.FACTORY, ImprovementStats (__kwargtrans__ ({py_name: 'Factory', purchase: dict ([[res.MONEY, 0.0]]), _max: 5, capacity: dict ([[mil.TANKS, 250]]), power: true}))], [im.HANGAR, ImprovementStats (__kwargtrans__ ({py_name: 'Hangar', purchase: dict ([[res.MONEY, 0.0]]), _max: 5, capacity: dict ([[mil.AIRCRAFT, 18]]), power: true}))], [im.DRYDOCK, ImprovementStats (__kwargtrans__ ({py_name: 'Drydock', purchase: dict ([[res.MONEY, 0.0]]), _max: 3, capacity: dict ([[mil.SHIPS, 5]]), power: true}))]]);
					var PROJECT_MODS = dict ([[Project.ARMS_STOCK_PILE, 1.34], [Project.BAUXITE_WORKS, 1.36], [Project.EMERGENCY_GAS_RESERVE, 2.0], [Project.IRON_WORKS, 1.36], [Project.MASS_IRRIGATION, 500 / 400], [Project.URANIUM_ENRICHMENT_PROGRAM, 2.0]]);
					var RES_PROD_MODS = dict ([[res.MUNITIONS, Project.ARMS_STOCK_PILE], [res.ALUMINUM, Project.BAUXITE_WORKS], [res.GASOLINE, Project.EMERGENCY_GAS_RESERVE], [res.STEEL, Project.IRON_WORKS], [res.FOOD, Project.MASS_IRRIGATION], [res.URANIUM, Project.URANIUM_ENRICHMENT_PROGRAM]]);
					var RES_USAGE_MODS = dict ([[res.LEAD, Project.ARMS_STOCK_PILE], [res.BAUXITE, Project.BAUXITE_WORKS], [res.OIL, Project.EMERGENCY_GAS_RESERVE], [res.COAL, Project.IRON_WORKS], [res.IRON, Project.IRON_WORKS]]);
					var RESOURCES = tuple ([res.FOOD, res.COAL, res.OIL, res.URANIUM, res.IRON, res.BAUXITE, res.LEAD, res.GASOLINE, res.STEEL, res.ALUMINUM, res.MUNITIONS]);
					var SOCIAL_POLICIES = tuple ([SocialPolicy.ANARCHIST, SocialPolicy.LIBERTARIAN, SocialPolicy.LIBERAL, SocialPolicy.MODERATE, SocialPolicy.CONSERVATIVE, SocialPolicy.AUTHORITARIAN, SocialPolicy.FASCIST]);
					var TAX_RATES = dict ([[EconomicPolicy.EXTREMELY_LEFT_WING, 46.63], [EconomicPolicy.FAR_LEFT_WING, 44.38], [EconomicPolicy.LEFT_WING, 36.5], [EconomicPolicy.MODERATE, 30.88], [EconomicPolicy.RIGHT_WING, 16.25], [EconomicPolicy.FAR_RIGHT_WING, 12.88], [EconomicPolicy.EXTREMELY_RIGHT_WING, 5.0]]);
					__pragma__ ('<all>')
						__all__.AlliancePosition = AlliancePosition;
						__all__.CONTINENTS = CONTINENTS;
						__all__.CONTINENT_RESOURCES = CONTINENT_RESOURCES;
						__all__.Color = Color;
						__all__.Continent = Continent;
						__all__.DomesticPolicy = DomesticPolicy;
						__all__.ECONOMIC_POLICIES = ECONOMIC_POLICIES;
						__all__.EconomicPolicy = EconomicPolicy;
						__all__.IMPROVEMENTS = IMPROVEMENTS;
						__all__.Improvement = Improvement;
						__all__.ImprovementStats = ImprovementStats;
						__all__.MILITARY = MILITARY;
						__all__.Military = Military;
						__all__.MilitaryStats = MilitaryStats;
						__all__.PROJECT_MODS = PROJECT_MODS;
						__all__.Project = Project;
						__all__.RESOURCES = RESOURCES;
						__all__.RES_PROD_MODS = RES_PROD_MODS;
						__all__.RES_USAGE_MODS = RES_USAGE_MODS;
						__all__.Resource = Resource;
						__all__.SOCIAL_POLICIES = SOCIAL_POLICIES;
						__all__.Season = Season;
						__all__.SocialPolicy = SocialPolicy;
						__all__.TAX_RATES = TAX_RATES;
						__all__.WarPolicy = WarPolicy;
						__all__.im = im;
						__all__.mil = mil;
						__all__.pr = pr;
						__all__.res = res;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'ferret.pnw.formulas', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var alliance = __init__ (__world__.ferret.pnw.formulas.alliance);
					var city = __init__ (__world__.ferret.pnw.formulas.city);
					var general = __init__ (__world__.ferret.pnw.formulas.general);
					var nation = __init__ (__world__.ferret.pnw.formulas.nation);
					__pragma__ ('<use>' +
						'ferret.pnw.formulas.alliance' +
						'ferret.pnw.formulas.city' +
						'ferret.pnw.formulas.general' +
						'ferret.pnw.formulas.nation' +
					'</use>')
					__pragma__ ('<all>')
						__all__.alliance = alliance;
						__all__.city = city;
						__all__.general = general;
						__all__.nation = nation;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'ferret.pnw.formulas.alliance', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var sqrt = __init__ (__world__.math).sqrt;
					var RESOURCES = __init__ (__world__.ferret.pnw.constants).RESOURCES;
					var nation = __init__ (__world__.ferret.pnw.formulas.nation);
					var rev_gross = function (alliance) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'alliance': var alliance = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return sum (function () {
							var __accu0__ = [];
							for (var member of alliance.members) {
								__accu0__.append (nation.rev_gross (member));
							}
							return py_iter (__accu0__);
						} ());
					};
					var rev_expenses = function (alliance) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'alliance': var alliance = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return sum (function () {
							var __accu0__ = [];
							for (var member of alliance.members) {
								__accu0__.append (nation.rev_expenses (member));
							}
							return py_iter (__accu0__);
						} ());
					};
					var res_prod = function (alliance) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'alliance': var alliance = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var prod = function () {
							var __accu0__ = [];
							for (var r of RESOURCES) {
								__accu0__.append (list ([r, 0.0]));
							}
							return dict (__accu0__);
						} ();
						for (var member of alliance.members) {
							for (var [r, p] of nation.res_prod (member).py_items ()) {
								prod [r] += p;
							}
						}
						return prod;
					};
					var res_usage = function (alliance) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'alliance': var alliance = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var prod = function () {
							var __accu0__ = [];
							for (var r of RESOURCES) {
								__accu0__.append (list ([r, 0.0]));
							}
							return dict (__accu0__);
						} ();
						for (var member of alliance.members) {
							for (var [r, p] of nation.res_usage (member).py_items ()) {
								prod [r] += p;
							}
						}
						return prod;
					};
					var treasure_bonus = function (alliance) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'alliance': var alliance = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (alliance) {
							return round (sqrt (alliance.treasures * 4), 2);
						}
						return 0.0;
					};
					__pragma__ ('<use>' +
						'ferret.pnw.constants' +
						'ferret.pnw.formulas.nation' +
						'math' +
					'</use>')
					__pragma__ ('<all>')
						__all__.RESOURCES = RESOURCES;
						__all__.nation = nation;
						__all__.res_prod = res_prod;
						__all__.res_usage = res_usage;
						__all__.rev_expenses = rev_expenses;
						__all__.rev_gross = rev_gross;
						__all__.sqrt = sqrt;
						__all__.treasure_bonus = treasure_bonus;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'ferret.pnw.formulas.city', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var AlliancePosition = __init__ (__world__.ferret.pnw.constants).AlliancePosition;
					var CONTINENTS = __init__ (__world__.ferret.pnw.constants).CONTINENTS;
					var CONTINENT_RESOURCES = __init__ (__world__.ferret.pnw.constants).CONTINENT_RESOURCES;
					var Color = __init__ (__world__.ferret.pnw.constants).Color;
					var Continent = __init__ (__world__.ferret.pnw.constants).Continent;
					var DomesticPolicy = __init__ (__world__.ferret.pnw.constants).DomesticPolicy;
					var ECONOMIC_POLICIES = __init__ (__world__.ferret.pnw.constants).ECONOMIC_POLICIES;
					var EconomicPolicy = __init__ (__world__.ferret.pnw.constants).EconomicPolicy;
					var IMPROVEMENTS = __init__ (__world__.ferret.pnw.constants).IMPROVEMENTS;
					var Improvement = __init__ (__world__.ferret.pnw.constants).Improvement;
					var ImprovementStats = __init__ (__world__.ferret.pnw.constants).ImprovementStats;
					var MILITARY = __init__ (__world__.ferret.pnw.constants).MILITARY;
					var Military = __init__ (__world__.ferret.pnw.constants).Military;
					var MilitaryStats = __init__ (__world__.ferret.pnw.constants).MilitaryStats;
					var PROJECT_MODS = __init__ (__world__.ferret.pnw.constants).PROJECT_MODS;
					var Project = __init__ (__world__.ferret.pnw.constants).Project;
					var RESOURCES = __init__ (__world__.ferret.pnw.constants).RESOURCES;
					var RES_PROD_MODS = __init__ (__world__.ferret.pnw.constants).RES_PROD_MODS;
					var RES_USAGE_MODS = __init__ (__world__.ferret.pnw.constants).RES_USAGE_MODS;
					var Resource = __init__ (__world__.ferret.pnw.constants).Resource;
					var SOCIAL_POLICIES = __init__ (__world__.ferret.pnw.constants).SOCIAL_POLICIES;
					var Season = __init__ (__world__.ferret.pnw.constants).Season;
					var SocialPolicy = __init__ (__world__.ferret.pnw.constants).SocialPolicy;
					var TAX_RATES = __init__ (__world__.ferret.pnw.constants).TAX_RATES;
					var WarPolicy = __init__ (__world__.ferret.pnw.constants).WarPolicy;
					var im = __init__ (__world__.ferret.pnw.constants).im;
					var mil = __init__ (__world__.ferret.pnw.constants).mil;
					var pr = __init__ (__world__.ferret.pnw.constants).pr;
					var res = __init__ (__world__.ferret.pnw.constants).res;
					var average_income = function (city, nation, minimum_wage) {
						if (typeof nation == 'undefined' || (nation != null && nation .hasOwnProperty ("__kwargtrans__"))) {;
							var nation = null;
						};
						if (typeof minimum_wage == 'undefined' || (minimum_wage != null && minimum_wage .hasOwnProperty ("__kwargtrans__"))) {;
							var minimum_wage = 1.0;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
										case 'minimum_wage': var minimum_wage = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (nation === null) {
							var nation = city.nation;
						}
						if (minimum_wage === null) {
							var minimum_wage = nation.minimum_wage;
						}
						return (commerce (city, nation) / 50 + 1) * minimum_wage;
					};
					var base_population = function (city) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return city.infrastructure * 100;
					};
					var commerce = function (city, nation) {
						if (typeof nation == 'undefined' || (nation != null && nation .hasOwnProperty ("__kwargtrans__"))) {;
							var nation = null;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (!(powered (city))) {
							return 0;
						}
						if (nation === null) {
							var nation = city.nation;
						}
						var improvements = dict (city.improvements);
						return min (sum (function () {
							var __accu0__ = [];
							for (var [i, n] of improvements.py_items ()) {
								__accu0__.append (n * IMPROVEMENTS [i].commerce);
							}
							return py_iter (__accu0__);
						} ()), (nation && nation.projects [pr.INTERNATIONAL_TRADE_CENTER] ? 115 : 100));
					};
					var crime = function (city, nation) {
						if (typeof nation == 'undefined' || (nation != null && nation .hasOwnProperty ("__kwargtrans__"))) {;
							var nation = null;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (nation === null) {
							var nation = city.nation;
						}
						var _crime = (Math.pow (103 - commerce (city, nation), 2) + base_population (city)) / 111111;
						if (powered (city)) {
							_crime -= city.improvements [im.POLICE_STATION] * 2.5;
						}
						return min (100, max (0, _crime));
					};
					var disease = function (city) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var base_pop = base_population (city);
						var _disease = (Math.pow (base_pop / city.land, 2) * 0.01 - 25) / 100;
						_disease += base_pop / 100000;
						_disease += pollution (city) * 0.05;
						if (powered (city)) {
							_disease -= city.improvements [im.HOSPITAL] * 2.5;
						}
						return min (100, max (0, _disease));
					};
					var pollution = function (city) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var _powered = powered (city);
						var improvements = dict (city.improvements);
						var p = sum (function () {
							var __accu0__ = [];
							for (var [i, n] of improvements.py_items ()) {
								__accu0__.append ((!(IMPROVEMENTS [i].power) || IMPROVEMENTS [i].power && _powered ? IMPROVEMENTS [i].pollution * n : 0));
							}
							return __accu0__;
						} ());
						return max (0, p);
					};
					var population = function (city, nation) {
						if (typeof nation == 'undefined' || (nation != null && nation .hasOwnProperty ("__kwargtrans__"))) {;
							var nation = null;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (nation === null) {
							var nation = city.nation;
						}
						var py_pop = base_population (city);
						py_pop -= max (0, (crime (city, nation) / 10) * base_population (city) - 25);
						py_pop -= max (0, disease (city) * city.infrastructure);
						py_pop *= 1 + city.age / 3000;
						return max (py_pop, 10);
					};
					var powered = function (city) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var infra = ((city.improvements [im.COAL_POWER] * 500 + city.improvements [im.OIL_POWER] * 500) + city.improvements [im.NUCLEAR_POWER] * 2000) + city.improvements [im.WIND_POWER] * 250;
						return infra >= city.infrastructure;
					};
					__pragma__ ('<use>' +
						'ferret.pnw.constants' +
					'</use>')
					__pragma__ ('<all>')
						__all__.AlliancePosition = AlliancePosition;
						__all__.CONTINENTS = CONTINENTS;
						__all__.CONTINENT_RESOURCES = CONTINENT_RESOURCES;
						__all__.Color = Color;
						__all__.Continent = Continent;
						__all__.DomesticPolicy = DomesticPolicy;
						__all__.ECONOMIC_POLICIES = ECONOMIC_POLICIES;
						__all__.EconomicPolicy = EconomicPolicy;
						__all__.IMPROVEMENTS = IMPROVEMENTS;
						__all__.Improvement = Improvement;
						__all__.ImprovementStats = ImprovementStats;
						__all__.MILITARY = MILITARY;
						__all__.Military = Military;
						__all__.MilitaryStats = MilitaryStats;
						__all__.PROJECT_MODS = PROJECT_MODS;
						__all__.Project = Project;
						__all__.RESOURCES = RESOURCES;
						__all__.RES_PROD_MODS = RES_PROD_MODS;
						__all__.RES_USAGE_MODS = RES_USAGE_MODS;
						__all__.Resource = Resource;
						__all__.SOCIAL_POLICIES = SOCIAL_POLICIES;
						__all__.Season = Season;
						__all__.SocialPolicy = SocialPolicy;
						__all__.TAX_RATES = TAX_RATES;
						__all__.WarPolicy = WarPolicy;
						__all__.average_income = average_income;
						__all__.base_population = base_population;
						__all__.commerce = commerce;
						__all__.crime = crime;
						__all__.disease = disease;
						__all__.im = im;
						__all__.mil = mil;
						__all__.pollution = pollution;
						__all__.population = population;
						__all__.powered = powered;
						__all__.pr = pr;
						__all__.res = res;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'ferret.pnw.formulas.general', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var res_net = function (prod, usage) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'prod': var prod = __allkwargs0__ [__attrib0__]; break;
										case 'usage': var usage = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var net = function () {
							var __accu0__ = [];
							for (var [res, p] of prod.py_items ()) {
								__accu0__.append (list ([res, p]));
							}
							return dict (__accu0__);
						} ();
						for (var [res, u] of usage.py_items ()) {
							if (__in__ (res, net)) {
								net [res] = net [res] - u;
							}
							else {
								net [res] = -(u);
							}
						}
						return net;
					};
					__pragma__ ('<all>')
						__all__.res_net = res_net;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'ferret.pnw.formulas.nation', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var ceil = __init__ (__world__.math).ceil;
					var AlliancePosition = __init__ (__world__.ferret.pnw.constants).AlliancePosition;
					var CONTINENTS = __init__ (__world__.ferret.pnw.constants).CONTINENTS;
					var CONTINENT_RESOURCES = __init__ (__world__.ferret.pnw.constants).CONTINENT_RESOURCES;
					var Color = __init__ (__world__.ferret.pnw.constants).Color;
					var Continent = __init__ (__world__.ferret.pnw.constants).Continent;
					var DomesticPolicy = __init__ (__world__.ferret.pnw.constants).DomesticPolicy;
					var ECONOMIC_POLICIES = __init__ (__world__.ferret.pnw.constants).ECONOMIC_POLICIES;
					var EconomicPolicy = __init__ (__world__.ferret.pnw.constants).EconomicPolicy;
					var IMPROVEMENTS = __init__ (__world__.ferret.pnw.constants).IMPROVEMENTS;
					var Improvement = __init__ (__world__.ferret.pnw.constants).Improvement;
					var ImprovementStats = __init__ (__world__.ferret.pnw.constants).ImprovementStats;
					var MILITARY = __init__ (__world__.ferret.pnw.constants).MILITARY;
					var Military = __init__ (__world__.ferret.pnw.constants).Military;
					var MilitaryStats = __init__ (__world__.ferret.pnw.constants).MilitaryStats;
					var PROJECT_MODS = __init__ (__world__.ferret.pnw.constants).PROJECT_MODS;
					var Project = __init__ (__world__.ferret.pnw.constants).Project;
					var RESOURCES = __init__ (__world__.ferret.pnw.constants).RESOURCES;
					var RES_PROD_MODS = __init__ (__world__.ferret.pnw.constants).RES_PROD_MODS;
					var RES_USAGE_MODS = __init__ (__world__.ferret.pnw.constants).RES_USAGE_MODS;
					var Resource = __init__ (__world__.ferret.pnw.constants).Resource;
					var SOCIAL_POLICIES = __init__ (__world__.ferret.pnw.constants).SOCIAL_POLICIES;
					var Season = __init__ (__world__.ferret.pnw.constants).Season;
					var SocialPolicy = __init__ (__world__.ferret.pnw.constants).SocialPolicy;
					var TAX_RATES = __init__ (__world__.ferret.pnw.constants).TAX_RATES;
					var WarPolicy = __init__ (__world__.ferret.pnw.constants).WarPolicy;
					var im = __init__ (__world__.ferret.pnw.constants).im;
					var mil = __init__ (__world__.ferret.pnw.constants).mil;
					var pr = __init__ (__world__.ferret.pnw.constants).pr;
					var res = __init__ (__world__.ferret.pnw.constants).res;
					var _city = __init__ (__world__.ferret.pnw.formulas.city);
					var average_income = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var p = function () {
							var __accu0__ = [];
							for (var city of nation.cities) {
								__accu0__.append (_city.population (city, nation));
							}
							return __accu0__;
						} ();
						return sum (function () {
							var __accu0__ = [];
							for (var [i, city] of enumerate (nation.cities)) {
								__accu0__.append (p [i] * _city.average_income (city, nation, minimum_wage (nation)));
							}
							return py_iter (__accu0__);
						} ()) / sum (p);
					};
					var color_bonus = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (nation.color == Color.BEIGE) {
							return 5.0;
						}
						else if (nation.color == Color.GRAY) {
							return 0.0;
						}
						else if (nation.alliance && nation.alliance.color != nation.color) {
							return 0.0;
						}
						return 3.0;
					};
					var cumulative_bonus = function (nation, treasure_bonus) {
						if (typeof treasure_bonus == 'undefined' || (treasure_bonus != null && treasure_bonus .hasOwnProperty ("__kwargtrans__"))) {;
							var treasure_bonus = null;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
										case 'treasure_bonus': var treasure_bonus = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (treasure_bonus === null && nation.alliance) {
							var treasure_bonus = nation.alliance.treasure_bonus;
						}
						return treasure_bonus + color_bonus (nation);
					};
					var full_name = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return (nation.name_prefix + ' ') + nation.py_name;
					};
					var infrastructure = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return sum (function () {
							var __accu0__ = [];
							for (var city of nation.cities) {
								__accu0__.append (city.infrastructure);
							}
							return py_iter (__accu0__);
						} ());
					};
					var land = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return sum (function () {
							var __accu0__ = [];
							for (var city of nation.cities) {
								__accu0__.append (city.land);
							}
							return py_iter (__accu0__);
						} ());
					};
					var minimum_wage = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return 725 / (tax_rate (nation) * 10);
					};
					var population = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return sum (function () {
							var __accu0__ = [];
							for (var city of nation.cities) {
								__accu0__.append (_city.population (city, nation));
							}
							return py_iter (__accu0__);
						} ());
					};
					var res_prod = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var prod = function () {
							var __accu0__ = [];
							for (var r of RESOURCES) {
								__accu0__.append (list ([r, 0.0]));
							}
							return dict (__accu0__);
						} ();
						for (var city of nation.cities) {
							for (var [i, n] of city.improvements.py_items ()) {
								for (var [resource, p] of IMPROVEMENTS [i].production.py_items ()) {
									if (resource == res.FOOD) {
										prod [resource] += (p * n) * city.land;
									}
									else {
										prod [resource] += p * n;
									}
								}
							}
						}
						var season = Season.SPRING;
						if (season == Season.SUMMER) {
							prod [res.FOOD] *= 1.2;
						}
						else if (season == Season.WINTER) {
							prod [res.FOOD] *= 0.8;
						}
						for (var [resource, project] of RES_PROD_MODS.py_items ()) {
							if (__in__ (resource, prod) && nation.projects [project]) {
								prod [resource] *= PROJECT_MODS [project];
							}
						}
						return prod;
					};
					var res_usage = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var usage = function () {
							var __accu0__ = [];
							for (var r of RESOURCES) {
								__accu0__.append (list ([r, 0.0]));
							}
							return dict (__accu0__);
						} ();
						for (var city of nation.cities) {
							for (var [i, n] of city.improvements.py_items ()) {
								for (var [resource, u] of IMPROVEMENTS [i].usage.py_items ()) {
									usage [resource] += u * n;
								}
							}
						}
						usage [res.FOOD] += population (nation) / 1000;
						var war = false;
						usage [res.FOOD] += nation.soldiers * (war ? MILITARY [mil.SOLDIERS].upkeep_war : MILITARY [mil.SOLDIERS].upkeep_peace) [res.FOOD];
						for (var [resource, project] of RES_USAGE_MODS.py_items ()) {
							if (__in__ (resource, usage) && nation.projects [project]) {
								usage [resource] *= PROJECT_MODS [project];
							}
						}
						for (var city of nation.cities) {
							var powered = city.improvements [im.WIND_POWER] * 250;
							if (powered >= city.infrastructure) {
								continue;
							}
							var __left0__ = _calc_power_resource_usage (city, powered, im.NUCLEAR_POWER, 2000, 1000, 1.2);
							var powered = __left0__ [0];
							var uranium_usage = __left0__ [1];
							usage [res.URANIUM] += uranium_usage;
							if (powered >= city.infrastructure) {
								continue;
							}
							var __left0__ = _calc_power_resource_usage (city, powered, im.OIL_POWER, 500, 100, 1.2);
							var powered = __left0__ [0];
							var oil_usage = __left0__ [1];
							usage [res.OIL] += oil_usage;
							if (powered >= city.infrastructure) {
								continue;
							}
							var __left0__ = _calc_power_resource_usage (city, powered, im.COAL_POWER, 500, 100, 1.2);
							var powered = __left0__ [0];
							var coal_usage = __left0__ [1];
							usage [res.COAL] += coal_usage;
						}
						return usage;
					};
					var rev_gross = function (nation, treasure_bonus) {
						if (typeof treasure_bonus == 'undefined' || (treasure_bonus != null && treasure_bonus .hasOwnProperty ("__kwargtrans__"))) {;
							var treasure_bonus = null;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
										case 'treasure_bonus': var treasure_bonus = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return (((((average_income (nation) * population (nation)) * tax_rate (nation)) / 100) * (100 + cumulative_bonus (nation, treasure_bonus))) / 100) * (nation.domestic_policy == DomesticPolicy.OPEN_MARKETS ? 1.01 : 1.0);
					};
					var rev_expenses = function (nation, category) {
						if (typeof category == 'undefined' || (category != null && category .hasOwnProperty ("__kwargtrans__"))) {;
							var category = null;
						};
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
										case 'category': var category = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						if (category == 'power') {
							return _calc_improvement_upkeep (nation, tuple ([im.OIL_POWER, im.COAL_POWER, im.NUCLEAR_POWER, im.WIND_POWER]));
						}
						else if (category == 'resources') {
							return _calc_improvement_upkeep (nation, tuple ([im.COAL_MINE, im.OIL_WELL, im.IRON_MINE, im.BAUXITE_MINE, im.LEAD_MINE, im.URANIUM_MINE, im.FARM, im.GASOLINE_REFINERY, im.STEEL_MILL, im.ALUMINUM_REFINERY, im.MUNITIONS_FACTORY]));
						}
						else if (category == 'military') {
							return _calc_military_upkeep (nation);
						}
						else if (category == 'city') {
							return _calc_improvement_upkeep (nation, tuple ([im.POLICE_STATION, im.HOSPITAL, im.RECYCLING_CENTER, im.SUBWAY, im.SUPERMARKET, im.BANK, im.MALL, im.STADIUM]));
						}
						return ((rev_expenses (nation, 'power') + rev_expenses (nation, 'resources')) + rev_expenses (nation, 'military')) + rev_expenses (nation, 'city');
					};
					var tax_rate = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return TAX_RATES [nation.economic_policy];
					};
					var _calc_improvement_upkeep = function (nation, improvements) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
										case 'improvements': var improvements = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return sum (function () {
							var __accu0__ = [];
							for (var city of nation.cities) {
								for (var i of improvements) {
									__accu0__.append (city.improvements [i] * IMPROVEMENTS [i].upkeep);
								}
							}
							return py_iter (__accu0__);
						} ());
					};
					var _calc_military_upkeep = function (nation) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'nation': var nation = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var war = false;
						var units = dict ([[mil.SOLDIERS, nation.soldiers], [mil.TANKS, nation.tanks], [mil.AIRCRAFT, nation.aircraft], [mil.SHIPS, nation.ships], [mil.SPIES, nation.spies], [mil.MISSILES, nation.missiles], [mil.NUKES, nation.nukes]]);
						return sum (function () {
							var __accu0__ = [];
							for (var [i, n] of units.py_items ()) {
								__accu0__.append (n * (war ? MILITARY [i].upkeep_war : MILITARY [i].upkeep_peace) [res.MONEY]);
							}
							return py_iter (__accu0__);
						} ()) * (nation.domestic_policy == DomesticPolicy.IMPERIALISM ? 0.95 : 1.0);
					};
					var _calc_power_resource_usage = function (city, powered, improvement, infra_capacity, infra_per_level, usage_per_level) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'city': var city = __allkwargs0__ [__attrib0__]; break;
										case 'powered': var powered = __allkwargs0__ [__attrib0__]; break;
										case 'improvement': var improvement = __allkwargs0__ [__attrib0__]; break;
										case 'infra_capacity': var infra_capacity = __allkwargs0__ [__attrib0__]; break;
										case 'infra_per_level': var infra_per_level = __allkwargs0__ [__attrib0__]; break;
										case 'usage_per_level': var usage_per_level = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						var imp_powered = min (city.improvements [improvement] * infra_capacity, city.infrastructure - powered);
						return tuple ([powered + imp_powered, ceil (imp_powered / infra_per_level) * usage_per_level]);
					};
					__pragma__ ('<use>' +
						'ferret.pnw.constants' +
						'ferret.pnw.formulas.city' +
						'math' +
					'</use>')
					__pragma__ ('<all>')
						__all__.AlliancePosition = AlliancePosition;
						__all__.CONTINENTS = CONTINENTS;
						__all__.CONTINENT_RESOURCES = CONTINENT_RESOURCES;
						__all__.Color = Color;
						__all__.Continent = Continent;
						__all__.DomesticPolicy = DomesticPolicy;
						__all__.ECONOMIC_POLICIES = ECONOMIC_POLICIES;
						__all__.EconomicPolicy = EconomicPolicy;
						__all__.IMPROVEMENTS = IMPROVEMENTS;
						__all__.Improvement = Improvement;
						__all__.ImprovementStats = ImprovementStats;
						__all__.MILITARY = MILITARY;
						__all__.Military = Military;
						__all__.MilitaryStats = MilitaryStats;
						__all__.PROJECT_MODS = PROJECT_MODS;
						__all__.Project = Project;
						__all__.RESOURCES = RESOURCES;
						__all__.RES_PROD_MODS = RES_PROD_MODS;
						__all__.RES_USAGE_MODS = RES_USAGE_MODS;
						__all__.Resource = Resource;
						__all__.SOCIAL_POLICIES = SOCIAL_POLICIES;
						__all__.Season = Season;
						__all__.SocialPolicy = SocialPolicy;
						__all__.TAX_RATES = TAX_RATES;
						__all__.WarPolicy = WarPolicy;
						__all__._calc_improvement_upkeep = _calc_improvement_upkeep;
						__all__._calc_military_upkeep = _calc_military_upkeep;
						__all__._calc_power_resource_usage = _calc_power_resource_usage;
						__all__._city = _city;
						__all__.average_income = average_income;
						__all__.ceil = ceil;
						__all__.color_bonus = color_bonus;
						__all__.cumulative_bonus = cumulative_bonus;
						__all__.full_name = full_name;
						__all__.im = im;
						__all__.infrastructure = infrastructure;
						__all__.land = land;
						__all__.mil = mil;
						__all__.minimum_wage = minimum_wage;
						__all__.population = population;
						__all__.pr = pr;
						__all__.res = res;
						__all__.res_prod = res_prod;
						__all__.res_usage = res_usage;
						__all__.rev_expenses = rev_expenses;
						__all__.rev_gross = rev_gross;
						__all__.tax_rate = tax_rate;
					__pragma__ ('</all>')
				}
			}
		}
	);
	__nest__ (
		__all__,
		'math', {
			__all__: {
				__inited__: false,
				__init__: function (__all__) {
					var pi = Math.PI;
					var e = Math.E;
					var exp = Math.exp;
					var expm1 = function (x) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'x': var x = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return Math.exp (x) - 1;
					};
					var log = function (x, base) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'x': var x = __allkwargs0__ [__attrib0__]; break;
										case 'base': var base = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return (base === undefined ? Math.log (x) : Math.log (x) / Math.log (base));
					};
					var log1p = function (x) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'x': var x = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return Math.log (x + 1);
					};
					var log2 = function (x) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'x': var x = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return Math.log (x) / Math.LN2;
					};
					var log10 = function (x) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'x': var x = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return Math.log (x) / Math.LN10;
					};
					var pow = Math.pow;
					var sqrt = Math.sqrt;
					var sin = Math.sin;
					var cos = Math.cos;
					var tan = Math.tan;
					var asin = Math.asin;
					var acos = Math.acos;
					var atan = Math.atan;
					var atan2 = Math.atan2;
					var hypot = Math.hypot;
					var degrees = function (x) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'x': var x = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return (x * 180) / Math.PI;
					};
					var radians = function (x) {
						if (arguments.length) {
							var __ilastarg0__ = arguments.length - 1;
							if (arguments [__ilastarg0__] && arguments [__ilastarg0__].hasOwnProperty ("__kwargtrans__")) {
								var __allkwargs0__ = arguments [__ilastarg0__--];
								for (var __attrib0__ in __allkwargs0__) {
									switch (__attrib0__) {
										case 'x': var x = __allkwargs0__ [__attrib0__]; break;
									}
								}
							}
						}
						else {
						}
						return (x * Math.PI) / 180;
					};
					var sinh = Math.sinh;
					var cosh = Math.cosh;
					var tanh = Math.tanh;
					var asinh = Math.asinh;
					var acosh = Math.acosh;
					var atanh = Math.atanh;
					var floor = Math.floor;
					var ceil = Math.ceil;
					var trunc = Math.trunc;
					var isnan = isNaN;
					var inf = Infinity;
					var nan = NaN;
					__pragma__ ('<all>')
						__all__.acos = acos;
						__all__.acosh = acosh;
						__all__.asin = asin;
						__all__.asinh = asinh;
						__all__.atan = atan;
						__all__.atan2 = atan2;
						__all__.atanh = atanh;
						__all__.ceil = ceil;
						__all__.cos = cos;
						__all__.cosh = cosh;
						__all__.degrees = degrees;
						__all__.e = e;
						__all__.exp = exp;
						__all__.expm1 = expm1;
						__all__.floor = floor;
						__all__.hypot = hypot;
						__all__.inf = inf;
						__all__.isnan = isnan;
						__all__.log = log;
						__all__.log10 = log10;
						__all__.log1p = log1p;
						__all__.log2 = log2;
						__all__.nan = nan;
						__all__.pi = pi;
						__all__.pow = pow;
						__all__.radians = radians;
						__all__.sin = sin;
						__all__.sinh = sinh;
						__all__.sqrt = sqrt;
						__all__.tan = tan;
						__all__.tanh = tanh;
						__all__.trunc = trunc;
					__pragma__ ('</all>')
				}
			}
		}
	);
	(function () {
		var AlliancePosition = __init__ (__world__.ferret.pnw.constants).AlliancePosition;
		var CONTINENTS = __init__ (__world__.ferret.pnw.constants).CONTINENTS;
		var CONTINENT_RESOURCES = __init__ (__world__.ferret.pnw.constants).CONTINENT_RESOURCES;
		var Color = __init__ (__world__.ferret.pnw.constants).Color;
		var Continent = __init__ (__world__.ferret.pnw.constants).Continent;
		var DomesticPolicy = __init__ (__world__.ferret.pnw.constants).DomesticPolicy;
		var ECONOMIC_POLICIES = __init__ (__world__.ferret.pnw.constants).ECONOMIC_POLICIES;
		var EconomicPolicy = __init__ (__world__.ferret.pnw.constants).EconomicPolicy;
		var IMPROVEMENTS = __init__ (__world__.ferret.pnw.constants).IMPROVEMENTS;
		var Improvement = __init__ (__world__.ferret.pnw.constants).Improvement;
		var ImprovementStats = __init__ (__world__.ferret.pnw.constants).ImprovementStats;
		var MILITARY = __init__ (__world__.ferret.pnw.constants).MILITARY;
		var Military = __init__ (__world__.ferret.pnw.constants).Military;
		var MilitaryStats = __init__ (__world__.ferret.pnw.constants).MilitaryStats;
		var PROJECT_MODS = __init__ (__world__.ferret.pnw.constants).PROJECT_MODS;
		var Project = __init__ (__world__.ferret.pnw.constants).Project;
		var RESOURCES = __init__ (__world__.ferret.pnw.constants).RESOURCES;
		var RES_PROD_MODS = __init__ (__world__.ferret.pnw.constants).RES_PROD_MODS;
		var RES_USAGE_MODS = __init__ (__world__.ferret.pnw.constants).RES_USAGE_MODS;
		var Resource = __init__ (__world__.ferret.pnw.constants).Resource;
		var SOCIAL_POLICIES = __init__ (__world__.ferret.pnw.constants).SOCIAL_POLICIES;
		var Season = __init__ (__world__.ferret.pnw.constants).Season;
		var SocialPolicy = __init__ (__world__.ferret.pnw.constants).SocialPolicy;
		var TAX_RATES = __init__ (__world__.ferret.pnw.constants).TAX_RATES;
		var WarPolicy = __init__ (__world__.ferret.pnw.constants).WarPolicy;
		var im = __init__ (__world__.ferret.pnw.constants).im;
		var mil = __init__ (__world__.ferret.pnw.constants).mil;
		var pr = __init__ (__world__.ferret.pnw.constants).pr;
		var res = __init__ (__world__.ferret.pnw.constants).res;
		var alliance = __init__ (__world__.ferret.pnw.formulas).alliance;
		var city = __init__ (__world__.ferret.pnw.formulas).city;
		var general = __init__ (__world__.ferret.pnw.formulas).general;
		var nation = __init__ (__world__.ferret.pnw.formulas).nation;
		__pragma__ ('<use>' +
			'ferret.pnw.constants' +
			'ferret.pnw.formulas' +
		'</use>')
		__pragma__ ('<all>')
			__all__.AlliancePosition = AlliancePosition;
			__all__.CONTINENTS = CONTINENTS;
			__all__.CONTINENT_RESOURCES = CONTINENT_RESOURCES;
			__all__.Color = Color;
			__all__.Continent = Continent;
			__all__.DomesticPolicy = DomesticPolicy;
			__all__.ECONOMIC_POLICIES = ECONOMIC_POLICIES;
			__all__.EconomicPolicy = EconomicPolicy;
			__all__.IMPROVEMENTS = IMPROVEMENTS;
			__all__.Improvement = Improvement;
			__all__.ImprovementStats = ImprovementStats;
			__all__.MILITARY = MILITARY;
			__all__.Military = Military;
			__all__.MilitaryStats = MilitaryStats;
			__all__.PROJECT_MODS = PROJECT_MODS;
			__all__.Project = Project;
			__all__.RESOURCES = RESOURCES;
			__all__.RES_PROD_MODS = RES_PROD_MODS;
			__all__.RES_USAGE_MODS = RES_USAGE_MODS;
			__all__.Resource = Resource;
			__all__.SOCIAL_POLICIES = SOCIAL_POLICIES;
			__all__.Season = Season;
			__all__.SocialPolicy = SocialPolicy;
			__all__.TAX_RATES = TAX_RATES;
			__all__.WarPolicy = WarPolicy;
			__all__.alliance = alliance;
			__all__.city = city;
			__all__.general = general;
			__all__.im = im;
			__all__.mil = mil;
			__all__.nation = nation;
			__all__.pr = pr;
			__all__.res = res;
		__pragma__ ('</all>')
	}) ();
   return __all__;
}
export default pnw ();
