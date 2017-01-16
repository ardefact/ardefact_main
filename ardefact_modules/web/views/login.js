import React from 'react';

import ArdefactConfig from 'config';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    var state = this.state;
    state[event.target.id] = event.target.value;
    this.setState(state);
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + JSON.stringify(this.state));
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Email:
          <input type="text" id="email" onChange={this.handleChange} />
        </label>
        <br/>
        <label>
          Password:
            <input type="password" id="password" onChange={this.handleChange} />
          </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default LoginForm;
