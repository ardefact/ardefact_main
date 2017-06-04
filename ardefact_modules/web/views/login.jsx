var React = require('react');
import $ from 'jquery';
import Cookies from '../lib/js.cookie-2.1.4.min';

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
    event.preventDefault();
    //alert('A name was submitted: ' + JSON.stringify(this.state));
    const self = this;
    const email = this.state.email;
    const password = this.state.password;

    $.post({
             url: '/a/login',
             data: {
               email: email,
               password: password,
               csrf_token: Cookies.get("csrf_token"),
             },
             success: function(data, textStatus, response) {
               const res = JSON.parse(response.responseText);
               Cookies.set("auth_token", res['results']['hid'] + ',' + res['results']['auth_token']);
               window.location = "/";
             },
             error: function(r,ts) {
               alert("Please try again");
             }
           });
  }

  render() {
    console.log("Rendering login page...");
    return (
      <center>
      <div className="wrapper">
        <div className="container">
          <div className="logo"><img src="ardefact-logo.png"/></div>

          <form className="form" onSubmit={this.handleSubmit}>
            <input className="autogrow" type="text" placeholder="Email" id="email" onChange={this.handleChange}/>
            <input className="autogrow" type="password" placeholder="Password" id="password" onChange={this.handleChange}/>
            <input type="submit" value="Sign in" id="login-button" />
          </form>
        </div>

      </div>
      </center>
    );
  }
}

//module.exports = LoginForm;
export default LoginForm;
