'use strict';

let RandomDataGenerator = require('./RandomDataGenerator');
let helpers             = require('./helpers');

class Particle {
  constructor (seeds) {
    seeds = seeds || new Array(20).fill((Math.random()*100000) + 100);
    this.random = new RandomDataGenerator();
    this.random.sow(seeds);
  }

  /**
   * Creates a particle which increases the height of each map tile
   * as it 'rolls' downhill from its starting location
   */
  rollParticle (data, life, change, min) {
    change  = change  || 1;
    min     = min     || 0
    let xmax = data.length - 1;
    let ymax = data[0].length - 1;

    // get a random start position
    let x = this.random.between(0, xmax);
    let y = this.random.between(0, ymax);

    for (let i = 0; i < life; i++) {
      // don't add or remove below the minimum
      if (data[x][y] <= min) {
        return;
      }
      // increment the height at the position by 1
      data[x][y] += change;

      // move to an adjacent position whose height is less than
      // or equal to this height
      while (i < life) {
        i++;
        // pick an adjacent position
        let pos = this.random.pick([[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]]);
        // wrap any out of bounds indices
        let x1 = (x + pos[0]) & xmax;
        let y1 = (y + pos[1]) & ymax;
        // check if it is lower than or even with current position
        if (data[x][y] >= data[x1][y1]) {
          x = x1;
          y = y1;
          break;
        }
      }
    }
  }
}

module.exports = Particle;
