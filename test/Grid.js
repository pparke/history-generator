'use strict';
let chai = require('chai');
let assert = chai.assert;
let should = chai.should();
let Grid = require('../lib/world/Grid');

describe('RandomDataGenerator', function() {
  let grid = new Grid(20, 20, 2, 3);

  describe('#constructor', function () {
    it('ensure that the grid was properly initialized', function () {
      assert.equal(grid.data.length, 20);
      assert.equal(grid.data[0].length, 20);

      let firstElem = grid.data[0][0];
      firstElem.should.have.property('x');
      firstElem.should.have.property('y');
      firstElem.should.have.property('height');
      console.log('first elem', firstElem);
    });
  });

  describe('#applyNoise', function () {
    it('should apply the noise function to the data in the grid', function () {
      let firstElem = grid.data[0][0];
      console.log('first elem', firstElem);
    });
  });
});
