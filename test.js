//test stuff
free = require('./dist/calculateFreeTimes.js')

range = {
	start: "04/09/2013 15:00",
	end: "04/09/2013 20:15"
}
busy = [
	{
		start: "04/09/2013 15:15",
		end: "04/09/2013 16:15"
	}
]

console.log(free.calculate(range, busy));
console.log(free.rangeFormat(free.calculate(range, busy)))



