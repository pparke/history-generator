'use strict';
let helpers = require('./helpers');
let RandomDataGenerator = require('./RandomDataGenerator');

class Perlin {
  constructor (persistance, octaves, xFreq, yFreq, lacunarity, interpfn, seeds) {
    this._perm = [151,160,137,91,90,15,
131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

    this.persistance    = persistance       || 0.1;
    this.octaves        = octaves           || 1;
    this.xFreq          = xFreq             || 0.5;
    this.yFreq          = yFreq             || 0.5;
    this.lacunarity     = lacunarity        || 2;
    this.interpfn       = helpers[interpfn] || helpers.lerp;

    this.grad3 =  [[1,1],[-1,1],[1,-1],[-1,-1],
                  [1,0],[-1,0],[0,1],[0,-1]];

    seeds = seeds || new Array(20).fill((Math.random()*100000) + 100);
    this.random = new RandomDataGenerator();
    this.random.sow(seeds);

    this.randomizePerm();

    // double the size of the permutation table to avoid having to wrap indices
    this.doublePerm();
  }

  randomizePerm () {
    this._perm.forEach((elem, i, arr) => {
      let newPos = Math.floor(this.random.frac()*255);
      let a = arr[newPos];
      arr[newPos] = elem;
      arr[i] = a;
    });
  }

  doublePerm () {
    this._perm = this._perm.concat(this._perm);
  }

  perm (x, y) {
    // get value from perm table and wrap to length of grad3
    let val = this._perm[x + this._perm[y]];
    return (val % (this.grad3.length - 1));
  }

  /**
   * Return a multidimensional array of given width
   * and height filled with perlin noise.
   */
  create2d (width, height) {
    let iterations  = [];
    let amplitude   = 1;
    let xFreq       = this.xFreq;
    let yFreq       = this.yFreq;
    // generate perlin noise
    for (let i = 0; i < this.octaves; i++) {
      let noise = helpers.mnArray(width, height);
      noise = noise.map((col, x) => {
        return col.map((elem, y) => {
          return this.perlinNoise(x * xFreq, y * yFreq) * amplitude;
        });
      });
      iterations.push(noise);

      amplitude *= this.persistance;
      xFreq *= this.lacunarity;
      yFreq *= this.lacunarity;
    }

    let blank = helpers.mnArray(width, height, () => 1);
    // combine all the iterations into one
    let data = iterations.reduce(helpers.sumGrids, blank)

    return data;
  }

  perlinNoise (x, y) {
    let X = Math.floor(x);
    let Y = Math.floor(y);
    x -= X;
    y -= Y;
    X = X & 255;
    Y = Y & 255;

    let grad00 = this.perm(X, Y);
    let grad01 = this.perm(X, (Y + 1));
    let grad10 = this.perm((X + 1), Y);
    let grad11 = this.perm((X + 1), (Y + 1));

    let n00 = this.dot(this.grad3[grad00], x, y);
    let n10 = this.dot(this.grad3[grad10], x-1, y);
    let n01 = this.dot(this.grad3[grad01], x, y-1);
    let n11 = this.dot(this.grad3[grad11], x-1, y-1);

    let u = this.fade(x);
    let v = this.fade(y);


    let nx00 = helpers.lerp(n00, n10, u);
    let nx10 = helpers.lerp(n01, n11, u);

    let nxy = helpers.lerp(nx00, nx10, v);

    return nxy;
  }

  dot(g, x, y) {
    return g[0]*x + g[1]*y;
  }

  mix (a, b, t) {
    return (1.0-t)*a + t*b;
  }

  fade (t) {
    return Math.pow(t, 3)*(t*(t*6.0-15.0)+10.0);
  }

  exportPerm () {
    return this._perm.slice(0, 255);
  }
}

module.exports = Perlin;
