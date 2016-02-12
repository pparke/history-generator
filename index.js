'use strict';

let NameGen = require('./lib/language/NameGen');
let Myth    = require('./lib/language/Myth');
let Grid    = require('./lib/world/Grid');
let util    = require('util');
let Canvas  = require('canvas');
let fs      = require('fs');

let Image   = Canvas.Image;


let nameGen = new NameGen();

// stding starts off paused
process.stdin.resume();
process.stdin.setEncoding('utf8');

console.log(`This is the record of the lifelong researches of ${nameGen.male().ofLength(9).generate()},
set upon the page so they may be preserved from the ravages of time and brought before the eyes of men
to tell their tales of wonder and speak warning of dangers long forgotten.\n\nOptions:\nnames\nmyth\ngrid\nclose\n\n>`);
process.stdin.on('data', function (text) {
  if (text.match(/^close|^quit/i)) {
    done();
  }
  else if (text.match(/^names/i)) {
    generateNames(10, 5).forEach((name, i) => {
      console.log(`${i}) ${name}`);
    });
  }
  else if (text.match(/^myth/i)) {
    writeMyth();
  }
  else if (text.match(/^grid/i)) {
    let args = text.split(' ');
    console.log('matched', args)
    newGrid(parseFloat(args[1]), parseInt(args[2]), parseFloat(args[3]), parseFloat(args[4]), parseFloat(args[5]));
  }
});

function done () {
  process.exit();
}

function generateNames (n, length) {

  let names   = [];
  for (let i = 0; i < n; i++) {
    names.push(nameGen.male().ofLength(length).generate())
  }
  return names;
}

function writeMyth () {
  let myth    = new Myth();
  myth.write();
}

function newGrid (persistance, octaves, xfreq, yfreq, lacun) {
  let width = 1024;
  let height = 1024;
  persistance = persistance || 0.2;
  octaves = octaves || 3;
  xfreq = xfreq || 2/width;
  yfreq = yfreq || 2/height;
  lacun = lacun || 2;
  console.log(`Creating new grid with p=${persistance} o=${octaves} xf=${xfreq} yf=${yfreq} lac=${lacun}`);
  let grid = new Grid(width, height, persistance, octaves, xfreq, yfreq, lacun);
  grid.generate();
  /*
  grid.addHill(width/2, height/2, 96);
  grid.addHill(width/4, height/2, 64);
  grid.addHill(width/2, height/4, 64);
  */

  /*
  let data = grid.toArray().map((elem) => {
    return elem > 254 ? 254 : elem;
  });
  */
  let data = grid.toArray();
  drawMap(data, width, height);
  //console.log(grid.toString());
  //drawMap(grid.toArray());
  //console.log(grid.toArray());
}

function drawMap (data, width, height) {
  let canvas = new Canvas(width, height);
  let ctx = canvas.getContext('2d');

  // set background color
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgb(0, 0, 255)';
  ctx.fill();

  // get the ImageData object
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let imgDD = imageData.data;

  /**
   * Set the value at x y to the given color
   * @param {number} x - the x coord
   * @param {number} y - the y coord
   * @param {object} color - the color as {r, g, b, a}
   */
  let setPixel = function (x, y, color) {
    let offset = ((y * imageData.width) + x) * 4;
    imgDD[offset] = color.r;
    imgDD[offset+1] = color.g;
    imgDD[offset+2] = color.b;
    imgDD[offset+3] = color.a;
  };

  let colorMap = [
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

  // draw each pixel according to the value in data

  data.forEach((col, x) => {
    let row = [];
    col.forEach((point, y) => {
      //point = Math.floor(point).toString(16);
      let color = colorMap[Math.floor(point * 15)];
      //let color = parseInt(`0x${point}${point}${point}`);
      row.push(point);
      setPixel(x, y, color);
    });
  });

  // save the changes to the context
  ctx.putImageData(imageData, 0, 0);

  // Write image buffer to disk
  let out = fs.createWriteStream(__dirname + '/map.png')
  let stream = canvas.createPNGStream();

  stream.on('data', function(chunk){
    out.write(chunk);
  });
}
