import { define } from '@xinix/xin';
import { App } from '@xinix/xin/components';

import '@xinix/xin/middlewares';

import './x-loading';
import './x-sidemenu';
import 'xin-connect';

class XApp extends App {
  get template () {
    return require('./x-app.html');
  }

  ready () {
    super.ready();

    this.use(async (ctx, next) => {
      document.body.setAttribute('view', ctx.uri.substr(1));

      await next();
    });
  }
}

define('x-app', XApp);
