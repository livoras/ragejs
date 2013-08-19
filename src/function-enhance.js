// empty function
function noop (arguments) {
  // body...
}

// logger
var logger = {
	config: function(opt) {

		var settings = {
			debug: true 
		}

		extend(settings, opt)
		extend(this, settings)

		this.log = settings.debug ? log: noop 
		this.dir = settings.debug ? dir: noop 
		this.error = settings.debug ? error: noop 
	},
	debug: true,
	log: log,
	dir: dir,
	error: error
}


function log () {
	console.log.apply(console, arguments)
}

function dir () {
	console.dir.apply(console, arguments)
}

function error (e) {
	console.error('RageJS Error: ', e)
}

// extend obj not in deep
function extend () {
	var target = arguments[0]
	for (var i = arguments.length - 1; i > 0; i--) {
		var obj = arguments[i] 
		for (var key in obj) {
			if(obj.hasOwnProperty(key)) {
				target[key] = obj[key]
			}
		}
	}
	return target
}

function toArray (arrayLike) {
	var list = Array.prototype.slice.call(arrayLike)
	return list
}

function toString (obj) {
	return Object.prototype.toString.call(obj)
}


function toBoolean (obj) {
	if (obj) {
		if (isString(obj)) {
			if(obj === 'false') {
				return false
			}
			return true
		}
	} else {
		return false
	}
}

// To camelcase, learn from AngularJS 
var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
var MOZ_HACK_REGEXP = /^moz([A-Z])/
function toCamelCase(name) {
	return name.
	replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
	  return offset ? letter.toUpperCase() : letter
	}).
	replace(MOZ_HACK_REGEXP, 'Moz$1')
}

function each (list, fn) {
	var list = toArray(list)
	for (var i = 0, len = list.length; i < len; i++) {
		fn(list[i], i)
	}
}

// Iterate property in an object
function property (obj, inDeep, fn) {
	var len = arguments.length

	if (len === 2) {
		fn = inDeep
		var inDeep = false
	} 

	for (var i in obj) {

		if (inDeep) {
			fn(i, obj[i])
		} else if (obj.hasOwnProperty(i)) {
			fn(i, obj[i])
		}

	}
}

function reverseEach (list, fn) {
	var list = toArray(list)
	for (var i = list.length - 1; i >= 0; i--) {
		fn(list[i], i)
	}
}

function reduceSpace (str) {
	return str.replace(/\s/g, '')
}

function copyArray (arr) {
	return arr.slice(0)
}


var REPLACE_OBJ_STR_RE = /(?:^\[object\s+)|(?:\]$)/g
function type (obj) {
	return toString(obj).replace(REPLACE_OBJ_STR_RE, '')
}

function isType(type) {
	return function(obj) {
		return toString(obj) === "[object " + type + "]"
	}
}
var isObject = isType("Object")
var isString = isType("String")
var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")

// To judge if a obj is `undefine`
// the underscore's way
// http://stackoverflow.com/questions/13463955/isundefined-implementation
function isUndefined (obj) { 
	return obj == void 0 
} 

function isDefined(obj) {
	return obj !== void 0 
}

var HTML_OBJ_RE = /(?:HTML\w+)|(?:NodeList)/
function isHTML (obj) {
	var match = toString(obj).match(HTML_OBJ_RE) 
	return match ? match[0] : false
}

function isArrayLike (obj) {
	var objType = type(obj)

	return (objType === 'Array' ||
			objType === 'String' ||
			objType === 'Arguments' ||
			objType === 'HTMLCollection' || 
			objType === 'NodeList')

}

// console.log(isArrayLike(document.body.childNodes))