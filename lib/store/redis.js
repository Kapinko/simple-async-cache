/**
 * A redis base storage engine.
 */
module.exports	= function (opts) {
	opts	= opts || {};
	
	var DEFAULT_NAMESPACE	= 'ROOT'
	
	,	port	= opts.port || 6379
	,	host	= opts.host || "127.0.0.1"
	,	redis	= require('redis')
	,	async	= require('async')
	,	client	= redis.createClient(port, host, opts)
	,	default_ttl	= opts.ttl || (60 * 60 * 1000) //default time out of 1 hour.
	;
	
	/**
	 * Create a key
	 * @param {string} key
	 * @param {string} namespace
	 * @return {string}
	 */
	function gen_key(key, namespace) {
		return (namespace || DEFAULT_NAMESPACE) + '.' + key;
	}
	/**
	 * Serialize the given data.
	 * @param {*} data
	 * @return {string}
	 */
	function serialize(data) {
		return JSON.stringify(data);
	}
	/**
	 * De-serialize the given serialized data string.
	 * @param {string} serialized
	 * @return {*}
	 */
	function deserialize(serialized) {
		return JSON.parse(serialized);
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
			key	= gen_key(key, namespace || DEFAULT_NAMESPACE);
			data	= serialize(data);
			
			var multi	= client.multi();
			
			multi.set(key, data);
			multi.expire(key, (ttl || default_ttl) / 1000);
			multi.exec(function (err, replies) {
				callback(err, true);
			});
		},
		/**
		 * Attempt to retrieve information from the cache.
		 * @param {string} key
		 * @param {function()} callback
		 * @param {string} namespace
		 */
		'get': function (key, callback, namespace) {
			key	= gen_key(key, namespace);
			client.get(key, function (err, reply) {
				if (!err && reply) {
					reply	= deserialize(reply);
				}
				callback(err, reply);
			});
		},
		/**
		 * Delete a specific item or namespace from the cache.
		 * @param {string} key
		 * @param {function()} callback
		 * @param {string} namespace
		 */
		'del': function (key, callback, namespace) {
			if (!key && !namespace) {
				//hmm...?
				callback(null, true);
				return;
			}
			
			if (!key) {
				//delete all keys in the given namespace
				var multi	= client.multi();
				client.keys(namespace+"*", function (err, reply) {
					var tasks	= [];
					
					if (Array.isArray(reply)) {
						reply.forEach(function (key) {
							tasks.push(function (done) {
								multi.del(key, done);
							});
						});
						async.parallel(tasks, function (err) {
							callback(err, true);
						});
					} else {
						callback(null, true);
					}
				});
				
			} else {
				key	= gen_key(key, namespace);
				client.del(key, function (err) {
					callback(err, true);
				});
			}
		},
		/**
		 * Clear the cache
		 * @param {function()} callback
		 */
		'clear': function (callback) {
			client.flushdb(callback);
		}
	}
};