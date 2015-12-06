var MongoClient = require('mongodb').MongoClient
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var keyGen = require('./public/dist/keyGen.js')

app.use(express.static("./public/"));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Routes
app.post('/', function (req, res) {
  // res.send(req.body.state);
  saveMeeting({state: req.body.state}, req, res);
});

app.post('/delete', function (req, res) {
  // res.send(req.body.key);
  removeMeeting(req.body.key, req, res);
  // saveMeeting({state: req.body.state}, req, res);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname+ "/index.html");
});

app.get('/cal/:calKey',function(req, res){
  findMeeting(req.params.calKey, res);
});


// Helpers
findMeeting = function(key, res){
  console.log('asdfasdf');
  var collection = app.db.collection('meetings');
  collection.findOne({key:key}, function(err, meeting){
    if (err){
      throw err;
      console.log(meeting);
    }
    res.cookie('meeting', meeting.state);
    res.sendFile(__dirname+ "/index.html");
  });
}

removeMeeting = function(key, req, cb){
  var collection = app.db.collection('meetings');
  collection.remove({key:key}, function(err, res){
      if(err) throw err
      cb.send('deleted proposal ' + key);
  })
}

saveMeeting = function(data, req, cb){
  var collection = app.db.collection('meetings');
  collection.insert(data, function(err, res){
      if(err) throw err
      key = keyGen.generate(Date.now(), res.insertedIds)
      saveMeetingKey(res.insertedIds[0], key, req, cb)
  })
}

saveMeetingKey = function(id,key, req, cb){
  var collection = app.db.collection('meetings');
  collection.update({_id:id}, {$set:{key:key}}, (function(err, items) {
    if(err){throw err}
    cb.cookie("calowns", JSON.stringify({key:key}));
    cb.send(req.get('host') + req.originalUrl + "cal/"+key)
  }));
}

// start server
var server = app.listen(8000, function(){
	console.log('working')
	// Connect to the db
	MongoClient.connect("mongodb://localhost:27017/meetme", function(err, db) {
	  if(!err) {
	    console.log("db connected");
	    app.db = db;
	  }
	});
})