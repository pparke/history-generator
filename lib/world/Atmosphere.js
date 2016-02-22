'use strict';

const degreeC = 0.0125;

class Atmosphere {
  constructor () {
    this.heatLossPer100M = 1;
  }

  /**
   * Temperatures are cooler at heigher altitude, about 1 degree
   * per 100 meters.  0.0001 = 1m and 0.0125 = 1 degree C
   * 0.375 = sea level
   */
  surfaceHeat (heightmap, heatmap) {
    return heightmap.map((col, x) => {
      return col.map((elem, y) => {
        // if sea level or higher
        if (elem > 0.375) {
          // altitude above sea level
          let alt = elem - 0.375;
          // temp decrease per 100m
          let dec = (alt / 0.01) * this.heatLossPer100M*degreeC;
          // lowest value is 0
          return Math.max(heatmap[x][y] - dec, 0);
        }
        else {
          return heatmap[x][y];
        }
      });
    });
  }
}

module.exports = Atmosphere;
