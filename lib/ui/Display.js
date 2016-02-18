'use strict';

let Canvas              = require('canvas');
let fs                  = require('fs');

let Image   = Canvas.Image;

class Display {
  constructor (outdir, imageName) {

    this.outdir = outdir;
    this.imageName = imageName;

    this.palettes = {
      terrain: [
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
      ],

      temp: [
        {r: 201, g: 79, b: 166, a: 100},
        {r: 134, g: 0, b: 131, a: 100},
        {r: 32, g: 1, b: 141, a: 100},
        {r: 1, g: 137, b: 255, a: 100},
        {r: 254, g: 255, b: 3, a: 100},
        {r: 255, g: 119, b: 1, a: 100},
        {r: 255, g: 12, b: 0, a: 100},
        {r: 122, g: 0, b: 1, a: 100}
      ]
    };
  }

  /**
   * Render a grid as an image
   */
  render (grid, fileName, options) {
    fileName        = fileName || this.imgName;
    let width       = grid.length;
    let height      = grid[0].length;
    options         = options || {};
    let renderStyle = options.renderStyle || 'palette';
    let paletteKey  = options.paletteKey || 'terrain';

    let renderFn;
    if (renderStyle === 'palette') {
      renderFn = this.paletteBrush.bind(this, paletteKey);
    }

    // create a new canvas to render to
    let canvas = new Canvas(width, height);
    let ctx = canvas.getContext('2d');

    // set background color
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0, 0, 255)';
    ctx.fill();

    // get the ImageData object
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let imgDD     = imageData.data;

    // draw each pixel according to the height value
    grid.forEach((col, x) => {
      col.forEach((elem, y) => {
        let color = renderFn(elem);
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
   * Return a color value from a palette based on the value
   * @param {string} key - the key the palette is store under
   * @param {number} value - the numerical value to convert to a palette index 0..1
   */
  paletteBrush (key, value) {
    let palette = this.palettes[key];
    return palette[Math.floor(value * (palette.length - 1))];
  }

  /**
   * Combine two grids
   * TODO
   */
  combine (grid1, grid2) {
    // show temperature overlaid on the map
    if (this.showTemperature) {
      let temperature = elem.temperature;
      let bg = this.heightColorMap[Math.floor(height * 15)];
      let fg = this.tempColorMap[Math.floor(temperature * 7)];
      // blend colors
      color = this.blend(fg, bg);
    }
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
}

module.exports = Display;
