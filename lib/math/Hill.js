'use strict';

class Hill {
  constructor () {

  }

  /**
   * Add a hill to the given array
   */
  addHill (data, centerx, centery, radius) {
    data.forEach((col, x) => {
      col.forEach((elem, y) => {
        let height = Math.pow(radius, 2) - (Math.pow((x - centerx), 2) + Math.pow((y - centery), 2));
        elem += height < 0 ? 0 : height;
      });
    });
  }
}

module.exports = Hill;
