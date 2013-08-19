// property change binder
var binder = {

	$watch: function (key, watcher) {
		if (this.$onWatch) this.$onWatch(key, watcher)

		if (this.$keys[key]) {
			this.$keys[key].watchers.push(watcher)
		} else {

			this.$keys[key] = {
				value: this[key], // keys value 
				watchers: [watcher] // when key chagne, invoke functions in list
			}

			// watch the value's change
			Object.defineProperty(this, key, {
				set: function (val) {
					var keyObj = this.$keys[key] 
					var preVal = keyObj.value 
					var watchers = keyObj.watchers

					for (var i = watchers.length - 1; i >= 0; i--) {
						watchers[i](val, preVal)
					}

					if (this.$onSet) this.$onSet(key, val, preVal)

					keyObj.value = val
				},
				get: function() {
					return this.$keys[key].value
				} 
			})
		}

	},

	toJSON: function() {
		var json = {}
		var PRIVATE_PROPS = /(?:^\$.*)|(?:toJSON)/ ///(?:\$keys)|(?:\$calculates)|(?:\$onSet)|(?:\$toJSON)|(?:\$onWatch)|(?:\$)/

		property(this, function(key, value) {
			if(PRIVATE_PROPS.test(key) || isFunction(this[key])) return
			json[key] = value
		})

		return json
	}

	// $set: noop
	// $keys: {},
	// $calculates: {}
} 

function bind (obj) {
	extend(obj, binder)
	if (isUndefined(obj.$keys)) {
		obj.$keys = {}
	}
	return obj
}