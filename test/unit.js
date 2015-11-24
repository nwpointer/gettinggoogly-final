var assert = require('assert');
free = require('../dist/calculateFreeTimes.js')
// describe('Array', function() {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       assert.equal(-1, [1,2,3].indexOf(5));
//       assert.equal(-1, [1,2,3].indexOf(0));
//     });
//   });
// });

describe("free time calculater", function(){
	it('should handle busy times on the begining time range', function () {
	      range = {
	      	start: "2004-09-20T13:00:00",
	      	end:   "2004-09-21T13:00:00"
	      }
	      busy = [
	      	{
	      		start: "2004-09-20T13:00:00",
	      		end:   "2004-09-20T14:00:00"
	      	}
	      ]

	      assert.deepEqual(
	      	[ "2004-09-20T14:00:00", "2004-09-21T13:00:00" ],
	      	free.calculate(range,busy)
	      );
	});
	it('should handle busy times on the end of or beyond a time range', function () {
	      range = {
	      	start: "2004-09-20T13:00:00",
	      	end:   "2004-09-21T13:00:00"
	      }
	      busy = [
	      	{
	      		start: "2004-09-21T12:00:00",
	      		end:   "2004-09-21T15:00:00"
	      	}
	      ]

	      assert.deepEqual(
	      	[ "2004-09-20T13:00:00", "2004-09-21T12:00:00" ],
	      	free.calculate(range,busy)
	      );
	});
	it('should handle multiple, potentially overlapping busy times', function () {
	      range = {
	      	start: "2004-09-20T13:00:00",
	      	end:   "2004-09-21T13:00:00"
	      }
	      busy = [
	      	{
	      		start: "2004-09-20T13:00:00",
	      		end:   "2004-09-20T14:00:00"
	      	},
	      	{
	      		start: "2004-09-20T13:30:00",
	      		end:   "2004-09-20T15:00:00"
	      	},
	      	{
	      		start: "2004-09-21T10:30:00",
	      		end:   "2004-09-21T12:00:00"
	      	},
	      ]

	      assert.deepEqual(
	      	[ '2004-09-20T15:00:00','2004-09-21T10:30:00',
	      	  '2004-09-21T12:00:00','2004-09-21T13:00:00' ],
	      	free.calculate(range,busy)
	      );
	});
});
describe("time length", function(){
	it("should return 0 when passed two identical times", function(){
			assert.equal(0,free.length(
			"2004-09-20T13:00:00",
			"2004-09-20T13:00:00"
		));
	})
	it("should return 1 when when passed two times who difference is 1 unit length", function(){
		assert.equal(1,free.length(
			"2004-09-20T13:00:00",
			"2004-09-20T13:15:00"
		));
	})
	it("should handle multi day time spans", function(){
		assert.equal(192,free.length(
			"2004-09-20T13:00:00",
			"2004-09-22T13:00:00"
		));
	})
})

describe("braket", function(){
	it("should return and array of the correct size", function(){
		assert.equal(8, free.braket(8, 1, 0, 1).length);
	})
	it("should return busy times of the correct length", function(){
		braket = free.braket(8,3,0,1)
		assert.equal(1,braket[0])
		assert.equal(1,braket[1])
		assert.equal(1,braket[2])
		assert.equal(0,braket[3])
	})
	it("should correctly offset time spans", function(){
		braket = free.braket(8,3,3,1)
		assert.equal(1,braket[0+3])
		assert.equal(1,braket[1+3])
		assert.equal(1,braket[2+3])
		assert.equal(0,braket[3+3])
	})
	it("should correct return a initial free times braket", function(){
		braket = free.braket(8)
		braket.forEach(function(v){
			assert.equal(0,v)
		})
	})
})

describe("Array(braket) OR",function(){
	it('should match logic table',function(){
		a = [1,0,0,1]
		b = [0,1,0,1]
		ored = free.OR(a,b)
		assert.equal(1,ored[0])
		assert.equal(1,ored[1])
		assert.equal(0,ored[2])
		assert.equal(1,ored[3])
	})
})

