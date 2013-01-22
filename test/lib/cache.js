
var chai		= require('chai')
,	sinon		= require('sinon')
,	sinonChai	= require('sinon-chai')
,	cache		= require(__dirname + '/../../lib/cache')
,	should
;
chai.use(sinonChai);
should	= chai.should();

describe('cache', function () {
	var stub_engine	= {
			"put": function () {},
			"get": function () {},
			"del": function () {},
			"clear": function () {}
		}
	,	spy, mock, mock_cache, test_key, test_hash, test_data;
	
	beforeEach(function (done) {
		spy			= sinon.spy();
		mock		= sinon.mock(stub_engine);
		mock_cache	= cache(stub_engine);
		test_key	= {"my": "key"};
		test_hash	= mock_cache.hash(test_key);
		test_data	= "This is my data";
		done();
	});
	
	describe("initialization", function () {
		it("should be able to load the in memory cache module", function (done) {
			var in_memory	= cache('memory');
			
			in_memory.put("baz", "boo", function (err, success) {
				should.not.exist(err);
				should.exist(success);
				success.should.be.ok;
				
				in_memory.get("boo", function (err, value) {
					should.not.exist(err);
					should.exist(value);
					value.should.eql("baz");
					done();
				});
			});
		});
		
		it("should be able to load the redis module", function (done) {
			var redis	= cache('redis');
			
			redis.put({"my": "baz"}, "boo", function (err, success) {
				should.not.exist(err);
				should.exist(success);
				success.should.be.ok;
				
				redis.get("boo", function (err, value) {
					should.not.exist(err);
					should.exist(value);
					value.should.eql({"my": "baz"});
					done();
				});
			});
		});
	});
	
	describe('#put', function (done) {
		it("should call the engine's put method once", function (done) {
			mock.expects("put").once().withArgs(test_data, test_hash, spy, "test", 1000);
			mock_cache.put(test_data, test_key, spy, "test", 1000);
			mock.verify();
			done();
		});
	});
	
	describe('#get', function () {
		it("should call the engine's get method", function (done) {
			mock.expects("get").once().withArgs(test_hash, spy, "test");
			mock_cache.get(test_key, spy, "test");
			mock.verify();
			done();
		});
	});
	
	describe('#del', function () {
		it("should call the engine's del method", function (done) {
			mock.expects("del").once().withArgs(test_hash, spy, "test");
			mock_cache.del(test_key, spy, "test");
			mock.verify();
			done();
		});
	});
	
	describe('#clear', function () {
		it("should call the engine's clear method", function (done) {
			mock.expects("clear").once().withArgs(spy);
			mock_cache.clear(spy);
			mock.verify();
			done();
		});
	});
});