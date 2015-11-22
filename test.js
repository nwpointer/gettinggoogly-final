moment = require('moment');

UNIT = 1/15; // every fifteen minutes
FORMAT = "DD/MM/YYYY HH:mm";

function timeUnits(now, then, format, unit) {
	format = format || FORMAT;
	unit = unit || UNIT;
	now = moment(now, format)
	then = moment(then, format)
	return moment.duration(then.diff(now)).asMinutes()*unit
}

function braket(size, span, offset, v){
	span = span || size;
	v = v || 0
	offset = offset || 0;
	arr =[];
	for(i=0; i<size; i++){
		arr[i] = i<offset || i>span+offset-1 ?  0 : v
	}
	return arr;
}

function NOR(a,b){
	return a.map((v,i)=>{return (a[i] || (b[i] || 0)) } );
}



// 01: establish valid range and busy times
range = {
	start: "04/09/2013 15:00",
	end: "04/09/2013 18:15"
}
busy = [
	{
		start: "04/09/2013 15:30",
		end: "04/09/2013 16:15"
	},
	{
		start: "04/09/2013 16:30",
		end: "04/09/2013 16:45"
	},
	{
		start: "04/09/2013 17:45",
		end: "04/09/2013 18:15"
	}
]


// 02: convert range and busy to type:brakets
var size = timeUnits(range.start, range.end)

busyBrakets = busy.map((b)=>{
	var span = timeUnits(b.start, b.end)
	var offset = timeUnits(range.start, b.start)
	return braket(size, span, offset, 1);
})



// 03: reduce list of brakets with or function
// 0 = free
free = busyBrakets.reduce((p,c,i)=>{
	return NOR(p,c)
}) 

console.log(free)


// GET RID OF THESE
touchesEnd = (i,c)=>{
	return i==arr.length-1 && c==0
}
touchesBegining = (i,c)=>{
	return i==1 && c==0
}


// 04: convert to moments
// push busies on either end to avoid this mess:
free.reduce((p, c, i, arr)=>{
	E = touchesEnd(i,c)
	B = touchesBegining(i,c)
	modifier = E ? 1 : 0
	modifier = B ? -1 : 0
	if (p!=c || E || B){
		console.log(moment(range.start, FORMAT).add((i+modifier)*15, 'minutes').format(FORMAT));
	}
	return c
});
