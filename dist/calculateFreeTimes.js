'use strict';

if (typeof module !== 'undefined' && module.exports) {
	// if executing on the node runtime, require..
	var moment = require('moment');
}

var UNIT = 1 / 15; // every fifteen minutes
var FORMAT = "YYYY-MM-DDTHH:mm:ss";

function length(now, then, format, unit) {
	var format = format || FORMAT;
	var unit = unit || UNIT;
	var now = moment(now, format);
	var then = moment(then, format);
	return moment.duration(then.diff(now)).asMinutes() * unit;
}

function braket(size, span, offset, v) {
	var span = span || size;
	var v = v || 0;
	var offset = offset || 0;
	var arr = [];

	for (var i = 0; i < size; i++) {
		arr[i] = i < offset || i > span + offset - 1 ? 0 : v;
	}
	return arr;
}

function OR(a, b) {
	return a.map(function (v, i) {
		return a[i] || b[i] || 0;
	});
}

function calculateFreeTimes(range, busy) {
	if (busy.length == 0) return range;
	// 01: convert range and busy to type:brakets
	var size = length(range.start, range.end);

	var busyBrakets = busy.map(function (b) {
		var span = length(b.start, b.end);
		var offset = length(range.start, b.start);
		return braket(size, span, offset, 1);
	});

	// 02: reduce list of brakets with or function
	// 0 = indicates free period of length unit
	var free = busyBrakets.reduce(function (p, c, i) {
		return OR(p, c);
	});

	// adds 1 on either side to insure times always come in pairs
	free.unshift(1);
	free.push(1);

	// 02: convert to moments
	// push busies on either end to avoid this mess:
	var freeTimeRanges = [];
	free.reduce(function (p, c, i) {
		if (p != c) {
			freeTimeRanges.push(moment(range.start, FORMAT).add((i - 1) * 15, 'minutes').format(FORMAT));
		}
		return c;
	});
	return freeTimeRanges;
}

function rangeFormat(times) {
	if (typeof times[0] != "string") {
		return [times];
	}
	var ranges = [];
	times.reduce(function (p, c, i, arr) {
		if (i % 2 == 1) {
			ranges.push({ start: p, end: c });
		}
		return c;
	});
	return ranges;
}