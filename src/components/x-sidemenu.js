import { define, Component } from '@xinix/xin';

class XSideMenu extends Component {
  get template () {
    return require('./x-sidemenu.html');
  }
}

define('x-sidemenu', XSideMenu);
