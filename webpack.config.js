const path = require('path');

const PATHS = {
  app: path.join(__dirname, 'app.js'), //path.join(__dirname, 'app'),
  build: path.join(__dirname, 'dist')
};

module.exports = {
  // Entry accepts a path or an object of entries. We'll be using the
  // latter form given it's convenient with more complex configurations.
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  }
};
