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
    const [min, max] = helpers.minmax(heightmap);

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

  /**
  * Add a hill to the given array
  */
  addHill (heightmap, width, centerx, centery, maxHeight, falloffx=0.1, falloffy=0.1) {
    const temp = new Array(heightmap.length).fill(0);
    for (let i = 0; i < heightmap.length; i++) {
      const [x,y] = helpers.coords(i, width);
      const dx = Math.pow((x - centerx), 2);
      const dy = Math.pow((y - centery), 2);
      const height = Math.pow(maxHeight, 2) - (dx*falloffx + dy*falloffy);
      temp[i] += height < 0 ? 0 : height;
    }
    const [min, max] = helpers.minmax(temp);
    for (let i = 0; i < heightmap.length; i++) {
      const height = helpers.normalize(temp[i], min, max);
      heightmap[i] *= 1+height;
      if (heightmap[i] > 1) {
        heightmap[i] = 1;
      }
    }
  }

  /**
   * Creates a particle which increases the height of each map tile
   * as it 'rolls' downhill from its starting location
   * TODO: convert to use 1D array
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
      let neighbors = helpers.shuffle([[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]]);
      while (neighbors.length > 0) {
        i++;
        // pick an adjacent position
        let pos = neighbors.pop();
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
      // if there are no lower or equal neighbors
      if (neighbors.length === 0) {
        return;
      }
    }
  }

  /**
   * Calculate the albedo of the surface
   */
  albedo (height, water, vegetation) {

  }

}

module.exports = Terrain;
