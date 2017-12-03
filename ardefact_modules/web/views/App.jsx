var React = require('react');
import {Switch, Route} from 'react-router-dom'

import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';
import LoginForm from './login.jsx';
import ItemForm from './ItemForm.jsx';
import ItemList from './ItemList.jsx';
import UserAdmin from './UserAdmin.jsx';
import Item from './Item.jsx'

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    var body = null;
    if (window.ardefact.isUserLoggedIn()) {
      body = (
        <Switch>
          <Route path='/user_admin' component={UserAdmin}/>
          <Route path="/item_list" component={ItemList}/>
          <Route path="/item_form" component={ItemForm}/>
          <Route path="/item/:id" component={Item}/>
        </Switch>
      );
    } else {
      body = <LoginForm/>;
    }

    return (
      <div>
        <NavBar/>
        <div style={{paddingTop: '64px'}}>
          {body}
        </div>
        <Footer/>
      </div>
    );
  }
}

export default App;