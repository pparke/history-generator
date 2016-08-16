const path = require('path');
const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');

const dashboard = new Dashboard();

const entries = {
  index:  path.join(__dirname,  'client/index.js'), //path.join(__dirname, 'app'),
  map:    path.join(__dirname,  'client/map.js'),
  myth:   path.join(__dirname,  'client/myth.js'),
  caves:  path.join(__dirname,  'client/caves.js'),
  planet:  path.join(__dirname,  'client/planet.js'),
  gnomes: path.join(__dirname, 'client/gnomes.js'),
  dungeon: path.join(__dirname, 'client/dungeon.js')
};

const build = path.join(__dirname,  'dist');

module.exports = {
  // Entry accepts a path or an object of entries. We'll be using the
  // latter form given it's convenient with more complex configurations.
  entry: entries,
  output: {
    path: build,
    filename: '[name].bundle.js'
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  // dev server options
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    quiet: true,
  },
  plugins: [
    new DashboardPlugin(dashboard.setData)
  ],
  node: {
    fs: 'empty'
  }
};
