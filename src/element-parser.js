// Parse DOM from String 
// http://www.cnblogs.com/bruceli/archive/2010/05/05/1727856.html
function parseDom (tpl) {

	if (isHTML(tpl)) return tpl
	if (tpl.elms) return tpl.elms	

	var domFrag = doc.createElement('div')
	domFrag.innerHTML = tpl

	// Return dom.children not dom.childNodes,
	// because children is not incliding text and attributes.
	// It's just a HTML elements collection
	// Also, children is more compatible
	// http://www.cnblogs.com/snandy/archive/2011/03/11/1980085.html
	return domFrag.children  
}

function parseNodes (tpl) {
	var domFrag = doc.createElement('div')
	domFrag.innerHTML = tpl
	return domFrag.childNodes  
}

function parseElement (elms, scope, force) {

	// Because you can pass an HTML object or an HTML NodeList as elms
	// Here has to judge what type of `elms` is 
	// If it is not an Array and not an HTML collection and NodeList 
	// Set it in an array for following iteration
	var objType = type(elms)
	// if( objType !== 'Array' &&
	//  	objType !== 'HTMLCollection' && 
	//  	objType !== 'NodeList'
	// ) {
	if (isArrayLike(elms)) {
		toArray(elms)
	} else {
		// It may be an $ object 
		if (elms.elms) elms = elms.elms 
		else elms = [elms]
	}

	each(elms, function (elm) {
		// Skip scaning the element if the elem has attribute `rg-ignore`
		// The Element has `rg-scope` has already get its scope, so have no need to scan it
		if (!force && (elm.hasAttribute('rg-ignore') || elm.hasAttribute('rg-scope'))) return 

		elm.setAttribute('rg-scope', '')	
		parseAttribute(elm, scope)
		parseContent(elm, scope)
		parseElement(elm.children, scope, force) 
	})
}

function parseAttribute (elm, scope) {
	each(elm.attributes, function (attr) {
		var attrName = attr.name
		var attrVal = attr.nodeValue

		var directive = parseDirective(attrName)
		var expression = parseExpression(attrVal)

		if (directive) {
			bindDirectiveToScope(elm, attr, scope, directive)
		} else if (expression) {
			bindAttrToScope(elm, attr, scope, expression)
		}
	})
}

function parseContent (elm, scope) {
	var nodes = elm.childNodes
	each(nodes, function (node) {
		if (node.nodeType === 3) {
			var expression = parseExpression(node.nodeValue) 
			if (expression) {
				bindContentToScope(elm, node, scope, expression)
			}
		}
	})
}


var DOUBBLE_BRACE_RE = /[\{\{\}\}]/g
var rDOUBBLE_BRACE_RE = /\{\{/g
var lDOUBBLE_BRACE_RE = /\}\}/g
var DIRECTIVE_RE = /^rg-.*/
var DIRECTIVE_PREFIX_RE = /(^rg-)|(-.*$)/g
var EXPRESSION_RE = /\{\{.*?\}\}/mg

function bindContentToScope (elm, node, scope, exps) {

	var tpl = node.nodeValue.replace(rDOUBBLE_BRACE_RE, '<span rg-scope>')
							.replace(lDOUBBLE_BRACE_RE, '</span>')

	var domContent = parseNodes(tpl)							
	var frag =  createDomFrag()
	append(frag, domContent)
	var bindSpans = find(frag, 'span')

	each(exps, function (exp, i) {
		var span = bindSpans[i]

		var result = calculate(scope, exp, function(val, preVal) {
			span.innerHTML = val 
		})

		span.innerHTML = result
	})

	elm.insertBefore(frag, node)
	elm.removeChild(node)
}

function bindDirectiveToScope (elm, attr, scope, directive) {
	var directiveHandler = rg[directive]
	if (directiveHandler) directiveHandler.apply(this, arguments)
}

function bindAttrToScope (elm, attr, scope, exps) {
	var valStr = attr.nodeValue
	var valCache = attr.nodeValue

	each(exps, function (exp) {

		var result = calculate(scope, exp, function (val, preVal) {
			setTimeout(replaceAttr, 2)
		})

		valCache = valCache.replace(exp, result)
	})

	attr.nodeValue = valCache

	function replaceAttr () {
		var valCache = valStr

		each(exps, function (exp) {
			var result = scope.$apply(exp)
			valCache = valCache.replace(exp, result)
		})

		attr.nodeValue = valCache
	}
}

function createSpan() {
	var span = doc.createElement('span')
	span.innerHTML = 'Hello'
	return span
}

function parseDirective (attr) {
	var result = attr.match(DIRECTIVE_RE)
	return result ? result[0].replace(DIRECTIVE_PREFIX_RE, '') : false
}

function parseExpression (exp) {
	var result = exp.match(EXPRESSION_RE)
	return result ? result : false
}

function getModelName (exp) {
	return exp.replace(DOUBBLE_BRACE_RE, '')
}

function parse (tpl, obj, force) {

	var scope = new Scope(obj)
	var elms

	if (tpl.get) { // is a jQuery Object

		elms = tpl.get(0)
		parseElement(elms, scope, force)
		scope.view = elms.get(0) 
		scope.$view = elms 

	} else if (isString(tpl)) { // is template string
		// Get HTML nodes from tpl 
		elms = parseNodes(tpl)

		// Mock a fake element for scanning
		var div = doc.createElement('div')

		// Set nodes to mock div element
		$(div).append(elms)

		// parse div element 
		parseElement(div, scope, force)

		scope.view = div.childNodes
		scope.$view = $(div.childNodes)

 	} else { // is an HTML Object
		var div = doc.createElement('div')
		$(div).append(tpl)
 		parseElement(div, scope, force)
 		scope.view = tpl
 		scope.$view = $(tpl)
 	}

	return scope
}

/* test
--------------*/
// var scope = new Scope()

// extend(scope, {
// 	Hello: 'Good',
// 	name: 'Kruash',
// 	age: 12,
// 	Joke: 'hahahah',
// 	title: 'RageJS',
// 	username: 'username',
// 	isShow: true,
// 	content: 'content',
// 	say: function(event, name, greeting) {console.log(greeting || 'hello you ', name, event)},
// 	warn: function(event) {alert("I am warning you")},
// 	com: function(greeting) {
// 		var greeting = greeting || 'Hello, '
// 		return greeting + scope.name + ' ' + scope.title
// 	}
// })

// var str = "<!--主楼--> <div class='main-floor' title='title is :{{title + 1}}- name is: {{name}}' rg-model='Hello'> <div class='comment-avatar' rg-model='Hello' rg-on-click='say(event, name)'> <img alt='reply-avatar' /> </div> <div class='comment-reply'> <span class='comment-time'>2013-12-11 13:20</span> <span class='comment-reply-but'>回复 TGhis is what I wan wan wanttt</span> </div> <span class='comment-userName'>{{username}}</span> <p class='comment-content'>{{content}}</p> </div> <hr /> <!--楼中楼--> <div class='floors-container'> </div> <div class='comment-reply-zone'> <textarea class='comment-reply-text'></textarea> <button class='comment-reply-send floor-button'>Button</button> </div> "
// var frag = parseDom(str)
// append(doc.body, frag)
// parseElement(body, scope)
