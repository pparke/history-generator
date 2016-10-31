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
      for (let lat = 0; lat <= 90; lat += 1) {
        let s = atmo.insolation(100, lat);

        // convert MJm to kWh
        s /= 3.6;
        // Wh
        s *= 1000
        // convert to temperature in C
        let temp = (Math.pow(s/(stefanBoltz*24), 0.25) - 273.15);

        console.log(`latitude ${lat}:\t\t${temp}`);
      }
      /*
      assert.equal(arr.length, width*height, `length is not equal to ${width*height}`);
      assert(arr[1] >= -1, 'element is not greater than or equal to -1');
      assert(arr[1] <= 1, 'element is not less than or equal to 1');
      */
    });
  });

  describe('#solargain', function () {
    it('should produce an array with temperature values in each element', function () {
      const width = 10;
      const height = 30;
      const lat = 33
      const arr = new Array(width*height).fill(0);

      atmo.solargain(arr, width, height, lat);

      arr.forEach((elem, i) => {
        const [x, y] = helpers.coords(i, width);
        if (x == 0) {
          const temp = atmo.MJtoC(elem);
          console.log(`Latitude: ${lat - y} Temp:\t${temp}`)
        }
      })
    })
  })
});
