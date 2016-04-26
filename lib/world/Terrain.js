'use strict';

const Perlin              = require('../math/Perlin');
const Simplex             = require('../math/Simplex');
const Particle            = require('../math/Particle');
const Hill                = require('../math/Hill');
const helpers             = require('../math/helpers');

class Terrain {
  constructor (width, height, seeds) {
    this.persistance = 0.3;
    this.octaves     = 8;
    this.xfreq       = 2/this.width;
    this.yfreq       = 2/this.height;
    this.lacun       = 4;
    this.noise = {
      perlin:   new Perlin(seeds),
      simplex:  new Simplex(seeds)
    };
    this.particle   = new Particle(seeds);
    this.hill       = new Hill();
  }

  /**
   * Set the noise parameters
   * @param {number} persistance persistance of iterations
   * @param {number} octaves     number of octaves
   * @param {number} xfreq       y frequency
   * @param {number} yfreq       y frequency
   * @param {number} lacun       lacunarity
   */
  setParams (persistance, octaves, xfreq, yfreq, lacun) {
    this.persistance = persistance;
    this.octaves = octaves;
    this.xfreq = xfreq;
    this.yfreq = yfreq;
    this.lacun = lacun;
  }

  /**
   * Fill the provided heightmap with noise
   * @param  {Array} heightmap  - a 1 dimensional array width*height in size
   * @param  {number} width     - the width of the heightmap
   * @param  {number} height    - the height of the heightmap
   * @param  {string} noiseKey  - the key for the noise function to use
   */
  fillNoise (heightmap, width, height, noiseKey) {
    let iterations  = [];
    let amplitude   = 1;
    let xFreq       = this.xfreq;
    let yFreq       = this.yfreq;
    let noiseFn     = this.noise[noiseKey] || this.noise['simplex'];

    for (let o = 0; o < this.octaves; o++) {
      let _noise = new ArrayBuffer(width * height * 4);
      let noise = new Float32Array(_noise);
      for (let i = 0; i < noise.length; i++) {
        let x = Math.floor(i / width);
        let y = i % width;
        noise[i] = ((noiseFn.noise(x * xFreq, y * yFreq)+1)/2) * amplitude;
      }
      iterations.push(noise);

      amplitude *= this.persistance;
      xFreq     *= this.lacun;
      yFreq     *= this.lacun;
      console.log(amplitude, xFreq, yFreq)
    }

    this.iterations = iterations;

    // sum iterations and store in data
    for (let i = 0; i < heightmap.length; i++) {
      let total = 0;
      for (let j = 0; j < iterations.length; j++) {
        total += iterations[j][i];
      }
      heightmap[i] = total;
    }

    // TODO: fix scaling, scaling is all screwed up so we have to normalize
    let minmax = helpers.minmax(heightmap);
    let min = minmax[0];
    let max = minmax[1];
    for (let i = 0; i < heightmap.length; i++) {
      heightmap[i] = helpers.normalize(heightmap[i], min, max);
    }
  }

  /**
   * Randomize the permutation array of each noise function
   */
  randomizePerm () {
    Object.keys(this.noise).forEach((key) => {
      this.noise[key].randomizePerm();
    });
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

module.exports = Terrain;
