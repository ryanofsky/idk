var QUESTIONS_URL = "/api/questions";
var QUESTION_URL = "/api/question";
var SUBMIT_URL = "/api/submit";

// Page layout:
//   - Content
//     - One of:
//       - LoginForm
//       - Menu
//     - One of:
//       - Question
//       - NewPostForm
//     - QuestionList

var Content = React.createClass({
  getInitialState: function() {
    return {username: ''};
  },

  handleLoginSubmit: function(username) {
    this.setState({username: username});
  },

  handleLogout: function() {
    this.setState({username: ''});
  },

  handleNewQuestion: function() {
    this.setState({showQuestion: true});
  },

  handleQuestionPost: function(question) {
    this.setState({showQuestion: null});
    if (question !== null) {
      submitPost({question: question,
                  username: this.state.username.username}).then(function() {
        this.refs.questionList.loadQuestions();
      }.bind(this));
    }
  },

  handleExistingQuestion: function(questionId) {
    console.log("handleExistingQuestion", questionId);
    this.setState({showQuestion: questionId});
  },

  render: function() {
    var menu;
    if (this.state.username) {
      menu = (<Menu username={this.state.username.username}
                 onLogout={this.handleLogout}
                 onNewQuestion={this.handleNewQuestion} />);
    } else {
      menu = (<LoginForm onLoginSubmit={this.handleLoginSubmit} />);
    }

    var question;
    if (this.state.showQuestion === true) {
      question = (<NewPostForm onPost={this.handleQuestionPost} />);
    }
    else if (this.state.showQuestion) {
      question = (<Question key={this.state.showQuestion}
                            questionId={this.state.showQuestion}
                            username={this.state.username.username} />);
    }
    return (<div>
              {menu}<hr />
              {question}{question ? (<hr />) : null}
              <QuestionList onExistingQuestion={this.handleExistingQuestion}
                            questionId={this.state.showQuestion}
                            ref="questionList" />
            </div>);
  }
});

var LoginForm = React.createClass({
  getInitialState: function() {
    return {username: ''};
  },
  handleUsernameChange: function(e) {
    this.setState({username: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.state.username.trim();
    if (!username) {
      return;
    }
    this.props.onLoginSubmit({username: username});
  },
  render: function() {
    return (
        <div>
        <form onSubmit={this.handleSubmit}>
        Login:
        <input
          type="text"
          placeholder="username"
          value={this.state.username}
          onChange={this.handleUsernameChange}
        />
        <input type="submit" value="Log in" />
        </form>
        </div>
    );
  }
});

var Menu = React.createClass({
  handleNewQuestionClick: function(e) {
    e.preventDefault();
    this.props.onNewQuestion();
  },

  handleLogoutClick: function(e) {
    e.preventDefault();
    this.props.onLogout();
  },

  render: function() {
    return (
        <div>
        <p>Hello, {this.props.username}.</p>
        <ul>
        <li><a href="#" onClick={this.handleNewQuestionClick}>New question</a></li>
        <li>Deposit Ether (<em>unimplemented</em>)</li>
        <li>Withdraw Ether (<em>unimplemented</em>)</li>
        <li>Resolve Pledges (<em>unimplemented</em>)</li>
        <li><a href="#" onClick={this.handleLogoutClick}>Log out</a></li>
        </ul>
        </div>
    );
  }
});

var NewPostForm = React.createClass({
  getInitialState: function() {
    return {text: ''};
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.state.text.trim();
    if (!text) {
      return;
    }
    this.props.onPost(text);
  },

  handleCancel: function(e) {
    this.props.onPost(null);
  },

  render: function() {
    return (
        <form onSubmit={this.handleSubmit}>
        <p>Enter your {this.props.answer ? "answer" : "question"}.</p>
        <div><textarea rows="10" cols="80"
              placeholder={this.props.answer ? "The answer is..." : "Why do things happen?"}
              onChange={this.handleTextChange}
              value={this.state.text} /></div>
        <div>
          <input type="submit" value={"Post " + (this.props.answer ? "Answer" : "Question")} />
          <input type="button" value="Cancel" onClick={this.handleCancel} />
        </div>
        </form>
    );
  }
});

var QuestionList = React.createClass({
  componentDidMount: function() {
    this.loadQuestions();
  },

  loadQuestions: function() {
    $.ajax({
      url: QUESTIONS_URL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("Error retrieving questions. Status", status, "error", err.toString());
      }.bind(this)
    });
  },

  handleClick: function(questionId, e) {
    console.log("click", questionId, e);
    e.preventDefault();
    this.props.onExistingQuestion(questionId);
  },

  render: function() {
    if (!this.state || !this.state.data) {
      return(<div>Loading questions...</div>);
    }
    var items = this.state.data.questions.map(function(question) {
      var text = question.questionId === this.props.questionId ?
          (<span>&ldquo;{question.question}&rdquo;</span>) :
          (<a href="#" onClick={this.handleClick.bind(null, question.questionId)}>{question.question}</a>);
      return (<li key={question.questionId}>{text} by <em>{question.username}</em></li>);
    }.bind(this));
    return (<div><div>Question List:</div><ul>{items}</ul></div>);
  }
});

var Question = React.createClass({
  componentDidMount: function() {
    this.loadQuestion();
  },

  loadQuestion: function() {
    var questionUrl = QUESTION_URL + "/" + this.props.questionId;
    $.ajax({
      url: questionUrl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
        this.loadPledges();
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("Error retrieving answers. Status", status, "error", err.toString());
      }.bind(this)
    });
  },

  loadPledges: function() {
    var idk = Idk.deployed();
    Promise.all(this.state.data.pledges.map(function(pledge) {
      return Promise.all([
        // FIXME: There is some problem here, returned deadlines and amounts always coming back as 0.
        idk.getPledgeDeadline.call(pledge.pledgeId).then(function(val) { pledge.deadline = val.toString(); }),
        idk.getPledgeAmount.call(pledge.pledgeId).then(function(val) { pledge.amount = val.toString(); }),
        idk.getPledgeDisbursed.call(pledge.pledgeId).then(function(val) { pledge.disbursed = val; }),
      ]).then(function() { return pledge; });
    })).then(function(pledges) { this.setState({pledges: {pledges: pledges}}); }.bind(this));
  },

  handleNewAnswerClick: function(e) {
    e.preventDefault();
    this.setState({newAnswer: true});
  },

  handleNewPledgeClick: function(e) {
    e.preventDefault();
    this.setState({newPledge: true});
  },

  handleAnswerPost: function(answer) {
    this.setState({newAnswer: false});
    if (answer !== null) {
      submitPost({answer: answer,
                  username: this.props.username,
                  questionId: this.props.questionId}).then(function() {
        this.loadQuestion();
      }.bind(this));
    }
  },

  handleNewPledge: function(amount, deadline) {
    this.setState({newPledge: false});
    if (amount) {
      var idk = Idk.deployed();
      submitPost({pledge: true,
                  username: this.props.username,
                  questionId: this.props.questionId})
        .then(function(response) {
          var pledgeId = response.lastId;
          console.log("Added pledge row id", pledgeId);
          return idk.deposit({from: window.accounts[0], value: amount})
            .then(function() {
              console.log("Called Idk.deposit, id", pledgeId, "amount", amount, "deadline", deadline);
              return idk.pledge(pledgeId, amount, deadline, {from: window.accounts[0]});
            }).then(function() {
              console.log("Called Idk.pledge");
            });
        }).then(function() {
          console.log("Finished pledge");
          this.loadQuestion();
        }.bind(this));
    }
  },

  render: function() {
    // FIXME: Need to retrieve and display pledges.
    if (!this.state || !this.state.data) {
      return(<div>Loading question {this.props.questionId}...</div>);
    }
    var answers = this.state.data.answers.map(function(answer) {
      return (<li key={answer.answerId}>&ldquo;{answer.answer}&rdquo; by <em>{answer.username}</em></li>);
    }.bind(this));
    if (answers.length == 0) {
      answers.push(<li key="invalid"><em>No answers posted yet.</em></li>);
    }

    var pledges;
    if (this.state.pledges) {
      pledges = this.state.pledges.pledges.map(function(pledge) {
        return (<li key={pledge.pledgeId}>
                Id {pledge.pledgeId},
                Amount {pledge.amount},
                Deadline {pledge.deadline},
                Disbursed {pledge.disbursed ? "Yes" : "No"}{" "}
                by <em>{pledge.username}</em></li>);
      }.bind(this));
      if (pledges.length == 0) {
        pledges.push(<li key="invalid"><em>No pledges posted yet.</em></li>);
      }
    } else {
      pledges = [(<li key="invalid"><em>Loading pledge information...</em></li>)];
    }

    var menu;
    if (this.state.newAnswer) {
      menu = (<NewPostForm onPost={this.handleAnswerPost} answer={true} />);
    } else if (this.state.newPledge) {
      menu = (<NewPledgeForm onPost={this.handleNewPledge} />);
    } else if (this.props.username) {
      menu = (
        <div>
          <div><a href="#" onClick={this.handleNewAnswerClick}>Add new answer...</a></div>
          <div><a href="#" onClick={this.handleNewPledgeClick}>Add new pledge...</a></div>
        </div>
      );
    } else {
      menu = (<div><em>Log in with a username to add an answer or pledge to this question.</em></div>);
    }

    return (<div>
              <div>Question: &ldquo;{this.state.data.question}&rdquo;
                by <em>{this.state.data.username}</em>
              </div>
              Answer List:
              <ul>{answers}</ul>
              Pledge List:
              <ul>{pledges}</ul>
              {menu}
            </div>);
  }
});

var NewPledgeForm = React.createClass({
  getInitialState: function() {
    return {amount: '1000', deadline: '0'};
  },
  handleAmountChange: function(e) {
    this.setState({amount: e.target.value});
  },
  handleDeadlineChange: function(e) {
    this.setState({deadline: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onPost(parseInt(this.state.amount), parseInt(this.state.deadline));
  },
  handleCancel: function(e) {
    this.props.onPost();
  },
  render: function() {
    return (
        <div>
        <div>Add new pledge:</div>
        <form onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="pledgeAmount">Amount:</label>
          <input id="pledgeAmount" type="text" placeholder="1000" value={this.state.amount} onChange={this.handleAmountChange} />
        </div>
        <div>
          <label htmlFor="pledgeDeadline">Deadline:</label>
          <input id="pledgeDeadline" type="text" placeholder="0" value={this.state.deadline} onChange={this.handleDeadlineChange} />
        </div>
        <div>
          <input type="submit" value="Submit" />
          <input type="button" value="Cancel" onClick={this.handleCancel} />
        </div>
        </form>
        </div>
    );
  }
});

ReactDOM.render(<Content />, document.getElementById('content'));

function submitPost(data) {
  // FIXME: Don't really need jQuery for this.
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: SUBMIT_URL,
      dataType: 'json',
      type: 'POST',
      data: data,
      success: function(response) {
        console.log("Submitted data", data);
        console.log("Got response", response);
        resolve(response);
      },
      error: function(xhr, status, err) {
        console.log("Error submitting data", data, "status", status, "error", err.toString());
        reject({xhr: xhr, status: status, err: err});
      }
    });
  });
}
