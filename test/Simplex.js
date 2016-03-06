'use strict';
let chai = require('chai');
let assert = chai.assert;
let should = chai.should();
let Simplex = require('../lib/math/Simplex');

describe('Simplex', function() {
  let simplex = new Simplex();
  let width = 500;
  let height = 500;

  describe('#fill', function () {
    it('should fill the given array with noise', function () {
      let buf = new ArrayBuffer(width * height * 4);
      let arr = new Float32Array(buf);
      simplex.fill(arr, width, height);

      assert.equal(arr.length, width*height, `length is not equal to ${width*height}`);
      assert(arr[1] >= -1, 'element is not greater than or equal to -1');
      assert(arr[1] <= 1, 'element is not less than or equal to 1');
      console.log(arr.slice(0, 20))
    });
  });
});
