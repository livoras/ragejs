var arrayHelper = {
	pop: function () {
		var result = Array.prototype.pop.apply(this, arguments)
		this.emit('pop', result)
		this.emit('length change', 'pop', result, arguments)
		return result
	},
	push: function() {
		var result  = Array.prototype.push.apply(this, arguments)
		this.emit('push', result)
		this.emit('length change', 'push', result, arguments)
		return result
	},
	concat: function () {
		var result  = Array.prototype.concat.apply(this, arguments)
		this.emit('concat', result)
		this.emit('length change', 'concat', result, arguments)
		return result
	},
	every: function () {
		var result  = Array.prototype.every.apply(this, arguments)
		this.emit('every', result)
		return result
	},
	join: function () {
		var result  = Array.prototype.join.apply(this, arguments)
		this.emit('join', result)
		return result
	},
	reduce: function () {
		var result  = Array.prototype.reduce.apply(this, arguments)
		this.emit('reduce', result)
		return result
	},
	reduceRight: function () {
		var result  = Array.prototype.reduceRight.apply(this, arguments)
		this.emit('reduceRight', result)
		return result
	},
	reverse: function () {
		var result  = Array.prototype.reverse.apply(this, arguments)
		this.emit('reverse', result)
		return result
	},
	shift: function () {
		var result  = Array.prototype.shift.apply(this, arguments)
		this.emit('shift', result)
		this.emit('length change', 'shift', result, arguments)
		return result
	},
	slice: function () {
		var result  = Array.prototype.slice.apply(this, arguments)
		this.emit('slice', result)
		return result
	},
	sort: function () {
		var result  = Array.prototype.sort.apply(this, arguments)
		this.emit('sort', result)
		return result
	},
	splice: function () {
		var result  = Array.prototype.splice.apply(this, arguments)
		this.emit('splice', result)
		this.emit('length change', 'splice', result, arguments)
		return result
	},
	unshift: function () {
		var result  = Array.prototype.unshift.apply(this, arguments)
		this.emit('unshift', result)
		this.emit('length change', 'unshift', result,arguments)
		return result
	}
}

function watchArray (arr, scope, arrName, viewConstructor, $basicElm, viewsMap) {

	if (!isArray(arr)) {
		error(arr + ' is not an array')
	}

	if (!arr.$watch) {
		extend(arr, binder, arrayHelper)
		events(arr)
		arr.$keys = {} 
	}

	if (isDefined(viewConstructor)) {
		mapArrayToView(arr, scope, arrName, viewConstructor, $basicElm, viewsMap)
	}

	return arr
}

function mapArrayToView (arr, scope, arrName, createNewView, $basicElm, viewsMap) {

	scope.$watch(arrName, function(newArr, preArr) {

		each(viewsMap, function($view) {
			$view.remove()
		})

		newArr = watchArray(newArr)
		viewsMap = []

		initViewsFromArray(newArr, createNewView, viewsMap, $basicElm)
		listenArrayChange(newArr, createNewView ,viewsMap, $basicElm)
	})

	initViewsFromArray(arr, createNewView, viewsMap, $basicElm)
	listenArrayChange(arr, createNewView ,viewsMap, $basicElm)
}

function initViewsFromArray (arr, createNewView, viewsMap, $basicElm) {
	each(arr, function(model, i) {

		if (isObject(model)) {
			events(model)
			bind(model)
		}

		var $view = createNewView(model)

		viewsMap.push($view)
		$view.insertBefore($basicElm)

		model.$index = i

		arr.$watch(i, function (model, preModel) {

			if (isObject(model)) {
				events(model)
				bind(model)
			}

			var $preView = viewsMap[i] 
			var $newView = createNewView(model)

			$newView.insertBefore($preView)
			$preView.remove()

			viewsMap[i] = $newView
			model.$index = i
		})

	})
}

function listenArrayChange (arr, createNewView, viewsMap, $basicElm) {

	arr.on('length change', function(type, result, args) {
		var $view = null

		if (type === 'push') {
			$view = createNewView(args[0])
			viewsMap.push($view)
			$view.insertBefore($basicElm)
		}

		if (type === 'unshift') {
			$view = createNewView(args[0])
			viewsMap.unshift($view)
			$view.insertBefore(viewsMap[0])
		}

		if (type === 'pop') {
			viewsMap.pop().remove()
		}

		if (type === 'shift') {
			viewsMap.shift().remove()
		}

		if (type === 'splice') {
			var views = Array.prototype.splice.apply(viewsMap, args)
			each(views, function(view) {
				view.remove()
			})
		}

	})
}
