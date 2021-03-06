'use strict';

const RandomDataGenerator = require('../math/RandomDataGenerator');
const Gradient            = require('../math/Gradient');
const Atmosphere          = require('../world/Atmosphere');
const Terrain             = require('../world/Terrain');
const helpers             = require('../math/helpers');

class Grid {
  constructor (width, height) {
    // setup the random data generator
    this.random = new RandomDataGenerator([ '374847367262647' ]);
    let seeds = new Array(20).fill((Math.random()*100000) + 100);
    this.random.sow(seeds);

    this.width            = width;
    this.height           = height;
    this.bytesPerElem     = 4;
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
           temperature: 0,
           pressure: 0,
           density: 0
         };
       });
    });

    this._data = {
      height:       new ArrayBuffer(width * height * this.bytesPerElem),
      insolation:   new ArrayBuffer(width * height * this.bytesPerElem),
      temperature:  new ArrayBuffer(width * height * this.bytesPerElem),
      pressure:     new ArrayBuffer(width * height * this.bytesPerElem),
      density:      new ArrayBuffer(width * height * this.bytesPerElem),
      windx:        new ArrayBuffer(width * height * this.bytesPerElem),
      windy:        new ArrayBuffer(width * height * this.bytesPerElem),
      velocity:     new ArrayBuffer(width * height * this.bytesPerElem),
      water:        new ArrayBuffer(width * height * this.bytesPerElem),
      humidity:     new ArrayBuffer(width * height * this.bytesPerElem),
      rainfall:     new ArrayBuffer(width * height * this.bytesPerElem),
    };

    this.heightmap = new Float32Array(this._data.height);
    this.solarmap = new Float32Array(this._data.insolation);
    this.heatmap = new Float32Array(this._data.temperature);
    this.pressuremap = new Float32Array(this._data.pressure);
    this.densitymap = new Float32Array(this._data.density);
    this.windxmap = new Float32Array(this._data.windx);
    this.windymap = new Float32Array(this._data.windy);
    this.velocitymap = new Float32Array(this._data.velocity);
    this.watermap = new Float32Array(this._data.water);
    this.humiditymap = new Float32Array(this._data.humidity);
    this.rainfallmap = new Float32Array(this._data.rainfall);

    // setup the perlin noise generator

    this.grad       = new Gradient(seeds);
    this.atmo       = new Atmosphere();
    this.terra      = new Terrain(width, height, seeds);
  }

  /**
   * Generate new data for the grid
   */
  generate () {
    // fill the heightmap with noise
    this.terra.fillNoise(this.heightmap, this.width, this.height, this.noiseFn);
    const [min, max] = helpers.minmax(this.heightmap);
    console.log(`Min: ${min} Max: ${max}`)

    for (let i = 0; i < Math.floor(Math.random()*5) + 1; i++) {
      this.terra.addHill(this.heightmap, this.width, this.height*Math.random(), this.width*Math.random(), Math.random()*15);
    }
    // TODO: finish changing all functions to use 1 dimensional arrays

    /*
    // change from normalized to scaled
    heightmap = this.scale(heightmap, 256);

    // roll particles down at random
    for (let i = 0; i < 10000; i++) {
      this.particle.rollParticle(heightmap, 1000, -1, 220);
    }
    */

    // flatten
    this.flattenHeights(this.heightmap);

    // TODO: allow adjustment of rate of increase, min and max to alter latitude and insolation
    // or alternatively calculate insolation based on heightmap and lattitude
    //let heatmap = this.grad.linear(this.width, this.height, {x: 0, y: 1}, {min: 0, max: 255});
    this.atmo.solargain(this.solarmap, this.width, this.height, 90, 90, 100);


    // add determine heat at surface
    this.atmo.surfaceHeat(this.heatmap, this.heightmap, this.solarmap);

    // calculate atmospheric pressure
    this.atmo.pressure(this.pressuremap, this.heightmap);
/* TODO: generate humidity map to pass to density function
    // calculate initial density
    this.atmo.density(this.densitymap, this.pressuremap, this.heatmap);

    // calculate initial wind direction
    this.atmo.wind(this.windxmap, this.windymap, this.heightmap, this.densitymap, this.width, this.height, 0.1, deltaT);
    // calculate initial velocity
    this.atmo.velocity(this.velocitymap, this.windxmap, this.windymap);
*/
    // TODO: water map

    // TODO: humidity map

    // TODO: rainfall map
  }

  /**
   * Apply any time dependent effects to the grid
   */
  step (deltaT) {
    deltaT = deltaT || 0.1;

    //this.atmo.diffuse(this.densitymap, this.width, this.height, 0.1, deltaT);
    // calculate the update wind direction
    this.atmo.wind(this.windxmap, this.windymap, this.heightmap, this.densitymap, this.width, this.height, 0.1, deltaT);
    // TODO: move the atmospheric components according the the wind direction and velocity
    // TODO: update the humidity and water level due to evaporation
    // TODO: update the humidity and rainfall due to precipitation
    // TODO: update the water map due to runoff and water flow
    // TODO: update the heightmap due to erosion
  }

  exportPerm (name) {
    return JSON.stringify(this[this.noiseFn]._perm);
  }

  importPerm (data) {
    let perm = JSON.parse(data);
    this[this.noiseFn]._perm = perm;
    console.log(`${name} read.`);
  }

  exportData (name) {
    let data = {
      heightmap: this.heightmap,
      solarmap: this.solarmap,
      heatmap: this.heatmap,
      pressuremap: this.pressuremap,
      densitymap: this.densitymap
    };

    return new Buffer(JSON.stringify(data));
  }

  importData (data) {
    let dat = JSON.parse(data);
    this.heightmap = dat.heightmap;
    this.solarmap = dat.solarmap;
    this.heatmap = dat.heatmap;
    this.pressuremap = dat.pressuremap;
    this.densitymap = dat.densitymap;
    console.log(`${name} read.`);
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
  flattenHeights (data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.pow(data[i], 2);
    }
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
