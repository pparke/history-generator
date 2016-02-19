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
  fn = fn || () => null;

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
 * Normalize the height values by finding the maximum and minimum
 * and clamping the height value between them
 */
function normalize (data) {
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

module.exports = {
  dot:      dot,
  lerp:     lerp,
  cerp:     cerp,
  smooth1d: smooth1d,
  smooth2d: smooth2d,
  mnArray:  mnArray,
  sumGrids: sumGrids,
  normalize: normalize
}
