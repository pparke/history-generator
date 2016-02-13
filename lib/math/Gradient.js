'use strict';

let RandomDataGenerator = require('./RandomDataGenerator');
let helpers             = require('./helpers');


class Gradient {
  constructor (seeds) {
    seeds = seeds || new Array(20).fill((Math.random()*100000) + 100);
    this.random = new RandomDataGenerator();
    this.random.sow(seeds);
  }

  /**
   * Create a linear gradient within range
   * following the direction given.
   * @param {number} width - width of the gradient
   * @param {number} height - height of the gradient
   * @param {object} direction - x and y direction of gradient
   * @param {object} range - min and max values of gradient
   */
  linear (width, height, direction, range) {
    return helpers.mnArray(width, height, (x, y) => {
      return Math.min((x * direction.x) + (y * direction.y) + range.min, range.max);
    });
  }
}

module.exports = Gradient;
