const path = require('path');

const PATHS = {
  index:  path.join(__dirname,  'client/index.js'), //path.join(__dirname, 'app'),
  map:    path.join(__dirname,  'client/map.js'),
  myth:   path.join(__dirname,  'client/myth.js'),
  build:  path.join(__dirname,  'dist')
};

module.exports = {
  // Entry accepts a path or an object of entries. We'll be using the
  // latter form given it's convenient with more complex configurations.
  entry: {
    index:  PATHS.index,
    map:    PATHS.map,
    myth:   PATHS.myth
  },
  output: {
    path: PATHS.build,
    filename: '[name].bundle.js'
  }
};
