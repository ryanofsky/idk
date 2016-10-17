# IdkChain

IdkChain is a simple Q&A app, designed to allow users to:

* Post questions to be answered
* Answer previously posted questions
* Pledge ether to incentivize other users to answer a question before a deadline
* Distribute ether after a pledge deadline passes
* Deposit ether to be pledged
* Withdraw previously deposited or earned ether.

## Setup Instructions

```
npm install
alias truffle=$PWD/node_modules/.bin/truffle
alias testrpc=$PWD/node_modules/.bin/testrpc
testrpc &
truffle migrate
truffle watch &
./serve.js &
```

Then navigate to http://localhost:8080/

## Status

There's a bug where balances and deadlines of all pledges are all displayed as 0.

Much but not all of the essential functionality is currently implemented.
There's a bare-bones UI for posting questions and answers, and pledging ether to
questions.

The major missing features are:

* UIs for resolving pledges or withdrawing either (the underlying smart
  contract functions are implemented).
* Real logins / identities. Would need some identity layer or integration with a
  system like [uPort](https://uport.me/) to actually be useful.

Other possible TODOS:

* Store current username in cookie, add logout link so don't have to refresh
  when switching users.
* Refactor and clean up up lots major code duplication in serve.js and idk.js.
* Clean up javascript deployment. Use webpack instead of in-browser babel
  transforme for JSX code.
* Get rid of jquery dependency (used as XHR wrapper)
* Decentralize Q&A storage instead of using sqlite.

## Useful debug commands

```
curl -v -H "Content-Type: application/json" -X POST -d '{"question":"what is life?", "username":"russ"}' http://localhost:8080/api/submit
curl -v -H "Content-Type: application/json" -X POST -d '{"questionId":1, "answer": "idk", "username":"sam"}' http://localhost:8080/api/submit
curl -v http://localhost:8080/api/questions
curl -v http://localhost:8080/api/question/1
echo .dump | sqlite3 idk.sqlite3
```