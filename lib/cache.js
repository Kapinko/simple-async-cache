/**
 * An asynchronous cache that can use different storage backends.
 * @param {string|function} engine
 * @param {Object.<string,*>} engine_opts
 * @param {number} default_ttl
 */
module.exports	= function (engine, engine_opts, default_ttl) {
	var DEFAULT_SYS_TTL	= 60 * 60 * 1000 //1 hour
	,	ENGINE_DIR		= __dirname + '/store/'
	,	crypto			= require('crypto')
	,	salt			= crypto.randomBytes(256)
	;
	/**
	 * Turn the given data object into a string value.
	 * @param {*} data
	 * @return {string}
	 */
	function hash(data) {
		var hash	= crypto.createHash('sha256');
		hash.update(salt);
		
		if (typeof data !== "string") {
			data	= JSON.stringify(data);
		}
		hash.update(data);
		return hash.digest('hex');
	}
	
	/**
	 * Is the given object a valid storage engine?
	 * @param {Object.<string,*>}
	 */
	function is_valid_engine(test) {
		var is_valid	= true;
		
		['put','get','del','clear'].forEach(function (func) {
			if (!test.hasOwnProperty(func) || typeof test[func] !== "function") {
				is_valid	= false;
			}
			return is_valid;
		});
		
		return is_valid;
	}
	
	//Attempt to load the engine if it's a string or create it if it's a function.
	if (typeof engine === "string") {
		engine	= require(ENGINE_DIR + engine)(engine_opts);
	} else if (typeof engine === "function") {
		engine	= engine(engine_opts);
	} else if (typeof engine !== "object" || !is_valid_engine(engine)) {
		throw new Error("Invalid storage engine");
	}
	
	//if the default TTL is not set, set it now.
	if (!default_ttl) default_ttl = DEFAULT_SYS_TTL;
	
	return {
		/**
		 * Store the given data into the cache.
		 * @param {*} data
		 * @param {*} key
		 * @param {function()} callback
		 * @param {string} namespace
		 * @param {number} ttl
		 */
		'put': function (data, key, callback, namespace, ttl) {
			key	= hash(key);
			return engine.put(data, key, callback, namespace, ttl || default_ttl);
		},
		/**
		 * Attempt to retrieve information from the cache.
		 * @param {*} key
		 * @param {function()} callback
		 * @param {string} namespace
		 */
		'get': function (key, callback, namespace) {
			key	= hash(key);
			return engine.get(key, callback, namespace);
		},
		/**
		 * Delete a specific item or namespace from the cache.
		 * @param {*} key
		 * @param {function()} callback
		 * @param {string} namespace
		 */
		'del': function (key, callback, namespace) {
			key	= hash(key);
			return engine.del(key, callback, namespace);
		},
		/**
		 * Clear the cache
		 * @param {function()} callback
		 */
		'clear': function (callback) {
			return engine.clear(callback);
		},
		/**
		 * Hook so clients can use our key hashing algo.
		 * @param {*} data
		 * @return {string}
		 */
		'hash': hash
	}
};
