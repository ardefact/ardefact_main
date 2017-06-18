var React = require('react');
import $ from 'jquery';

class NavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    var menuItems = <div></div>;
    if (window.ardefact.isUserLoggedIn()) {
      menuItems = <a href="javascript:void(0);" onClick={window.ardefact.logout}>Logout</a>;
    }

    return (
      <div className="navBar">
        <div className="navBar_links_left">
          <div className="navBar_links_logo">
            <a href="/">
              <img src="images/logo/ardefact_logo_32px.png"/>
            </a>
            {menuItems}
          </div>
        </div>
      </div>
    );
  }
}

export default NavBar;