'use strict';

let helpers             = require('../math/helpers');

class Atmosphere {
  constructor () {
    this.degreeC            = 0.0125;
    this.heatLossPer100M    = 1;
    this.sealevel           = 0.375
    this.pressureSL         = 101.325; // kPa
    this.pressurePer100M    = 1.2; // kPa
    this.densitySL          = 1.225;
    this.gasConstant        = 287.058;
    this.kelvinOffset       = 273.15;
    this.stefanBoltz        = 5.6704E-8;
  }

  /**
   * Calculate the total insolation on a given day at a given latitude.
   *
   */
  insolation (day, latitude) {

    let lat = helpers.toRad(latitude);
    let dec = helpers.toRad(this.declination(day));

    // calculate the number of hours of sunlight
    let x = (-(Math.sin(lat) * Math.sin(dec)))/(Math.cos(lat) * Math.cos(dec));
    x = Math.min(x, 1);
    x = Math.max(x, -1);
    let hours = helpers.toDeg(Math.acos(x) * 1 / 15);
    let sunrise = 12 - hours;
    let sunset = 12 + hours;

    let totalSun = 0;
    if (hours > 0) {
      // for each hour of daylight add the direct component of
      // the solar radiation to the total sunlight
      for (let t = sunrise; t <= sunset; t++) {
        let airmass = this.airmass(t, day, lat);
        let direct = 1.353 * Math.pow(Math.pow(0.7, airmass), 0.678);
        totalSun += direct;
      }

      let elevation = this.elevation(dec, lat);

      // convert kWh to MJ
      return totalSun * 3.6;
    }
  }

  temperature (arr, width, height, latStart, latSize, day) {
    latStart = 55;
    latSize = latSize || (height / 30);   // assume grid is slightly larger than continental U.S.
    day = day || 100;                     // spring temperature should be moderate

    // get the average temperature for each location
    for (let i = 0; i < arr.length; i++) {
      let coords = helpers.coords(i, width);
      let x = coords[0], y = coords[1];
      let latitude = latStart - Math.floor(y / latSize);
      let ins = this.insolation(day, latitude);
      let temp = this.MJtoC(ins);
      arr[i] = temp;
    }
  }

  /**
   * Convert Mega Joules per m^2 per hour to Celsius
   */
  MJtoC (mj) {
    // convert MJm to kWh
    let kwh = mj / 3.6;
    // Wh
    let wh = kwh * 1000
    // convert to temperature in C
    return (Math.pow(wh/(this.stefanBoltz*24), 0.25) - 273.15);
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
        if (elem >= this.sealevel) {
          // altitude above sea level
          let alt = elem - this.sealevel;
          // temp decrease per 100m
          let dec = (alt / 0.01) * this.heatLossPer100M*this.degreeC;
          // lowest value is 0
          return Math.max(heatmap[x][y] - dec, 0);
        }
        else {
          return heatmap[x][y];
        }
      });
    });
  }

  /**
   * Determine the atmospheric pressure based on height
   * needs normalization
   */
  pressure (heightmap) {
    return heightmap.map((col, x) => {
      return col.map((elem, y) => {
        // if sea level or higher
        if (elem >= this.sealevel) {
          let alt = elem - this.sealevel;
          let dec = (alt / 0.01) * this.pressurePer100M;
          return Math.max(this.pressureSL - dec, 0);
        }
        else {
          return this.pressureSL;
        }
      })
    })
  }

  /**
   * Calculate the air density given the pressure and temperature
   * needs normalization
   */
  density (pressuremap, heatmap) {
    return pressuremap.map((col, x) => {
      return col.map((elem, y) => {
        let temperature = heatmap[x][y];
        let pressure = elem * 1000; // convert to Pa from kPa
        // denormalize temperature and convert to kelvin
        let kelvin = this.kelvinOffset + (temperature / this.degreeC);
        let rho = pressure / (this.gasConstant * kelvin)
        return rho;
      });
    });
  }

  /**
   * Determine the humidity based on terrain and temperature
   */
  humidity (heightmap, heatmap) {

  }

  /**
   * Determines the evaporation in mm per day for the given area
   * @param {number} radiation - solar radiation in MJm^2/day
   */
  evaporation (radiation, m2) {
    m2 = m2 || 1;
    return (radiation * 0.408) * m2;
  }

  /**
   * Determine the direction of the wind based
   * on the terrain and the temperature
   */
  wind (heightmap, heatmap) {

  }

  /**
   * Diffuse density throughout the grid
   */
  diffuse (densitymap, diffuseRate, deltaT) {
    let width     = densitymap.length - 1;
    let height    = densitymap[0].length - 1;
    let a         = deltaT * diffuseRate * width * height;
    let nextDens  = Array.from(densitymap);

    for (let i = 0; i < 20; i++) {
      nextDens = densitymap.map((col, x) => {
        return col.map((elem, y) => {
          let west = nextDens[Math.max(x-1, 0)][y];
          let east = nextDens[Math.min(x+1, width)][y];
          let north = nextDens[x][Math.max(y-1, 0)];
          let south = nextDens[x][Math.min(y+1, height)];
          return (elem + a * (west + east + north + south)) / (1 + 4 * a);
        });
      });
    }

    return nextDens;
  }

  /**
   * Calculate the declination of the sun based on the day
   */
  declination (day) {
    let radPerDay = helpers.toRad(0.98565);
    return -helpers.toDeg(Math.asin(0.39779 * Math.cos(radPerDay * (day + 10) + helpers.toRad(1.914) * Math.sin(radPerDay * (day - 2)))));
  }

  /**
   * Calculate the air mass that sunlight must travel through on a given
   * hour, day, and latitude
   */
  airmass(hour, day, latitude){
    let dec = helpers.toRad(this.declination(day));
    let elevation = this.elevation(dec, latitude, hour);
    let declination = helpers.toRad(90) - elevation;
    return 1 / (1E-4 + Math.cos(declination))
  }

  /**
   * Calculate the solar elevation angle
   */
  elevation (declination, latitude, hour) {
    let rhs = Math.sin(declination) * Math.sin(latitude);
    let lhs = Math.cos(declination) * Math.cos(latitude);
    if (hour) {
      let hourAngle = helpers.toRad(15 * (hour - 12));
      lhs *= Math.cos(hourAngle);
    }
    let el = Math.asin(rhs + lhs);
    return el;
  }
}

module.exports = Atmosphere;
