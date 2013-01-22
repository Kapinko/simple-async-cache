/**
 * A memory based storage engine.
 */

module.exports	= function (opts) {
	opts	= opts || {};
	/**
	 * This is the cache store object that will hold all of the cached items.
	 * @type {Object.<string,*>}
	 */
	var store	= opts.store || {};
	
	/**
	 * Create a new hash store object.
	 * @param {*} data
	 * @param {number} ttl
	 * @return {Object.<string,*>}
	 */
	function gen_store_obj(data, ttl) {
		return {
			'value': data,
			'ttl': ttl,
			'timestamp': (new Date()).getTime()
		};
	}
	
	return {
		/**
		 * Store the given data into the cache.
		 * @param {*} data
		 * @param {string} key
		 * @param {function()} callback
		 * @param {string} namespace
		 * @param {number} ttl
		 */
		'put': function (data, key, callback, namespace, ttl) {
			data	= gen_store_obj(data, ttl);
			
			if (namespace) {
				if (!store[namespace]) {
					store[namespace]	= {};
				}
				store[namespace][key]	= data;
			} else {
				store[key]	= data;
			}
			return callback(null, true);
		},
		/**
		 * Attempt to retrieve information from the cache.
		 * @param {string} key
		 * @param {function()} callback
		 * @param {string} namespace
		 */
		'get': function (key, callback, namespace) {
			var value	= null
			,	time	= (new Date()).getTime();
			
			if (!namespace) {
				value	= store[key];
			} else if (store[namespace]) {
				value	= store[namespace][key];
			}
			
			if (value && (time - value.timestamp) < value.ttl) {
				value	= value.value;
			} else {
				value	= null;
			}
			return callback(null, value);
		},
		/**
		 * Delete a specific item or namespace from the cache.
		 * @param {string} key
		 * @param {function()} callback
		 * @param {string} namespace
		 */
		'del': function (key, callback, namespace) {
			if (!namespace) {
				delete store[key];
			} else if (store[namespace]) {
				if (!key) {
					delete store[namespace];
				} else {
					delete store[namespace][key];
				}
			}
			return callback(null, true);
		},
		/**
		 * Clear the cache
		 * @param {function()} callback
		 */
		'clear': function (callback) {
			var prop;
			
			for (prop in store) {
				if (store.hasOwnProperty(prop)) {
					delete store[prop];
				}
			}
			return callback(null, true);
		}
	};
};