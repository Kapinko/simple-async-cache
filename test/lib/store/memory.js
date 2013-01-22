var should	= require('chai').should();

describe('memory', function () {
	var memory, store; 
	
	beforeEach(function (done) {
		store	= {
			"foo": {
				"value": "bar",
				"ttl": 1000,
				"timestamp": (new Date()).getTime()
			},
			'blah': {
				"value": "foo",
				"ttl": 2000,
				"timestamp": (new Date()).getTime()
			}
		};
		memory	= require(__dirname + '/../../../lib/store/memory')({
			"store": store
		});
		done();
	});
	
	describe('#put', function () {
		it('should add the given value to the given key', function (done) {
			memory.put('blah', 'baz', function (err, success) {
				success.should.be.ok;
				store.should.have.property('baz');
				store.baz.should.have.property('value','blah');
				done();
			});
		});
	});
	
	describe("#get", function () {
		it('should give a null value for a non existant key', function (done) {
			memory.get('bar', function (err, value) {
				should.not.exist(value);
				done();
			});
		});
		it('should give back the proper value for an existing key', function (done) {
			memory.get('foo', function (err, value) {
				value.should.eql('bar');
				done();
			});
		});
	});
	
	describe("#del", function () {
		it("should remove the given key from the store", function (done) {
			memory.del('foo', function (err, success) {
				success.should.be.ok;
				store.should.not.have.property('foo');
				done();
			});
		});
	});
	
	describe ("#clear", function () {
		it("should clear the current cache store", function (done) {
			memory.clear(function (err, success) {
				success.should.be.ok;
				store.should.not.have.keys('foo','blah');
				done();
			});
		});
	});
});