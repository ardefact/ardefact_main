var React = require('react');

import {Link} from 'react-router-dom';
import $ from 'jquery';

class NavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    // Common menu items for logged in users.
    var menuItems = <div></div>;
    if (window.ardefact.isUserLoggedIn()) {
      menuItems = [
        <div className="navBar_links_right_textArea" key={0}>
          <div className="navBar_links_text">
            <a href="javascript:void(0);" onClick={window.ardefact.logout}>
              Log Out
            </a>
          </div>
        </div>,


        <div className="navBar_links_right_textArea" key={1}>
          <div className="navBar_links_text">
            <Link to="/item_list">Submitted Items</Link>
          </div>
        </div>,

        <div id="foundButtonArea" key={2}>
          <Link to="/item_form">
            <button type="button" id="foundButton">
              I found something!
            </button>
          </Link>
        </div>
      ];
    }

    return (
      <div className="navBar">
        <div className="navBar_links_left">
          <div className="navBar_links_logo">
            <Link to="/">
              <img src="images/logo/ardefact_logo_32px.png"/>
            </Link>
          </div>
        </div>
        <div className="navBar_links_right">
          {menuItems}
        </div>
      </div>
    );
  }
}

export default NavBar;
