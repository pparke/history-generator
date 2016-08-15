'use strict';
let chai        = require('chai');
let assert      = chai.assert;
let should      = chai.should();
let Atmosphere  = require('../lib/world/Atmosphere');
let helpers     = require('../lib/math/helpers');

describe('Atmosphere', function() {
  let atmo = new Atmosphere();

  describe('#insolation', function () {
    it('should give the total sun for the given day and latitude', function () {
      let stefanBoltz = 5.6704E-8;
      for (let d = 0; d <= 90; d += 1) {
        let s = atmo.insolation(100, d);

        // convert MJm to kWh
        s /= 3.6;
        // Wh
        s *= 1000
        // convert to temperature in C
        let temp = (Math.pow(s/(stefanBoltz*24), 0.25) - 273.15);

        console.log(`latitude ${d}:\t\t${temp}`);
      }
      /*
      assert.equal(arr.length, width*height, `length is not equal to ${width*height}`);
      assert(arr[1] >= -1, 'element is not greater than or equal to -1');
      assert(arr[1] <= 1, 'element is not less than or equal to 1');
      */
    });
  });

  describe('#temperature', function () {
    it('should produce an array with temperature values in each element', function () {
      let width = 10;
      let height = 30;
      let arr = new Array(width*height);
      atmo.temperature(arr, width, height);
      arr.forEach((elem, i) => {
        let coords = helpers.coords(i, width);
        if (coords[0] == 0) {
          console.log(`Latitude: ${55 - coords[1]} Temp:\t${elem}`)
        }
      })
    })
  })
});
