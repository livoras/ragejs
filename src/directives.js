var rg = {}
var BRACKETS_ARGS_RE = /\(.*\)/g
var BRACKETS_RE = /[\(\)]/g
var QUOTA_RE = /[\'\"].*?[\'\"]/

rg['on'] = function (elm, dir, scope, directive) {
	var EVENT_RE = /^rg-on-/
	var invoke = dir.nodeValue 
	var invokeInfo = getInvokeInfo(invoke, scope)
	var method = invokeInfo['name']
	var params = invokeInfo['params'] 
	var eventName = dir.name.replace(EVENT_RE, '')

	$(elm).on(eventName, function (event) {
		var passingParams = copyArray(params)
		passingParams[0] = event
		try {
			scope[method].apply(scope, passingParams)
		} catch (e) {
			console.log(e)
			throw 'Scope has no method ' + method
		}
	})
}




rg['model'] = function (elm, dir, scope, directive) {
	var modelName = dir.nodeValue
	var $elm = $(elm)
	var model = getModel(scope, modelName)

	// Repeating Components may has a attribute `rg-model`
	if ($elm.attr('rg-component')) return 

	$elm.val(model)

	// How to detect the change of input ?
	// http://stackoverflow.com/questions/1948332/detect-all-changes-to-a-input-type-text-immediately-using-jquery
	$elm.on('keydown keyup keypress', function() {
		scope[modelName] = $elm.val()
	})

	scope.$watch(modelName, function (val, preVal) {
		$elm.val(val)
	})
}




rg['show'] = function (elm, dir, scope, directive) {
	var modelName = dir.nodeValue
	var $elm = $(elm)
	var model = getModel(scope, modelName)

	scope.$watch(modelName, function (val, preVal) {
		if (val === 'true' || val === true) {
			$elm.show()
		} else {
			$elm.hide()
		}
	})

	if (model !== true && model !== 'true') $elm.hide()
}




rg['component'] = function(elm, dir, scope, directive) {
	var $elm = $(elm)	

	var isRepeat = $elm.attr('rg-repeat')
	if (isRepeat) return 

	var componentName = dir.nodeValue
	var ComponentConstructor = findComponentConstrucotr(scope, componentName)

	if (!ComponentConstructor) error('Component ' + componentName + ' not found')

	var modelName = $elm.attr('rg-model')

	if (modelName) {
		var model = scope[modelName] || (scope[modelName] = {}) // scope must be an Object
		model.$parent = scope
	} else {
		var model = scope
	}

	var component = new ComponentConstructor(model)
	$elm.append($(component.view))
}




rg['repeat'] = function(elm, dir, scope, directive) {
	var arrName = dir.nodeValue 
	var arr = scope[arrName]
	var $elm = $(elm).removeAttr('rg-scope').removeAttr('rg-repeat')
	var tpl = elm.outerHTML
	var $basciElm = $(doc.createElement('div')).attr('rg-scope', '')
	$basciElm.insertBefore($elm)
	$elm.remove()
	$basciElm.hide()

	if (isUndefined(arr)) {
		error('Cannot repeat undefined ' + arrName)
	}

	watchArray(arr, scope, arrName, viewConstructor, $basciElm, [])

	function viewConstructor (model) {
		var newModel

		if (isObject(model)) {

			newModel = model.toJSON()

			// Delete events, becasue scope should has its own events
			// Or it will override the scope's events.
			delete newModel.events

		} else {
			newModel = model
		}

		newModel.$parent = scope 

		newModel.$onWatch = function(key, watcher) {
			model.$watch(key, watcher)
		}

		var newScope = parse(tpl, newModel)

		newScope.on('$set', function(key, val, preVal, scope) {
			model[key] = val
			model.emit('$setFromOtherScope', key, val, preVal, scope)
		})

		model.on('$setFromOtherScope', function(key, val, preVal, scope) {
			if (scope !== newScope) {
				newScope.isEmit = false
				newScope[key] = val
			}
		})


		return newScope.$view
	}

}

// invoke is like `say(name, greeting)`
// when `getInvokeInfo` called
// will return information like this
// {
//	name: 'say',
//	params: ['Kruash', 'Hello']
// }
function getInvokeInfo (invoke, scope) {
	var name = invoke.replace(BRACKETS_ARGS_RE, '')
	var paramasStr = invoke.match(BRACKETS_ARGS_RE)
	var paramsName = paramasStr ? paramasStr[0].replace(BRACKETS_RE, '').split(',') : []
	var params = [] 

	each(paramsName, function (param) {
		if(param) {
			// May be the param is a string 
			// Then add it to params directly
			if(param.match(QUOTA_RE)) {
				params.push(param.replace(/[\'\"]/g, ''))
			} else {
				params.push(scope[reduceSpace(param)])
			}
		}
	})

	return {
		name: name,
		params: params 
	}

}

function getModel (scope, modelName) {
	var model = scope[modelName]
	model = isUndefined(model) ?  '' : model
	return model
}

function findComponentConstrucotr (scope, componentName) {

	while (scope) {
		var components = scope.components

		if (isUndefined(components)) {
			scope = scope.$parent
			continue
		} else {
			var ComponentConstructor = components[componentName]

			if (isUndefined(ComponentConstructor)) {
				scope = scope.$parent
				continue
			} else {
				return ComponentConstructor
			}

		}

	}

	return null
}
