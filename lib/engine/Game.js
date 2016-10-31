'use strict';

const Store = require('./Store');
const Tilemap = require('./Tilemap');

let defaults = {
  display: 'display',
  viewport: {
    background: 0x55aa55,
    width: 800,
    height: 600
  },
  tiles: {
    size: 32,
    columns: 25,
    rows: 18
  }
};

class Game {
  constructor (config = {}) {
    config = Object.assign(defaults, config);
    // setup renderer
    this.renderer = new PIXI.WebGLRenderer(config.viewport.width, config.viewport.height);
    this.renderer.backgroundColor = config.viewport.background;
    // setup display element
    this.display = document.getElementById(config.display);
    this.display.appendChild(this.renderer.view);
    // setup stage
    this.stage = new PIXI.Container();

    this.store = new Store();
    this.tilemap = new Tilemap(config.tiles.columns, config.tiles.rows);
  }


}

module.exports = Game;
