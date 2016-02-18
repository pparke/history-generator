'use strict';


class Atmosphere {
  constructor () {

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
        if (elem >= 0.375) {
          // altitude above sea level
          let alt = elem - 0.375;
          // temp increase per 100m
          let inc = (alt / 0.01) * 0.0125;
          return heatmap[x][y] + inc;
        }
      });
    });
  }
}

module.exports = Atmosphere;
