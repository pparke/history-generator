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

  /**
   * Create caves using cellular automata
   * @param  {Uint8Array} cavemap - array representing the cave map
   * @param  {number} width       - width of the map
   * @param  {number} height      - height of the map
   */
  caves (cavemap, width, height, steps, options) {
    options = options || {};
    let chanceToLive  = options.chanceToLive  || 0.45;
    // initialise map
    for (let i = 0; i < cavemap.length; i++) {
      if (Math.random() < chanceToLive) {
        cavemap[i] = 1;
      }
    }

    for (let i = 0; i < steps; i++) {
      this.caveStep(cavemap, width, height, options);
    }
  }

  /**
   * Do a simulation step and update the map
   * @param  {Uint8Array} cavemap   - array representing the cave map
   * @param  {number} width         - the width of the map
   * @param  {number} height        - the height of the map
   */
  caveStep (cavemap, width, height, options) {
    options = options || {};
    let deathLimit = options.deathLimit || 2;
    let birthLimit = options.birthLimit || 3;
    let overpopLimit = options.overpopLimit || 5;

    // save the original state
    let original = Uint8Array.from(cavemap);
    // loop over the map and update
    for (let i = 0; i < cavemap.length; i++) {
      let x, y;
      [x, y] = helpers.coords(i, width);
      let neighbours = this.countAliveNeighbours(original, x, y, width, height);
      // if alive
      if (original[i] > 0) {
        if (neighbours < deathLimit) {
          cavemap[i] = 0;
        }
        else if (neighbours > overpopLimit) {
          cavemap[i] = 0;
        }
        else {
          cavemap[i] = 1;
        }
      }
      // if dead
      else {
        if (neighbours > birthLimit) {
          cavemap[i] = 1;
        }
        else {
          cavemap[i] = 0;
        }
      }
    }
  }

  /**
   * Determine how many living neighbours the cell has
   * @param  {Uint8Array} cavemap  - the array of cells
   * @param  {number} x       - the x position
   * @param  {number} y       - the y position
   * @param  {number} width   - the width of the map
   * @param  {number} height  - the height of the map
   * @return {number}         - the number of living neighbours
   */
  countAliveNeighbours (cavemap, x, y, width, height) {
    let count = 0;
    for (let xx = -1; xx < 2; xx++) {
      for (let yy = -1; yy < 2; yy++) {
        let nx = x+xx;
        let ny = y+yy;
        if (nx === 0 && ny === 0) {
          // don't count self
        }
        else if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          count += 1;
        }
        else if (cavemap[helpers.offset(nx, ny, width)] > 0) {
          count += 1;
        }
      }
    }

    return count;
  }
}

module.exports = Terrain;
