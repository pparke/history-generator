'use strict';

const Display             = require('../lib/ui/Display');
const helpers             = require('../lib/math/helpers');

class Caves {
  constructor () {
    this.display = new Display();
    this.seeds = new Array(20).fill((Math.random()*100000) + 100);
    this.canvas = document.getElementById('canvas');
    this.width = canvas.width;
    this.height = canvas.height;


    this.buf = new ArrayBuffer(this.width*this.height);
    this.cavemap = new Uint8Array(this.buf);

    this.tBuf = new ArrayBuffer(this.width*this.height);
    this.temp = new Uint8Array(this.buf);

    this.iBuf = new ArrayBuffer(this.width*this.height);
    this.initialState = new Uint8Array(this.iBuf);

    this.fps = 10;
    this.time = new Date().getTime();
    this.paused = false;

    this.rules;
    this.underpopMod  = 0.6;
    this.overpopMod   = 1.3;
    this.underpopLim  = 1/4;
    this.overpopLim   = 2/3;

    this.setup();
  }

  setup () {
    // create caves
    this.initializeMap(0.45);
    // save original state
    this.initialState.set(this.cavemap);
    // render to canvas
    this.display.render(this.canvas, this.cavemap, this.width, this.height, {renderStyle: 'monochrome'});

    this.createRules(3, 3);
  }

  /**
   * Create caves using cellular automata
   */
  initializeMap (chanceToLive = 0.45) {
    // initialise map
    for (let i = 0; i < this.cavemap.length; i++) {
      if (Math.random() < chanceToLive) {
        this.cavemap[i] = 1;
      }
    }
  }

  reset () {
    this.cavemap.set(this.initialState);
  }

  togglePause () {
    this.paused = !this.paused;
    this.update();
  }

  /**
   * Main run loop
   */
  update () {
    if (this.paused) {
      return;
    }

    const now = new Date().getTime();
    const dt = now - this.time;
    const rate = 1000/this.fps;

    if (dt > rate) {
      this.time = now - (this.time % rate);
      this.step();
      this.display.render(this.canvas, this.cavemap, this.width, this.height, {renderStyle: 'monochrome'});
    }
    window.requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Update each cell according to the rules
   */
  step () {
    for (let i = 0; i < this.cavemap.length; i++) {
      this.temp[i] = this.rules[this.fastNeighbours(i)];
    }
    this.cavemap.set(this.temp);
  }

  /**
   * Create the ruleset as a 1D array of values indexed by the positional values
   * of neighbouring cells encoded as an 8 bit number
   * @param  {number} w - the width of the area
   * @param  {number} h - the height of the area observed
   * @return {array}    - a 1D array of 0 or 1
   */
  createRules (w, h) {
    const ruleLength = (w*h)-1;

    let comb = Math.pow(2, ruleLength);
    let rules = [];
    for (let i = 0; i < comb; i++) {
      let mult = Math.random()
      if (i/comb < this.underpopLim) mult *= this.underpopMod;
      else if (i/comb > this.overpopLim) mult *= this.overpopMod;
      const state = Math.round(mult);
      rules.push(state);
    }
    this.rules = rules;
  }

  /**
   * Set the rules in current use to those provided
   */
  setRules(rules) {
    this.rules = rules.split('\n').map((rule) => {
      return parseInt(rule.trim());
    });
    console.log(`Set rules to: ${this.rules}`);
  }

  /**
   * Returns the neighbours of the given offset as a number
   * @param  {[type]} cavemap [description]
   * @param  {[type]} width   [description]
   * @param  {[type]} offset  [description]
   * @return {[type]}         [description]
   */
  fastNeighbours (offset) {
    let bit = 7;
    let neighbs = 0;
    for (let y = -1; y < 2; y++) {
      for (let x = -1; x < 2; x++) {
        if (!x && !y) {
          continue;
        }
        let newOffset = offset + x + (this.width * y);
        if (newOffset < 0) {
          newOffset = this.cavemap.length + newOffset;
        }
        else if (newOffset > this.cavemap.length) {
          newOffset = newOffset % this.cavemap.length;
        }
        neighbs = (this.cavemap[offset + x + (this.width * y)]) << bit | neighbs;
        bit -= 1;
      }
    }
    return neighbs;
  }
}







/**
 * Do a simulation step and update the map
 * @param  {Uint8Array} cavemap   - array representing the cave map
 * @param  {number} width         - the width of the map
 * @param  {number} height        - the height of the map
 */
function caveStep (cavemap, width, height, options) {
  options = options || {};
  let deathLimit = options.deathLimit || 2;
  let birthLimit = options.birthLimit || 3;
  let overpopLimit = options.overpopLimit || 5;

  // save the original state
  let original = Uint8Array.from(cavemap);
  // loop over the map and update
  for (let i = 0; i < cavemap.length; i++) {
    let x, y;
    [x, y] = helpers.coords(i, width);
    let neighbours = countAliveNeighbours(original, x, y, width, height);
    // if alive
    if (original[i] > 0) {
      if (neighbours < deathLimit) {
        cavemap[i] = 0;
      }
      else if (neighbours > overpopLimit) {
        cavemap[i] = 0;
      }
      else {
        cavemap[i] = 1;
      }
    }
    // if dead
    else {
      if (neighbours > birthLimit) {
        cavemap[i] = 1;
      }
      else {
        cavemap[i] = 0;
      }
    }
  }
}



function compare (arrA, arrB, exclude) {
  return arrA.every((el, i) => {
    if (i === exclude) return true;
    return el === arrB[i];
  });
}

function decToBin (dec) {
  return (dec >>> 0).toString(2);
}

function pad (n, l, p) {
  if (n.length >= l) {
    return n;
  }
  const numP = l - n.length;
  const zs = new Array(numP).fill(p).join('');
  return zs + n;
}





function getArea(cavemap, width, center, range) {
  const half = {
    h: range.h % 2 === 0 ? range.h / 2 : (range.h - 1) / 2,
    w: range.w % 2 === 0 ? range.w / 2 : (range.w - 1) / 2
  };
  /*
  const center = {
    x: helpers.coords(center, width)[0],
    y: helpers.coords(center, height)[1]
  };
  */
  const topLeft = {
    x: center.x - half.w,
    y: center.y - half.h
  };

  let area = [];
  for (var x = topLeft.x, y = topLeft.y; y < topLeft.y + range.h; y++) {
    let offset = helpers.offset(x, y, width);
    area.push(cavemap.slice(offset, offset + range.w));
  }

  return area;
}

/**
 * Determine how many living neighbours the cell has
 * @param  {Uint8Array} cavemap  - the array of cells
 * @param  {number} x       - the x position
 * @param  {number} y       - the y position
 * @param  {number} width   - the width of the map
 * @param  {number} height  - the height of the map
 * @return {number}         - the number of living neighbours
 */
function countAliveNeighbours (cavemap, x, y, width, height) {
  let count = 0;
  for (let xx = -1; xx < 2; xx++) {
    for (let yy = -1; yy < 2; yy++) {
      let nx = x+xx;
      let ny = y+yy;
      if (nx === 0 && ny === 0) {
        // don't count self
      }
      else if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        count += 1;
      }
      else if (cavemap[helpers.offset(nx, ny, width)] > 0) {
        count += 1;
      }
    }
  }

  return count;
}

const buttons = {
  restart: null,
  reset: null,
  pause: null,
  setRules: null
}

const inputs = {
  overpop: null,
  underpop: null,
  rules: null,
  fps: null
}

document.addEventListener('DOMContentLoaded', function () {
  const caves = new Caves();


  buttons.restart = document.getElementById('restart');
  buttons.restart.onclick = function () {
    caves.underpopMod = inputs.underpopMod.value  || 0.6;
    caves.overpopMod = inputs.overpopMod.value    || 1.3;
    caves.underpopLim = inputs.underpopLim.value  || 1/4;
    caves.overpopLim = inputs.overpopLim.value    || 2/3;
    caves.setup();

    // show the rules
    inputs.rules.value = caves.rules.join('\n');
  }

  buttons.reset = document.getElementById('reset');
  buttons.reset.onclick = caves.reset.bind(caves);

  buttons.pause = document.getElementById('pause');
  buttons.pause.onclick = caves.togglePause.bind(caves);

  buttons.setRules = document.getElementById('setRules');
  buttons.setRules.onclick = function(){
    caves.setRules(inputs.rules.value);
  }

  inputs.overpopMod = document.getElementById('overpopMod');
  inputs.underpopMod = document.getElementById('underpopMod');
  inputs.overpopLim = document.getElementById('overpopLim');
  inputs.underpopLim = document.getElementById('underpopLim');
  inputs.rules = document.getElementById('rules');
  inputs.fps = document.getElementById('fps');
  caves.fps = inputs.fps.value;
  inputs.fps.onchange = function() {
    caves.fps = inputs.fps.value;
  }

});
