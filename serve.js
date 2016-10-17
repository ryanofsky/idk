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
         "  questionId INTEGER PRIMARY KEY, " +
         "  username TEXT NOT NULL, " +
         "  question TEXT NOT NULL);");
  db.run("CREATE TABLE IF NOT EXISTS answers (" +
         "  answerId INTEGER PRIMARY KEY, " +
         "  questionId INTEGER NOT NULL, " +
         "  username TEXT NOT NULL, " +
         "  answer TEXT NOT NULL, " +
         "  FOREIGN KEY(questionId) REFERENCES questions(questionId));");
  db.run("CREATE TABLE IF NOT EXISTS pledges (" +
         "  pledgeId INTEGER PRIMARY KEY, " +
         "  questionId INTEGER NOT NULL, " +
         "  username TEXT NOT NULL, " +
         "  FOREIGN KEY(questionId) REFERENCES questions(questionId));");
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

app.get('/api/questions', function(req, res) {
  var data = {questions: []};
  db.each("SELECT questionId, question, username FROM questions ORDER BY questionId DESC",
    function(err, row) {
      if (err) {
        console.error(err);
        res.status(500);
        res.end();
        return;
      }
      console.log("got row", row);
      data.questions.push(row);
    },
    function(err, rowcount) {
      if (err) {
        console.error(err);
        res.status(500);
        res.end();
        return;
      }
      res.json(data);
    });
});

app.get('/api/question/:id', function(req, res) {
  var id = req.params.id;
  // FIXME: Dedup these SQL queries and chain with promises instead of using
  // nested callbacks.
  db.get("SELECT questionId, question, username " +
         "FROM questions WHERE questionId = ?", id,
    function(err, row) {
      if (err) {
        console.error(err);
        res.status(500);
        res.end();
        return;
      }
      if (!row) {
        console.error("Question not found", {id: id});
        res.status(404);
        res.end();
        return;
      }
      var question = row;
      question.answers = [];
      question.pledges = [];

      db.each("SELECT answerId, answer, username " +
              "FROM answers WHERE questionId = ?", id,
        function(err, row) {
          if (err) {
            console.error(err);
            res.status(500);
            res.end();
            return;
          }
          console.log("got row", row);
          question.answers.push(row);
        },
        function(err, rowcount) {
          if (err) {
            console.error(err);
            res.status(500);
            res.end();
            return;
          }

          db.each("SELECT pledgeId, username " +
                  "FROM pledges WHERE questionId = ?", id,
            function(err, row) {
              if (err) {
                console.error(err);
                res.status(500);
                res.end();
                return;
              }
              console.log("got pledge", row);
              question.pledges.push(row);
            },
            function(err, rowcount) {
              if (err) {
                console.error(err);
                res.status(500);
                res.end();
                return;
              }
              res.json(question);
            });
        });

    });
});

app.post('/api/submit', function(req, res) {
  console.log("got submit request", req.body);
  var sql, params;
  if (req.body.question) {
    sql = "INSERT INTO questions(username, question) VALUES (?, ?)";
    params = [req.body.username, req.body.question];
  } else if (req.body.answer) {
    sql = "INSERT INTO answers(questionId, username, answer) VALUES (?, ?, ?)";
    params = [req.body.questionId, req.body.username, req.body.answer];
  } else if (req.body.pledge) {
    sql = "INSERT INTO pledges(questionId, username) VALUES (?, ?)";
    params = [req.body.questionId, req.body.username];
  }
  db.run(sql, params, function(err, row) {
    if (err) {
      console.error(err);
      res.status(500);
      res.end();
      return;
    }
    console.log("inserted row", this.lastID);
    res.json({success: true, lastId: this.lastID});
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
