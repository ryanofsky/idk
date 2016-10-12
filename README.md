# idkchain

```
npm install
alias truffle=$PWD/node_modules/.bin/truffle
alias testrpc=$PWD/node_modules/.bin/testrpc
testrpc &
truffle migrate
truffle watch &
./serve.js &
```

http://localhost:8080/

## Debug

```
curl -v -H "Content-Type: application/json" -X POST -d '{"question":"what is life?", "username":"russ"}' http://localhost:8080/api/submit
curl -v -H "Content-Type: application/json" -X POST -d '{"questionId":1, "answer": "idk", "username":"sam"}' http://localhost:8080/api/submit
curl -v http://localhost:8080/api/questions
curl -v http://localhost:8080/api/question/1
echo .dump | sqlite3 idk.sqlite3
```