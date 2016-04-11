'use strict';

const helpers = require('../math/helpers');

class Terrain {
  constructor () {

  }

  caves (width, height) {
    let buff = new ArrayBuffer(width * height * 8);
    let cellmap = new Uint8Array(buf);
    let chanceToLive = 0.45;
    for (let i = 0; i < cellmap.length; i++) {
      if (Math.random() < chanceToLive) {
        cellmap[i] = 1;
      }
    }
  }
}
