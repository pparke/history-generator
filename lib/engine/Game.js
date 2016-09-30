'use strict';

class Game {
  constructor (w, h) {
    this.renderer = new PIXI.WebGLRenderer(w, h);
    this.renderer.backgroundColor = 0x55aa55;
  }
}

module.exports = Game;
