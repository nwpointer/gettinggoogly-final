//test stuff

range = {
	start: "04/09/2013 15:00",
	end: "04/09/2013 18:15"
}
busy = [
	{
		start: "04/09/2013 15:15",
		end: "04/09/2013 16:15"
	},
	{
		start: "04/09/2013 17:45",
		end: "04/09/2013 18:00"
	}
]

console.log(calculateFreeTimes(range, busy));
console.log(rangeFormat(calculateFreeTimes(range, busy)))


