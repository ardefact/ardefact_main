var React = require('react');
import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';
import LoginForm from './login.jsx';
import ItemForm from './ItemForm.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (window.ardefact.isUserLoggedIn()) {
      return (
        <div>
          <NavBar/>
          <div>
            <ItemForm/>
          </div>
          <Footer/>
        </div>
      );
    } else {
      return (
        <div>
          <NavBar/>
          <div>
            <LoginForm/>
          </div>
          <Footer/>
        </div>
      );
    }
  }
}

export default App;