var should	= require('chai').should();

describe('redis', function () {
	var redis	= require('redis')
	,	client	= redis.createClient()
	,	engine	= require(__dirname + '/../../../lib/store/redis')({
			"ttl": 1000 //set TTL to 1 second
		})
	;
	
	beforeEach(function (done) {
		client.flushdb(function () {
			client.multi()
			.set('ROOT.buzz', JSON.stringify('foo'))
			.set('ROOT.biz', JSON.stringify('bar'))
			.exec(done);
		});
	});
	
	describe('#put', function () {
		it('should add the given value to the given key', function (done) {
			engine.put('blah', 'baz', function (err, success) {
				success.should.be.ok;
				
				client.get('ROOT.baz', function (err, reply) {
					should.not.exist(err);
					reply.should.eql(JSON.stringify('blah'));
					
					client.ttl('ROOT.baz', function (err, reply) {
						reply.should.be.within(0,1);
						done();
					});
				});
			});
		});
	});
	
	describe('#get', function () {
		it('should given a null value for a non existant key', function (done) {
			engine.get('bar', function (err, value) {
				should.not.exist(value);
				done();
			});
		});
		it('should give back the proper value for an existing key', function (done) {
			engine.get('buzz', function (err, value) {
				should.exist(value);
				value.should.eql('foo');
				done();
			});
		});
		it('should be able to return a JSON object.', function (done) {
			var value	= {
				'test': "This a test",
				"nested": {
					"nest_test": "boo"
				}
			};
			engine.put(value, 'blah', function (err) {
				should.not.exist(err);
				
				engine.get('blah', function (err, reply) {
					should.not.exist(err);
					reply.should.eql(reply);
					done();
				});
			});
			
		});
	});
	
	describe('#del', function () {
		it("should remove the given key from the store", function (done) {
			engine.del("buzz", function (err, success) {
				should.not.exist(err);
				success.should.be.ok;
				
				client.exists("buzz", function (err, reply) {
					should.not.exist(err);
					reply.should.not.be.ok;
					done();
				});
			});
		});
	});
	
	describe ('#clear', function () {
		it("should clear the current cache", function (done) {
			engine.clear(function (err, success) {
				success.should.be.ok;
				client.dbsize(function (err, reply) {
					should.not.exist(err);
					reply.should.eql(0);
					done();
				});
			});
		});
	});
});