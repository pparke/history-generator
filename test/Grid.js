'use strict';
let chai      = require('chai');
let assert    = chai.assert;
let should    = chai.should();
let Grid      = require('../lib/world/Grid');
let helpers   = require('../lib/math/helpers');

describe('RandomDataGenerator', function() {
  let width = 2;
  let height = 18;
  let grid = new Grid(width, height, 2, 3);

  describe('#constructor', function () {
    it('ensure that the grid was properly initialized', function () {

      assert.equal(grid.heightmap.length, width*height);
      assert.equal(grid.heatmap.length, width*height);
      assert.equal(grid.pressuremap.length, width*height);
      assert.equal(grid.densitymap.length, width*height);
    });
  });

  describe('#generate', function () {
    it('should generate new grid data', function () {
      grid.generate();

      for (let i = 0; i < grid.heatmap.length; i++) {
        let temp = helpers.denormalize(grid.heatmap[i], -50, 50);
        console.log(temp)
      }
      
      //console.log(grid.heightmap.slice(0, 20));
      //console.log(grid.heatmap);
      //console.log(grid.pressuremap);
      //console.log(grid.densitymap);
    });
  });
});
