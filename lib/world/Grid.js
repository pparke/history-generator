'use strict';

let Perlin              = require('../math/Perlin');
let Simplex             = require('../math/Simplex');
let Particle            = require('../math/Particle');
let Hill                = require('../math/Hill');
let RandomDataGenerator = require('../math/RandomDataGenerator');
let Gradient            = require('../math/Gradient');
let Atmosphere          = require('../world/Atmosphere');
let Display             = require('../ui/Display');
let helpers             = require('../math/helpers');
let fs                  = require('fs');

class Grid {
  constructor (width, height, persistance, octaves, xfreq, yfreq, lacunarity, outdir) {
    // setup the random data generator
    this.random = new RandomDataGenerator([ '374847367262647' ]);
    let seeds = new Array(20).fill((Math.random()*100000) + 100);
    this.random.sow(seeds);

    this.width            = width;
    this.height           = height;
    this.outdir           = outdir;
    this.imageName        = 'map.png';
    this.noiseFn          = 'simplex';
    this.showTemperature  = true;

    // create the grid data
    let array = new Array(width);
    array.fill(null);
    this.data = array.map((col, x) => {
       let subArray = new Array(height);
       subArray.fill(null);
       return subArray.map((elem, y) => {
         return {
           x:       x,
           y:       y,
           height:  1,
           temperature: 0
         };
       });
    });

    // setup the perlin noise generator
    this.perlin     = new Perlin(persistance, octaves, 2/width, 2/height, lacunarity, 'cerp', seeds);
    this.simplex    = new Simplex(persistance, octaves, 2/width, 2/height, lacunarity, 'cerp', seeds);
    this.particle   = new Particle(seeds);
    this.hill       = new Hill();
    this.grad       = new Gradient(seeds);
    this.atmo       = new Atmosphere();
  }

  /**
   * Generate new data for the grid
   */
  generate () {
    let heightmap = this[this.noiseFn].create2d(this.width, this.height);

    // change from normalized to scaled
    heightmap = this.scale(heightmap, 256);

    // roll particles down at random
    for (let i = 0; i < 10000; i++) {
      this.particle.rollParticle(heightmap, 1000, -1, 220);
    }
    // normalize again
    heightmap = helpers.normalize(heightmap);
    this.fromArray(heightmap, 'height');

    let heatmap = this.grad.linear(this.width, this.height, {x: 0, y: 0.5}, {min: 0, max: 255});

    heatmap = helpers.normalize(heatmap);
    // add atmospheric effects
    heatmap = this.atmo.surfaceHeat(heightmap, heatmap);
    this.fromArray(heatmap, 'temperature');

    //helpers.sumGrids(heightmap);

    this.flattenHeights();
  }

  randomizePerm () {
    this[this.noiseFn].randomizePerm();
  }

  exportPerm (name) {
    fs.writeFile(name, JSON.stringify(this[this.noiseFn]._perm), (err) => {
      if (err) {
        console.error('Problem writing permutations to file:', err);
      }
      else {
        console.log(`${name} written.`);
      }
    });
  }

  importPerm (name) {
    fs.readFile(`${this.outdir}/${name}`, (err, data) => {
      if (err) {
        console.error('Problem reading permutations file:', err);
      }
      else {
        let perm = JSON.parse(data);
        this[this.noiseFn]._perm = perm;
        console.log(`${name} read.`);
      }
    })
  }

  exportData (name) {
    let buffer = new Buffer(JSON.stringify(this.data));
    let out = fs.createWriteStream(`${this.outdir}/${name}`);
    out.write(buffer);
    out.end();
  }

  importData (name) {
    fs.readFile(`${this.outdir}/${name}`, (err, data) => {
      if (err) {
        console.error('Problem reading data file:', err);
      }
      else {
        let dat = JSON.parse(data);
        this.data = dat;
        console.log(`${name} read.`);
      }
    })
  }

  setNoiseParams (params) {
    Object.keys(params).forEach((key) => {
      if (key === 'noiseFn') {
        this.noiseFn = params[key];
      }
      else if (this[this.noiseFn][key] !== undefined) {
        this[this.noiseFn][key] = params[key];
      }
      else {
        console.log('\nInvalid option:', key);
      }
    })
  }

  /**
   * Scale all values in the grid by a given factor
   */
  scale (data, n) {
    return data.map((col, x) => {
      return col.map((elem, y) => {
        return Math.abs(elem) * n;
      });
    });
  }

  /**
   * Flatten the normalized heights by squaring them.
   */
  flattenHeights () {
    this.data.forEach((col, x) => {
      col.forEach((elem, y) => {
        elem.height = Math.pow(elem.height, 2);
      });
    });
  }



  toString () {
    this.data.forEach((col) => {
      let row = '';
      col.forEach((elem) => {
        row += `| ${elem.height} |`;
      });
      console.log(row);
    });
  }

  /**
   * Returns a new copy of the data
   * at the given key index
   */
  toArray (key) {
    let arr = [];
    this.data.forEach((col, i) => {
      arr.push([]);
      col.forEach((elem) => {
        arr[i].push(elem[key]);
      });
    });
    return arr;
  }

  /**
   * Read in height data from array
   */
  fromArray (arr, attr) {
    this.data.forEach((col, x) => {
      col.forEach((elem, y) => {
        this.data[x][y][attr] = arr[x][y];
      });
    });
  }
}

module.exports = Grid;
