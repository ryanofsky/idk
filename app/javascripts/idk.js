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
    render: function() {
      return (<div>Hi {this.props.username}</div>);
    }
});

var Content = React.createClass({
  getInitialState: function() {
    return {username: ''};
  },

  handleLoginSubmit: function(username) {
    this.setState({username: username});
  },

  render: function() {
    var content;
    if (this.state.username) {
      content = (<Menu username={this.state.username.username} />);
    } else {
      content = (<LoginForm onLoginSubmit={this.handleLoginSubmit} />);
    }
    return (content);
  }
});

ReactDOM.render(<Content />, document.getElementById('content'));
