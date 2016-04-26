'use strict';

const Grid                = require('../lib/world/Grid');
const util                = require('util');
const helpers             = require('../lib/math/helpers');

const palette = [
  {r: 34, g: 32, b: 52, a: 255},
  {r: 63, g: 63, b: 116, a: 255},
  {r: 48, g: 96, b: 130, a: 255},
  {r: 91, g: 110, b: 225, a: 255},
  {r: 99, g: 155, b: 255, a: 255},
  {r: 255, g: 211, b: 92, a: 255},
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

function setupGrid (width, height) {
  let persistance = 0.3;
  let octaves     = 8;
  let xfreq       = 2/width;
  let yfreq       = 2/height;
  let lacun       = 4;
  console.log(`\nCreating new grid with persistance=${persistance} octaves=${octaves} xFreq=${xfreq} yFreq=${yfreq} lacunarity=${lacun} noiseFn='simplex'`);
  let g = new Grid(width, height);
  g.terra.randomizePerm();
  g.terra.setParams(persistance, octaves, xfreq, yfreq, lacun);
  return g;
}

function drawGrid (grid) {
  let canvas  = document.getElementById('canvas');
  let ctx     = canvas.getContext('2d');

  // set background color
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgb(0, 0, 255)';
  ctx.fill();

  // get the ImageData object
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let imgDD     = imageData.data;

  // draw each pixel according to the height value
  for (let i of renderLine(grid, 'heightmap', imageData)) {
    // save the changes to the context
    ctx.putImageData(imageData, 0, 0);
  }

}

function* renderLine (grid, layer, imageData) {
  let y = 0;
  while (y < grid.height) {
    for (let x = 0; x < grid.width; x++) {
      let offset = helpers.offset(x, y, grid.width);
      let value = grid[layer][offset];
      let color = palette[Math.floor(value * (palette.length - 1))];
      setPixel(imageData.data, offset, color);
    }
    y++;
    yield;
  }
}

function setPixel (data, i, color) {
  let offset = i * 4;
  data[offset] = color.r;
  data[offset+1] = color.g;
  data[offset+2] = color.b;
  data[offset+3] = color.a;
}

let g = setupGrid(256, 256);
g.generate();
console.log(g.heightmap)
drawGrid(g);
