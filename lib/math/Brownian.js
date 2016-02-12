'use strict';
let helpers = require('./helpers');
let RandomDataGenerator = require('./RandomDataGenerator');

class Brownian {
  constructor (persistance, octaves, interpfn, seeds) {
    this.source         = null;
    this.persistance    = persistance       || 0.1;
    this.octaves        = octaves           || 1;
    this.interpfn       = helpers[interpfn] || helpers.lerp;

    seeds = seeds || new Array(20).fill((Math.random()*100000) + 100);
    this.random = new RandomDataGenerator();
    this.random.sow(seeds);
  }

  /**
   * Return a multidimensional array of given width
   * and height filled with perlin noise.
   */
  create2d (width, height) {
    this.noise(width, height);
    let data = helpers.mnArray(width, height);
    return data.map((col, x) => {
      return col.map((elem, y) => {
        return this.perlinNoise(x, y);
      });
    });
  }

  /**
   * Noise
   * Fill the source array with noise values between 0 and 1
   */
  noise (width, height) {
    let data = helpers.mnArray(width, height);
    this.source = data.map((col, x) => {
      return col.map((elem, y) => {
        return this.random.frac(x, y);
      });
    });
  }

  interpolatedNoise (x, y) {
    let intx  = Math.floor(x);
    let fracx = x - intx;

    let inty  = Math.floor(y);
    let fracy = y - inty;
    let v1 = helpers.smooth2d(this.source, intx,     inty)
    let v2 = helpers.smooth2d(this.source, intx + 1, inty)
    let v3 = helpers.smooth2d(this.source, intx,     inty + 1)
    let v4 = helpers.smooth2d(this.source, intx + 1, inty + 1)

    let i1 = this.interpfn(v1 , v2 , fracx)
    let i2 = this.interpfn(v3 , v4 , fracx)

    return this.interpfn(i1 , i2 , fracy)
  }

  brownianNoise (x, y) {
    let total = 0;
    let persistance = this.persistance;
    let n = this.octaves;
    let freqX = 128;
    let freqY = 128;

    for (let i = 0; i < n; i++) {
      let frequency = Math.pow(2, i);
      let amplitude = Math.pow(persistance, 1/i);
      total += this.interpolatedNoise(x * frequency, y * frequency) * amplitude;
    }

    return total;
  }
};

module.exports = Brownian;
