function Scope (data) {

	if (data instanceof Scope) {
		return data 
	}

	if (isObject(data)) {
		extend(this, data)
	}

	this.$keys = {}
	this.$calculates = extend({}, binder)
	this.$calculates.$keys = {}

	events(this)

	// `isEmit` is for sharing the same model
	// will set to false in `directives.js -> rg-repeat`
	this.isEmit = true
	if (!this.$onSet) {
		this.$onSet = function(key, val, preVal) {
			if (this.isEmit) {
				this.emit('$set', key, val, preVal, this)
			} else {
				this.isEmit = true
			}
		}
	}

	// when watch on some key, emit an event
	if (!this.$onWatch) {
		this.$onWatch = function(key, watcher) {
			this.emit('$watch', key, watcher, this)
		}
	}
}

extend(Scope.prototype, binder, applyer)

function isScope (obj) {
	return obj instanceof Scope
}