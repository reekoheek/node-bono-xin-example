const { NODE_ENV = 'production', PORT = 3000 } = process.env;
const path = require('path');

module.exports = {
  mode: NODE_ENV,
  port: PORT,
  bankId: 134,
  uploadDir: path.resolve('./files'),
  connections: [
    // disk
    {
      name: 'default',
      adapter: require('node-norm/adapters/disk'),
    },
    // mysql
    // {
    //   name: 'default',
    //   adapter: require('node-norm-mysql'),
    //   host: 'localhost',
    //   user: 'root',
    //   password: '',
    //   database: 'example',
    // },
  ],
};
