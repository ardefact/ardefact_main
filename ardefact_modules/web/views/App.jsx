var React = require('react');
import {Switch, Route} from 'react-router-dom'

import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';
import LoginForm from './login.jsx';
import ItemForm from './ItemForm.jsx';
import UserAdmin from './UserAdmin.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    var body = null;
    if (window.ardefact.isUserLoggedIn()) {
      body = (
        <Switch>
          <Route path='/user_admin' component={UserAdmin} />
          <Route path='/' component={ItemForm} />
        </Switch>
      );
    } else {
      body = <LoginForm/>;
    }

    return (
      <div>
        <NavBar/>
        <div>
          {body}
        </div>
        <Footer/>
      </div>
    );
  }
}

export default App;