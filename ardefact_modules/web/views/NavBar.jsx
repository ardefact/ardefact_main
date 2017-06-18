var React = require('react');
import $ from 'jquery';

class NavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    var menuItems = <div></div>;
    if (window.ardefact.isUserLoggedIn()) {
      menuItems =
        (<div className="navBar_links_right">
          <div className="navBar_links_right_textArea">
            <div className="navBar_links_text">
              <a href="javascript:void(0);" onClick={window.ardefact.logout}>
                Log Out
              </a>
            </div>
          </div>
        </div>)
      ;
    }

    return (
      <div className="navBar">
        <div className="navBar_links_left">
          <div className="navBar_links_logo">
            <a href="/">
              <img src="images/logo/ardefact_logo_32px.png"/>
            </a>
          </div>
        </div>
        {menuItems}
      </div>
    );
  }
}

export default NavBar;