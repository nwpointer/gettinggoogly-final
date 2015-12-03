var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express();

app.use(express.static("./"));

app.get('/',function(req, res){
	res.send('hellow');
})

var server = app.listen(8000, function(){
	console.log('working')
	// Connect to the db
	MongoClient.connect("mongodb://localhost:27017/meetme", function(err, db) {
	  if(!err) {
	    console.log("db connected");
	  }
	});
})