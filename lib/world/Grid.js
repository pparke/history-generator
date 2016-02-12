'use strict';

let Perlin              = require('../math/Perlin');
let Particle            = require('../math/Particle');
let Hill                = require('../math/Hill');
let RandomDataGenerator = require('../math/RandomDataGenerator');
let helpers             = require('../math/helpers');

class Grid {
  constructor (width, height, persistance, octaves, xfreq, yfreq, lacunarity) {
    // setup the random data generator
    this.random = new RandomDataGenerator([ '374847367262647' ]);
    let seeds = new Array(20).fill((Math.random()*100000) + 100);
    this.random.sow(seeds);
    this.width = width;
    this.height = height;

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
           height:  1
         };
       });
    });

    // setup the perlin noise generator
    this.perlin = new Perlin(persistance, octaves, 2/width, 2/height, lacunarity, 'cerp', seeds);
    this.particle = new Particle(seeds);
    this.hill = new Hill();
  }

  generate () {

    let data = this.perlin.create2d(this.width, this.height);

    // change from normalized to scaled
    data = this.scale(data, 256);

    // roll particles down at random
    for (let i = 0; i < 10000; i++) {
      this.particle.rollParticle(data, 1000, -1, 220);
    }
    // normalize again
    data = this.normalize(data);

    //helpers.sumGrids(data);
    this.fromArray(data);

    //this.flattenHeights();
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
   * Normalize the height values by finding the maximum and minimum
   * and clamping the height value between them
   */
  normalize (data) {
    let max = 0;
    let min = 1000000;
    //console.log('before:', data.slice(0, 20).map((col) => col.slice(0, 20)))
    // find the min and max
    data.forEach((col, x) => {
      col.forEach((elem, y) => {
        if (elem > max) {
          max = elem;
        }
        if (elem < min) {
          min = elem;
        }
      });
    });
    // normalize to between 0 and 1
    data.forEach((col, x) => {
      col.forEach((elem, y) => {
        // no division by 0
        if (max - min !== 0) {
          data[x][y] = (elem - min) / (max - min);
        }
        else {
          data[x][y] = 0;
        }
      });
    });
    //console.log('after:', data.slice(0, 20).map((col) => col.slice(0, 20)))

    return data;
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
   * Returns a new copy of the data array
   */
  toArray () {
    let arr = [];
    this.data.forEach((col, i) => {
      arr.push([]);
      col.forEach((elem) => {
        arr[i].push(elem.height);
      });
    });
    return arr;
  }

  /**
   * Read in height data from array
   */
  fromArray (arr) {
    this.data.forEach((col, x) => {
      col.forEach((elem, y) => {
        this.data[x][y].height = arr[x][y];
      });
    });
  }
}

module.exports = Grid;
