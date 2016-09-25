'use strict';

const Display             = require('../lib/ui/Display');
const Terrain             = require('../lib/world/Terrain');
const helpers             = require('../lib/math/helpers');

let display = new Display();
let seeds = new Array(20).fill((Math.random()*100000) + 100);
let canvas = document.getElementById('canvas');
let width = canvas.width;
let height = canvas.height;
let terra = new Terrain(width, height, seeds);
let buf = new ArrayBuffer(width*height);
let cavemap = new Uint8Array(buf);
// create caves
terra.caves(cavemap, width, height, 1, {
  birthLimit: 3,
  deathLimit: 4,
  overpopLimit: 6
});
// render to canvas
display.render(canvas, cavemap, width, height, {renderStyle: 'monochrome'});

let fps = 10;
let rate = 1000/fps;
let time = new Date().getTime();

function update () {
  let now = new Date().getTime();
  let dt = now - time;

  if (dt > rate) {
    time = now - (time % rate);
    terra.caveStep(cavemap, width, height, {
      birthLimit: 3,
      deathLimit: 4,
      overpopLimit: 6
    });
    display.render(canvas, cavemap, width, height, {renderStyle: 'monochrome'});
  }
  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
