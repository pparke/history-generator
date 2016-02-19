'use strict';
let chai = require('chai');
let assert = chai.assert;
let should = chai.should();
let Gradient = require('../lib/math/Gradient');
let helpers = require('../lib/math/helpers');

describe('Gradient', function() {
  let grad = new Gradient();

  describe('#linear', function () {
    it('should return a two dimensional array filled with values', function () {
      let direction = {
        x: 0,
        y: 1
      };
      let range = {
        min: 0,
        max: 255
      };

      let result = grad.linear(20, 20, direction, range);
      result.should.have.length(20);
      result[0].should.have.length(20);
      result[0][0].should.be.a('number');
      assert.equal(result[0][0] >= 0, true);
      assert.equal(result[0][0] <= 255, true);
      console.log(result)

      console.log(helpers.normalize(result));
    });
  });
});
