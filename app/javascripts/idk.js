var QUESTIONS_URL = "/api/questions";
var QUESTION_URL = "/api/question";
var SUBMIT_URL = "/api/submit";

// Page layout:
//   - Content
//     - One of:
//       - LoginForm
//       - Menu
//       - NewPostForm
//     - Optional:
//       - Question
//     - QuestionList

var Content = React.createClass({
  getInitialState: function() {
    return {username: ''};
  },

  handleLoginSubmit: function(username) {
    this.setState({username: username});
  },

  handleNewQuestion: function() {
    this.setState({newQuestion: true});
  },

  handleQuestionPost: function(question) {
    this.setState({newQuestion: false});
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
    var content;
    if (this.state.newQuestion) {
      content = (<NewPostForm onPost={this.handleQuestionPost} />);
    } else if (this.state.username) {
      content = (<Menu username={this.state.username.username}
                 onNewQuestion={this.handleNewQuestion} />);
    } else {
      content = (<LoginForm onLoginSubmit={this.handleLoginSubmit} />);
    }
    var answers;
    if (this.state.showQuestion !== undefined) {
      var answers = (<Question key={this.state.showQuestion}
                               questionId={this.state.showQuestion}
                               username={this.state.username.username} />);
    }
    return (<div>
              {content}
              {answers}
              <hr />
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

  render: function() {
    return (
        <div>
        <p>Hello, {this.props.username}.</p>
        <ul>
        <li><a href="#" onClick={this.handleNewQuestionClick}>New question</a></li>
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
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("Error retrieving answers. Status", status, "error", err.toString());
      }.bind(this)
    });
  },

  handleNewAnswerClick: function(e) {
    e.preventDefault();
    this.setState({newAnswer: true});
  },

  handleNewPledgeClick: function(e) {
    e.preventDefault();
    // FIXME: Implement
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

  render: function() {
    if (!this.state || !this.state.data) {
      return(<div>Loading question {this.props.questionId}...</div>);
    }
    var items = this.state.data.answers.map(function(answer) {
      return (<li key={answer.answerId}>&ldquo;{answer.answer}&rdquo; by <em>{answer.username}</em></li>);
    }.bind(this));
    if (items.length == 0) {
      items.push(<li key="invalid"><em>No answers posted yet.</em></li>);
    }

    var menu;
    if (this.state.newAnswer) {
      menu = (<NewPostForm onPost={this.handleAnswerPost} answer={true} />);
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
              <ul>{items}</ul>
              {menu}
            </div>);
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
