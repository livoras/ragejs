function calculate (scope, exp, fn) {
	var $calculates = scope.$calculates
	var calculcateId = escapeExpression(reduceSpaceNotInQuota(exp))
	var depProperties = parseDepsProperties(scope, exp)
	var result = $calculates[calculcateId]

	// Don't parse again if the calculate has been parsed
	if(result) {
		$calculates.$watch(calculcateId, fn)
		return result
	}

	// If the caculate property depend on other property
	// then watch the dependencies changing
	// if chagne, then recalculate the caculate property
	if(depProperties.length !== 0) {

		each(depProperties, function (depProperty) {

			// The propery may be a global variable
			// We have no reason to watch it.
			if (!scope[depProperty] && global[depProperty]) return 

			scope.$watch(depProperty, function (val, preVal) {
				// Try to set caculate value
				// after running the `set` method
				setTimeout(deferToSet, 2)
			})

			function deferToSet () {
				$calculates[calculcateId] = scope.$apply(exp)
			}
		})

		$calculates.$watch(calculcateId, fn)
	}

	return $calculates[calculcateId] = scope.$apply(exp)
}


var DEPS_RE = /\bscope\.\w+/mg
var SCOPE_PREFIX_RE = /^scope\./
function parseDepsProperties (scope, exp) {
	var deps = getVariable(exp)
	var realDeps = []

	each(deps, function (dep) {
		var model = scope[dep]

		if (isFunction(model)) {
			// Parse function call in expression
			var fn = model
			var depsInFn = fn.toString().match(DEPS_RE)

			each(depsInFn, function (depInFn) {
				realDeps.push(depInFn.replace(SCOPE_PREFIX_RE, ''))
			})

		} else {
			realDeps.push(dep)
		}
	})

	return realDeps
}

function reduceSpaceNotInQuota (exp) {
	// To optimalize this algorithm...
	var QUOTA_RE = /[\'\"].*?[\'\"]/g
	var quotaStrs = exp.match(QUOTA_RE)

	if(!quotaStrs) return exp

	var otherStrs = exp.split(QUOTA_RE)
	var resultStr = ''

	each(quotaStrs, function (quotaStr, i) {
		resultStr = resultStr + reduceSpace(otherStrs[i]) + quotaStr 
	})

	resultStr += reduceSpace(otherStrs[otherStrs.length - 1])

	return resultStr
}

// test
// var str = '" here is " com{ " This is a dog" } " This is another string " Hello you are' 
// var str0 = " com{ ' This is a dog' }" 
// reduceSpaceNotInQuota(str)
