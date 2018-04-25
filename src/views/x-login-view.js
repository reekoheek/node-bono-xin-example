import { define } from '@xinix/xin';
import { View } from '@xinix/xin/components';

class XLoginView extends View {
  get template () {
    return require('./x-login-view.html');
  }

  doLogin (evt) {
    evt.preventDefault();

    this.__app.navigate('/');
  }
}

define('x-login-view', XLoginView);
