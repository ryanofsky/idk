var SUBMIT_URL = "/api/submit";

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

  handleQuestionSubmit: function(question) {
    console.log("FIXME: create question", question);
    this.setState({newQuestion: false});
    // FIXME: Don't really need jQuery for this.
    $.ajax({
      url: SUBMIT_URL,
      dataType: 'json',
      type: 'POST',
      data: question,
      success: function(response) {
        console.log("Posted question", question);
        console.log("Got response", response);
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("Error posting question", question, "status", status, "error", err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var content;
    if (this.state.newQuestion) {
      content = (<NewQuestionForm onQuestionSubmit={this.handleQuestionSubmit} />);
    } else if (this.state.username) {
      content = (<Menu username={this.state.username.username}
                 onNewQuestion={this.handleNewQuestion} />);
    } else {
      content = (<LoginForm onLoginSubmit={this.handleLoginSubmit} />);
    }
    return (content);
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
        <form onSubmit={this.handleSubmit}>
        <p>Enter user name to log in.</p>
        <input
          type="text"
          placeholder="username"
          value={this.state.username}
          onChange={this.handleUsernameChange}
        />
        <input type="submit" value="Log in" />
      </form>
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

var NewQuestionForm = React.createClass({
  getInitialState: function() {
    return {question: ''};
  },
  handleQuestionChange: function(e) {
    this.setState({question: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var question = this.state.question.trim();
    if (!question) {
      return;
    }
    this.props.onQuestionSubmit({question: question});
  },
  render: function() {
    return (
        <form onSubmit={this.handleSubmit}>
        <p>Enter your question.</p>
        <div><textarea rows="10" cols="80"
              placeholder="Why do things happen?"
              onChange={this.handleQuestionChange}
              value={this.state.question} /></div>
        <div><input type="submit" value="Post Question" /></div>
        </form>
    );
  }
});

ReactDOM.render(<Content />, document.getElementById('content'));
