const Bundle = require('bono');
const NormBundle = require('bono-norm/bundle');
const Manager = require('node-norm');
const debug = require('debug')('node-bono-xin-example:bundle:api');

class Api extends Bundle {
  constructor (config = {}) {
    super();

    this.config = config;

    let manager = this.manager = new Manager(config);

    this.use(async (ctx, next) => {
      debug(ctx.method, ctx.originalUrl);
      await next();
    });
    this.use(require('bono/middlewares/json')());
    this.use(require('bono-norm/middleware')({ manager }));

    this.get('/info', this.getInfo.bind(this));

    this.bundle('/user', new NormBundle({ schema: 'user' }));
  }

  getInfo () {
    return require('../package.json');
  }
}

module.exports = Api;
