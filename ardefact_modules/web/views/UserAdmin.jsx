var React = require('react');
var _     = require('lodash');

import $ from 'jquery';

class UserAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.userAddForm = {};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      resultBanner : <div></div>,
      userAddForm  : this.userAddForm,
    }
    ;
  }

  handleChange(event) {
    this.userAddForm[event.target.name] = event.target.value;
    this.setState(
      {
        resultBanner: this.state.resultBanner,
        userAddForm: this.userAddForm
      }
    );
  }

  handleSubmit() {
    const self = this;
    const data = _.extend({action : "add"}, this.userAddForm);
    $.post(
      {
        url     : '/user_admin',
        data    : data,
        success : function (data, textStatus, response) {
          self.setState(
            {
              resultBanner: "SUCCESS!",
              userAddForm: {},
            }
          );
        },
        error   : function (r, ts) {
          self.setState(
            {
              resultBanner: `Failure!  ${JSON.stringify(r,1 ,1)}`,
              userAddForm: self.userAddForm
            }
          );
        }
      });
  }

  render() {
    const makeTextInput = (field_name, id, val) => {
      val = val === undefined ? '' : val;
      return (
        <div className="itemFormRow">
          {field_name}: <input name={id} value={val} type="text" onChange={this.handleChange}/>
        </div>
      );
    };

    console.log("Rendering user admin page...");
    console.log(this.state.resultBanner);
    return (
      <div>
        <form action="/user_admin" method="POST">
          <div id="itemFormOuterArea" className="clearFix">
            <div id="itemFormInnerArea">
              <div id="itemFormTitle">
                Add a new user
              </div>

              {makeTextInput("Display Name", "display_name", this.state.userAddForm["display_name"])}
              {makeTextInput("First Name", "first_name", this.state.userAddForm["first_name"])}
              {makeTextInput("Last Name", "last_name", this.state.userAddForm["last_name"])}
              {makeTextInput("Email", "email", this.state.userAddForm["email"])}
              {makeTextInput("password", "password", this.state.userAddForm["password"])}

              <button type="button" id="signinButton" name="signinPageButton" onClick={this.handleSubmit}>
                Create new user! yay!
              </button>
            </div>
          </div>
        </form>
        <div style={{color:'red'}}>{this.state.resultBanner}</div>
      </div>
    );

  }
}

export default UserAdmin;