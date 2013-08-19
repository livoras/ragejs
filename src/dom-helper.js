var doc = document
var body = doc.body

var addListener = document.addEventListener || document.attachEvent
var removeListener = document.removeEventListener || document.detachEvent

function JQLite (selector) {
	var elms

	if (isString(selector)) {
		elms = toArray(doc.querySelectorAll(selector))

	} else if (selector.get && selector.elms) {
		return selector
		
	} else {

		if (isArrayLike(selector)) {
			elms = toArray(selector)
		} else {
			elms = [selector] 
		}

	}

	return {
		elms: elms,

		get: function(index) {
			return elms
		},

		each: function (fn) {
			elms = this.elms
			each(elms, fn)
			return this
		},

		on: function (eventName, fn) {
			this.each(function (elm) {
				addListener.call(elm, eventName, fn)
			})
			return this
		},

		off: function (eventName, fn) {
			this.each(function (elm) {
				removeListener.call(elm, eventName, fn)
			})
			return this
		},

		val: function(value) {
			var val 

			if(!isUndefined(value)) {
				this.each(function(elm) {
					elm.value = value
				})
			} else {
				return this.elms[0].value
			}
		},

		attr: function(name, value) {
			var len = arguments.length

			if(len === 1) {

				return this.elms[0].getAttribute(name)

			} else {

				this.each(function (elm) {
					elm.setAttribute(name, value)
				})

				return this
			}
		},

		removeAttr: function(name) {
			this.each(function(elm) {
				elm.removeAttribute(name)
			})
		},

		hide: function (duration) {
			this.attr('hidden', true)
			return this
		},

		show: function (duration) {
			this.removeAttr('hidden')
			return this
		},

		text: function(text) {
			// Using textContent
			// http://kellegous.com/j/2013/02/27/innertext-vs-textcontent/
			if (text) {
				this.each(function(elm) {
					elm.textContent = text
				})
			} else {
				// A special way to get escaping text
				var div = doc.createElement('div')
				var elm = elms[0]
				div.textContent = elm.innerHTML
				return div.innerHTML
			}
			return this
		},

		html: function (html) {
			if (isUndefined(html)) {
				return this.elms[0].innerHTML
			} else {
				this.each(function(elm) {
					elm.innerHTML = html
				})
			}
			return this
		},

		css: function (name, value) {

			var len = arguments.length

			if (len === 1) { 

				if (isObject(name)) {
					// if passing in an Object
					value = name

					property(value, function (prop, val) {
						prop = toCamelCase(prop)
						each(elms, function (elm) {
							elm.style[prop] = val
						})
					})

				} else {

					name = toCamelCase(name) // if passing a string, then return the css property
					return this.elms[0].style[name]
				}

			} else if(len === 2) { // if passing in css property name an value
				name = toCamelCase(name)

				this.each(function (elm) {
					elm.style[name] = value
				})
			}

			return this
		},

		append: function(elm) {
			var parent = this.elms[0]
			var elms = elm.elms
			if (elms) {
				append(parent, elms)
			} else {
				if (isArrayLike(elm)) {
					append(parent, elm)
				} else {
					if (isHTML(elm)) {
						append(parent, [elm])
					}
				}
			}
		},

		insertBefore: function(elms) {
			var basic = this.elms[0]
			var elms = elms.elms ? elms.elms : elms
			var wrapper = wrapWithDomFrag(elms) 
			basic.parentNode.insertBefore(wrapper, basic)
			return this
		},

		remove: function() {
			this.each(function(elm) {
				var parent = elm.parentNode
				if (parent) {
					elm.parentNode.removeChild(elm)
				}
			})
			return this
		}
	}
}

function append(parent, childs) {
	var frag = doc.createDocumentFragment()

	each(childs, function (child, i) {
		frag.appendChild(child)
	})	

	parent.appendChild(frag)
}


function find (frag, selector) {
	return frag.querySelectorAll(selector)
}

function createDomFrag () {
	return doc.createDocumentFragment()
}

function wrapWithDomFrag (nodes) {
	var frag = createDomFrag()

	each(nodes, function (node) {
		frag.appendChild(node)
	})

	return frag
}

var $
if (global.jQuery) {
	$ = jQuery 
} else if (global.zepto) {
	$ = zepto 
} else {
	$ = JQLite
}

// $('body').css({'border':'1px solid #ccc', 'background-color': '#000'})
// console.log($(document.body).css('background-color'))