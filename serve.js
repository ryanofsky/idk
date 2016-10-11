#!/usr/bin/env node

// Based on https://github.com/reactjs/react-tutorial/blob/master/server.js

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose()

var db = new sqlite3.Database(path.join(__dirname, 'idk.sqlite3'));
db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS questions (" +
         "  id INTEGER PRIMARY KEY, question TEXT);");
});

var app = express();
app.set('port', (process.env.PORT || 8080));

app.use('/', express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.post('/api/submit', function(req, res) {
  console.log("got question", req.body);
  db.run("INSERT INTO questions(question) " +
         "VALUES (?)", req.body.question, function(err, row) {
    if (err) {
      console.err(err);
      res.status(500);
      res.end();
      return;
    }
    console.log("inserted");
    console.log("inserted row", this.lastID);
    res.json({"success": true});
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
