# idkchain

```
npm install
alias truffle=$PWD/node_modules/.bin/truffle
alias testrpc=$PWD/node_modules/.bin/testrpc
truffle migrate
truffle watch &
testrpc &
./serve.js &
```

http://localhost:8080/

## Debug

```
curl -v -H "Content-Type: application/json" -X POST -d '{"question":"what is life?"}' http://localhost:8080/api/submit
echo .dump | sqlite3 idk.sqlite3
```