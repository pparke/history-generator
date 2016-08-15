'use strict';

let RandomDataGenerator = require('../math/RandomDataGenerator');
let Canvas              = require('canvas');
let fs                  = require('fs');

class Flag {
  constructor (width, height, outdir, seeds) {
    width = width || 200;
    height = height || 200;
    this.outdir = outdir || __dirname;

    this.setup(width, height);

    this.palette = [
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

    seeds = seeds || new Array(20).fill((Math.random()*100000) + 100);
    this.random = new RandomDataGenerator();
    this.random.sow(seeds);
  }

  setup (width, height) {
    console.log('setup')
    this.canvas = new Canvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    // set background color
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgb(0, 0, 0)';
    this.ctx.fill();
  }

  rectangles (xdiv, ydiv) {
    console.log('rectangles')
    let canvW = this.canvas.width;
    let canvH = this.canvas.height;
    let width = canvW / xdiv;
    let height = canvH / ydiv;
    let i = this.random.between(0, 15);
    let color = this.palette[i];
    console.log('beginning iteration')
    for (let y = 0; y < canvH; y += height) {
      for (let x = 0; x < canvW; x += width) {
        let j = this.random.between(Math.abs(i-1), (i+2)%15);
        let colorStr = '';

        if (i === j) {
          let hsl = this.rgbToHsl(color.r, color.g, color.b);
          let change = this.random.between(-40, 40);
          hsl.l += change;
          hsl.l %= 100;
          hsl.l = Math.abs(hsl.l);
          console.log('adjusting by', change)
          colorStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        }
        else {
          colorStr = `rgb(${color.r}, ${color.g}, ${color.b})`;
          i = j;
          color = this.palette[i];
        }

        console.log('setting style', colorStr)
        this.ctx.fillStyle = colorStr;

        this.ctx.fillRect(x, y, width, height);
      }
    }
  }

  gradient (xdiv, ydiv) {
    let canvW = this.canvas.width;
    let canvH = this.canvas.height;
    let width = canvW / xdiv;
    let height = canvH / ydiv;
    let initial = {
      h: this.random.between(0, 255),
      s: '100',
      l: this.random.between(0, 100)
    };

    for (let y = 0; y < canvH; y += height) {
      for (let x = 0; x < canvW; x += width) {
        let h = (initial.h + x+y) % 255;
        let l = (initial.l + this.random.between(-20, 20)) % 100;
        let color = `hsl(${h}, ${initial.s}%, ${l}%)`;
        console.log(color)
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
      }
    }
  }

  render () {
    //this.rectangles(10, 10);
    console.log(`writing to file to ${__dirname}/flag.png...`)

    // Write image buffer to disk
    let out = fs.createWriteStream(this.outdir + '/flag.png')
    let stream = this.canvas.createPNGStream();

    stream.on('data', function(chunk){
      out.write(chunk);
    });
  }

  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and l in the set [0, 1].
   *
   * @param   Number  r       The red color value
   * @param   Number  g       The green color value
   * @param   Number  b       The blue color value
   * @return  Array           The HSL representation
   */
  rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: h*255,
      s: s*100,
      l: l*100
    };
  }
}

module.exports = Flag;
