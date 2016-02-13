'use strict';

let Perlin              = require('../math/Perlin');
let Particle            = require('../math/Particle');
let Hill                = require('../math/Hill');
let RandomDataGenerator = require('../math/RandomDataGenerator');
let Gradient            = require('../math/Gradient');
let helpers             = require('../math/helpers');
let Canvas              = require('canvas');
let fs                  = require('fs');

let Image   = Canvas.Image;

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
    this.showTemperature  = false;

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

    this.heightColorMap = [
      {r: 34, g: 32, b: 52, a: 255},
      {r: 63, g: 63, b: 116, a: 255},
      {r: 48, g: 96, b: 130, a: 255},
      {r: 91, g: 110, b: 225, a: 255},
      {r: 99, g: 155, b: 255, a: 255},
      {r: 95, g: 205, b: 228, a: 255},
      {r: 138, g: 111, b: 48, a: 255},
      {r: 75, g: 105, b: 47, a: 255},
      {r: 106, g: 190, b: 48, a: 255},
      {r: 143, g: 151, b: 74, a: 255},
      {r: 82, g: 75, b: 36, a: 255},
      {r: 102, g: 57, b: 49, a: 255},
      {r: 143, g: 86, b: 59, a: 255},
      {r: 89, g: 86, b: 82, a: 255},
      {r: 155, g: 173, b: 183, a: 255},
      {r: 255, g: 255, b: 255, a: 255}
    ];

    this.tempColorMap = [
      {r: 201, g: 79, b: 166, a: 100},
      {r: 134, g: 0, b: 131, a: 100},
      {r: 32, g: 1, b: 141, a: 100},
      {r: 1, g: 137, b: 255, a: 100},
      {r: 254, g: 255, b: 3, a: 100},
      {r: 255, g: 119, b: 1, a: 100},
      {r: 255, g: 12, b: 0, a: 100},
      {r: 122, g: 0, b: 1, a: 100}
    ];

    // setup the perlin noise generator
    this.perlin     = new Perlin(persistance, octaves, 2/width, 2/height, lacunarity, 'cerp', seeds);
    this.particle   = new Particle(seeds);
    this.hill       = new Hill();
    this.grad       = new Gradient(seeds);
  }

  /**
   * Generate new data for the grid
   */
  generate () {
    let heightmap = this.perlin.create2d(this.width, this.height);

    // change from normalized to scaled
    heightmap = this.scale(heightmap, 256);

    // roll particles down at random
    for (let i = 0; i < 10000; i++) {
      this.particle.rollParticle(heightmap, 1000, -1, 220);
    }
    // normalize again
    heightmap = this.normalize(heightmap);
    this.fromArray(heightmap, 'height');

    let heatmap = this.grad.linear(this.width, this.height, {x: 0, y: 0.5}, {min: 0, max: 255});
    heatmap = this.normalize(heatmap);
    this.fromArray(heatmap, 'temperature');

    //helpers.sumGrids(heightmap);

    this.flattenHeights();
  }

  /**
   * Render the grid as a image
   */
  render () {
    let canvas = new Canvas(this.width, this.height);
    let ctx = canvas.getContext('2d');

    // set background color
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0, 0, 255)';
    ctx.fill();

    // get the ImageData object
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let imgDD     = imageData.data;

    // draw each pixel according to the height value
    this.data.forEach((col, x) => {
      col.forEach((elem, y) => {
        let height = elem.height;
        let color;
        // show temperature overlaid on the map
        if (this.showTemperature) {
          let temperature = elem.temperature;
          let bg = this.heightColorMap[Math.floor(height * 15)];
          let fg = this.tempColorMap[Math.floor(temperature * 7)];
          // blend colors
          color = this.blend(fg, bg);
        }
        else {
          color = this.heightColorMap[Math.floor(height * 15)];
        }

        this.setPixel(imgDD, imageData.width, x, y, color);
      });
    });

    // save the changes to the context
    ctx.putImageData(imageData, 0, 0);

    // Write image buffer to disk
    let out = fs.createWriteStream(`${this.outdir}/${this.imageName}`)
    let stream = canvas.createPNGStream();

    stream.on('data', function(chunk){
      out.write(chunk);
    });
  }

  /**
   * Blend two rgba colors
   */
  blend (fg, bg) {
    let fga = fg.a/255;
    return {
      r: (fg.r * fga) + (bg.r * (1 - fga)),
      g: (fg.g * fga) + (bg.g * (1 - fga)),
      b: (fg.b * fga) + (bg.b * (1 - fga)),
      a: 255
    };
  }

  /**
   * Set the value at x y to the given color
   * @param {array} data - the image data array
   * @param {number} width - the width of the image data
   * @param {number} x - the x coord
   * @param {number} y - the y coord
   * @param {object} color - the color as {r, g, b, a}
   */
  setPixel (data, width, x, y, color) {
    let offset = ((y * width) + x) * 4;
    data[offset] = color.r;
    data[offset+1] = color.g;
    data[offset+2] = color.b;
    data[offset+3] = color.a;
  }

  randomizePerlin () {
    this.perlin.randomizePerm();
  }

  setPerlinParams (params) {
    Object.keys(params).forEach((key) => {
      if (this.perlin[key] !== undefined) {
        this.perlin[key] = params[key];
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
  fromArray (arr, attr) {
    this.data.forEach((col, x) => {
      col.forEach((elem, y) => {
        this.data[x][y][attr] = arr[x][y];
      });
    });
  }
}

module.exports = Grid;
