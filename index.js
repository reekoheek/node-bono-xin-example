const http = require('http');
const Bundle = require('bono');
const Api = require('./bundles/api');
const Ui = require('./bundles/ui');
const config = require('./config');

process.on('unhandledRejection', err => console.error('UNHANDLED REJECTION', err));

const app = new Bundle();

app.bundle('/api', new Api(config));
app.bundle('/ui', new Ui(config));

app.get('/', ctx => {
  ctx.redirect('/ui/');
});

let server = http.createServer(app.callback());
server.listen(config.port, () => {
  console.info('Server running at port', config.port, `(${config.mode})`);
});
