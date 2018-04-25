const path = require('path');
const Bundle = require('bono');

class Ui extends Bundle {
  constructor ({ mode = 'production' } = {}) {
    super();

    if (mode === 'production') {
      this.use(require('koa-static')(path.join(__dirname, '../www')));
    } else {
      let config = require('../webpack.config.js')(process.env, {});
      let dev = { publicPath: '/' };
      this.use(require('koa-webpack')({ config, dev }));
    }
  }
}

module.exports = Ui;
