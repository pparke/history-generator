'use strict';

/**
 * Dot Product
 */
function dot (a, b) {
  return a.reduce((total, elem, i) => {
    total += elem * b[i];
    return total;
  }, 0);
}

/**
 * Linear Interpolation
 */
function lerp (a, b, t) {
  return a * (1 - t) + b * t;
}

/**
 * Cosine Interpolation
 */
function cerp (a, b, t) {
  let ft = t * Math.PI;
  let f = (1 - Math.cos(ft)) * 0.5;

  return a * (1 - f) + b * f;
}

/**
 * Smooth 1d
 */
function smooth1d (source, x) {
  return source[x]/2 + source[x - 1]/4 + source[x + 1]/4;
}

/**
 * Smooth 2d
 */
function smooth2d (source, x, y) {
  let rowLen  = source.length - 1;
  let colLen  = source[0].length - 1;

  // wrap x and y values which may be much greater than
  // or less than the bounds of the array
  x           = x > -1          ? x     : rowLen + (x % rowLen);
  x           = x < rowLen      ? x     : x % rowLen;
  y           = y > -1          ? y     : colLen + (y % colLen);
  y           = y < colLen      ? y     : y % colLen;
  let west    = x - 1 > -1      ? x - 1 : rowLen + (x % rowLen);
  let east    = x + 1 < rowLen  ? x + 1 : x % rowLen;
  let north   = y - 1 > -1      ? y - 1 : colLen + (y % colLen);
  let south   = y + 1 < colLen  ? y + 1 : y % colLen;

  try {
    let corners = ( source[west][north] + source[east][north] + source[west][south] + source[east][south] ) / 16;
    let sides   = ( source[west][y] + source[east][y] + source[x][north] + source[x][south] ) / 8;
    let center  = ( source[x][y] ) / 4;
    return corners + sides + center;
  }
  catch (e) {
    console.log('rowLen', rowLen, 'colLen', colLen, 'west', west, 'north', north, 'east', east, 'south', south, 'x', x, 'y', y)
    throw new Error(e);
  }

}

/**
 * Create an array of dimensions m x n
 * filled with values produced by fn
 */
function mnArray (m, n, fn) {
  if (!fn) {
    fn = function () {
      return null;
    }
  }

  let array = new Array(m);
  array.fill(null);
  return array.map((col, x) => {
     let subArray = new Array(n);
     subArray.fill(null);
     return subArray.map((elem, y) => {
       return fn(x, y);
     });
   });
}

function sumGrids (grid1, grid2) {
  return grid1.map((col, x) => {
    return col.map((elem, y) => {
      return elem + grid2[x][y];
    });
  });
}

/**
* Normalize the value to a percentage of the range
* @param {number} value - the number to normalize
* @param {number} min - the lowest value in the range
* @param {number} max - the largest value in the range
*/
function normalize (value, min, max) {
  let norm = 0;
  if (max - min !== 0) {
    norm = (value - min) / (max - min);
  }

  return norm;
}

/**
 * Denormalize the normalized percentage to a number in the given range
 */
function denormalize (value, min, max) {
  return ((value * (max - min)) + min);
}

function minmax (data) {
  let min = data[0];
  let max = data[0];
  for (let i = 0; i < data.length; i++) {
    if (data[i] < min) {
      min = data[i];
    }
    else if (data[i] > max) {
      max = data[i];
    }
  }
  return [min, max];
}



function shuffle (oldA) {
  let newA = Array.from(oldA);

  let max = newA.length - 1;
  newA.forEach((elem, i, arr) => {
    let newPos = Math.floor(Math.random()*max);
    let a = arr[newPos];
    arr[newPos] = elem;
    arr[i] = a;
  });

  return newA;
}

function toRad (angle) {
  return (angle * Math.PI / 180);
}

function toDeg (angle){
  return (180 * angle / Math.PI);
}

/**
 * Return x y coords for the given element in a
 * 1D array of the given width
 */
function coords (i, width) {
  let y = Math.floor(i / width);
  let x = i % width;
  return [x, y];
}

/**
 * Return the offset into a 1d array for the
 * given x and y coordinates
 */
function offset (x, y, width) {
  return (x + (y * width));
}

module.exports = {
  dot:          dot,
  lerp:         lerp,
  cerp:         cerp,
  smooth1d:     smooth1d,
  smooth2d:     smooth2d,
  mnArray:      mnArray,
  sumGrids:     sumGrids,
  normalize:    normalize,
  denormalize:  denormalize,
  minmax:       minmax,
  shuffle:      shuffle,
  toRad:        toRad,
  toDeg:        toDeg,
  coords:       coords,
  offset:       offset
}
