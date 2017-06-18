var React = require('react');
import $ from 'jquery';

class Footer extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="footerArea">
        <div className="footerContent">
          <div className="footerCopyright">
            &copy; 2015
            <script>
              new Date().getFullYear()>2015&&document.write("- "+new Date().getFullYear());
            </script>
            , Ardefact LLC.
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;