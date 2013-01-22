var async	= require('async')
,	redis	= require('redis')
,	client	= redis.createClient()
,	tasks	= [];

['boo','blah','bar','baz'].forEach(function (key, index) {
	tasks.push(function (done) {
		index	= {
			"test": "This is an object",
			"nested": {
				"nested_key": new Date()
			},
			"my_index": index
		};
		client.set("ROOT."+key, JSON.stringify(index), done);
	});
});

async.parallel(tasks, function (err, replies) {
	client.keys('ROOT*', function (err, reply) {
		var tasks	= [];
		reply.forEach(function (key) {
			tasks.push(function (done) {
				client.get(key, function(err, reply) {
					console.log(key +" = "+reply);
					done(err, JSON.parse(reply));
				});
			});
		});
		tasks.push(function (done) {
			client.get('blahblahblah', function (err, reply) {
				console.log('blahblahblah = '+reply);
				done(err, reply);
			});
		});
		async.parallel(tasks, function (err, replies) {
			console.log(replies);
			process.exit(0);
		});
	});
	
});