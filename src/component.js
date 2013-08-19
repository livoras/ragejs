var _cid = 0

function component (opt, factory) {
	var tpl = opt.template
	var components = opt.components
	var defaults = opt.defaults

	function ComponentConstructor (initScope) {

		merge(defaults, initScope)

		// For parsing directive: `rg-component`
		if (isUndefined(initScope.components)) {
			initScope.components = components
		}

		var scope = parse(tpl, initScope)
		factory(scope)

		return extend(this, {
			id: 'c' + _cid++,
			scope: scope,
			options: opt,
			components: components,
			view: scope.view
		})
	}

	// ComponentConstructor.prototype.reParse = function(initScope) {
	// 	merge(defaults, initScope)
	// 	initScope.components = components
	// 	console.log(this.scope.name)
	// 	var scope= parse(this.view, initScope)
	// 	this.scope = scope
	// 	console.log('.....')
	// 	console.log(this.scope.name)
	// }

	function merge (defaults, initScope) {
		property(defaults, function (prop, value) { // Merge DefaultScope and initScope
			if (isUndefined(initScope[prop])) {
				initScope[prop] = value
			}
		})
	}

	return ComponentConstructor
}