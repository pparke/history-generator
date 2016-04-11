'use strict';

let helpers             = require('../math/helpers');

class Atmosphere {
  constructor () {
    this.sampleArea         = 1; // m^2
    this.heatLossPer100M    = 1;
    this.pressureSL         = 101.325; // kPa
    this.pressurePer100M    = 1.2; // kPa
    this.densitySL          = 1.225;
    this.idealGasConstant   = 8.3144598;
    this.gasConstantAir     = 287.058;
    this.gasConstantWater   = 461.495;
    this.kelvinOffset       = 273.15;
    this.stefanBoltz        = 5.6704E-8;
    this.minHeight          = -2000;
    this.maxHeight          = 6000; // m
    this.hundredM           = 100 / (this.maxHeight - this.minHeight);
    this.sealevel           = helpers.normalize(0, this.minHeight, this.maxHeight);
    this.minTemp            = -50.0;
    this.maxTemp            = 50.0;
    this.degreeC            = 1 / (this.maxTemp - this.minTemp);
    this.minPress           = 0;
    this.maxPress           = 105.0;
    this.minDens            = 0;
    this.maxDens            = 1.639;
    this.minHumid           = 0;
    this.maxHumid           = 0.083; // kg/m^3
    this.minWind            = 0;
    this.maxWind            = 113; // m/s
    this.latentHeatWater    = 2.26; // MJ/kg
    this._emissivity        = {
      ice:        0.97,
      water:      0.95,
      soil:       0.90,
      sand:       0.76,
      sandstone:  0.59,
      granite:    0.45
    };
  }

  /* TODO
   * 1) add albedo map, will effect surface temperature depending on the albedo of the terrain (water vs land vs vegetation vs rock)
   * clouds can also increase albedo so the measurement will need to be instantaneous (daily) and use a cloudmap as well but clouds
   * will also determine the greenhouse effect so we need a model for how this should work
   * 2) hydrological cycle will need to account for amount of water on top of land, amount of water soaked into land, amount of water
   * in vegetation
   */

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

  /**
   * Fill the given array with the solar radiation value in Mj
   * currently calculates the insolation in Mj per m^2
   * TODO: add ability to calculate insolation for arbitrary areas
   */
  solargain (arr, width, height, latStart, totalLat, day) {
    latStart  = latStart  || 55;
    totalLat  = totalLat  || 30;    // assume grid is slightly larger than continental U.S.
    day       = day || 100;         // spring temperature should be moderate

    let latPerRow = totalLat/height;

    // get the average temperature for each location
    for (let i = 0; i < arr.length; i++) {
      let coords = helpers.coords(i, width);
      let x = coords[0], y = coords[1];
      let latitude = latStart - (y * latPerRow);
      arr[i] = this.insolation(day, latitude);
      /*
      let temp = this.MJtoC(ins);
      arr[i] = helpers.normalize(temp, this.minTemp, this.maxTemp);
      */
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

  greenhouse (mj) {
    // convert MJm to kWh
    let kwh = mj / 3.6;
    // Wh
    let wh = kwh * 1000
    let albedo = 0.3;
    let em = 0.8;
    return (Math.pow( (wh * (1 - albedo)/(this.stefanBoltz*24)) * (1/(1-(em/2))), 0.25) - 273.15);
  }

  /**
   * Temperatures are cooler at heigher altitude, about 1 degree
   * per 100 meters.
   */
  surfaceHeat (heatmap, heightmap, solarmap) {
    if (heightmap.length !== heatmap.length) {
      throw new Error('Heatmap and Heightmap must be of same size.');
    }

    for (let i = 0; i < heightmap.length; i++) {
      // calculate temperature of the surface
      let temp = this.MJtoC(solarmap[i]);
      // normalize temperature
      temp = helpers.normalize(temp, this.minTemp, this.maxTemp);
      // if sea level or higher adjust the temperature downwards with altitude
      if (heightmap[i] >= this.sealevel) {
        // altitude above sea level
        let alt = heightmap[i] - this.sealevel;
        // temp decrease per 100m
        let dec = (alt / this.hundredM) * this.heatLossPer100M * this.degreeC;
        temp -= dec;
      }
      // lowest value is 0
      heatmap[i] = Math.max(temp, 0);
    }
  }

  /**
   * Determine the atmospheric pressure based on height
   */
  pressure (pressuremap, heightmap) {
    if (pressuremap.length !== heightmap.length) {
      throw new Error('Destination pressuremap must be the same length as the heightmap.');
    }

    for (let i = 0; i < pressuremap.length; i++) {
      // if greater than sea level
      if (heightmap[i] > this.sealevel) {
        let alt = heightmap[i] - this.sealevel;
        let dec = (alt / this.hundredM) * this.pressurePer100M;
        pressuremap[i] = helpers.normalize(Math.max(this.pressureSL - dec, 0), this.minPress, this.maxPress);
      }
      else {
        pressuremap[i] = helpers.normalize(this.pressureSL, this.minPress, this.maxPress);
      }
    }
  }

  /**
   * Calculate the air density given the pressure and temperature
   */
  density (densitymap, pressuremap, heatmap, humiditymap) {
    if (densitymap.length !== pressuremap.length || densitymap.length !== heatmap.length) {
      throw new Error('Density, pressure and heat arrays must be the same length');
    }

    for (let i = 0; i < densitymap.length; i++) {
      let temperature = heatmap[i];
      let airPressure = helpers.denormalize(pressuremap[i], this.minPress, this.maxPress) * 1000; // convert to kPa from Pa
      let waterPressure = helpers.denormalize(humiditymap[i], this.minHumid, this.maxHumid) * 1000;
      // denormalize temperature and convert to kelvin
      let kelvin = this.kelvinOffset + helpers.denormalize(temperature, this.minTemp, this.maxTemp);
      // calculate density of dry air
      let rhoA = pressure / (this.gasConstantAir * kelvin);
      // calculate the density of the water vapor
      let rhoW = waterPressure / (this.gasConstantWater * kelvin);

      let rho = rhoA + rhoB;

      densitymap[i] = helpers.normalize(rho, this.minDens, this.maxDens);
    }
  }

  /**
   * Determine the humidity
   * Calculates the absolute humidity by determining the daily evaporation rate
   */
  humidity (humiditymap, heatmap, solarmap, pressuremap, windmap, heightmap) {

    for (let i = 0; i < humiditymap.length; i++) {
      let temp            = helpers.denormalize(heatmap[i], this.minTemp, this.maxTemp);
      let partialPressure = helpers.denormalize(humiditymap[i], this.minHumid, this.maxHumid);
      let absoluteHumid   = this.densityWaterVapor(temp, partialPressure);
      let pressure        = helpers.denormalize(pressuremap[i], this.minPress, this.maxPress);
      let wind            = helpers.denormalize(windmap[i], this.minWind, this.maxWind);
      // determine the absolute humidity based on evaporation
      let evapRate = evaporation(temp, solarmap[i], pressure, wind, absoluteHumid);
      // determine volume of water evaporated for the given sample area (in m^2)
      let waterMass = ((evapRate/1000) * this.sampleArea);
      humiditymap[i] += helpers.normalize(waterMass, this.minHumid, this.maxHumid);
    }
  }

  /**
   * Determines the evaporation in mm per day for the given area
   * Shuttleworth equation describing evaporation for an open water surface
   * @param {number} temp - temperature in degrees C
   * @param {number} radiation - solar radiation in MJm^2/day
   * @param {number} pressure - pressure in kPa
   * @param {number} windSpeed - the wind speed in m/s
   * @param {number} humidity - the absolute humidity in kg/m^3
   * @return {number} the rate of water evaporation in mm/day
   */
  evaporation (temp, radiation, pressure, windSpeed, humidity) {
    let m = this.slopeSVPC(temp);
    let gamma = this.psychrometricConstant(pressure, temp);
    // TODO: double check this equation to see if it works
    let vapourPressDeficit = (1 - this.relativeHumidity(temp, pressure, humidity)) * this.saturationPressure(temp);

    return (((m * radiation) + gamma * 6.43 * (1 + 0.536 * windSpeed) * vapourPressDeficit) / (this.latentHeatWater * (m + gamma)));
  }

  /**
   * Slope of the relationship between saturation vapour pressure
   * in kPa and temperature in degrees C
   */
  slopeSVPC (temp) {
    return 0.04145 * Math.pow(Math.E, 0.06088*temp);
  }

  /**
   * Relates partial pressure of water in air to the air temperature
   * @param {number} pressure - the air pressure in kPa
   */
  psychrometricConstant (pressure, temp) {
    return ((0.0016286 * pressure) / (this.latentHeatWater * 0.622));
  }

  /**
   * Latent heat of water vaporization
   */
  enthalpy (temp) {
    return (2.501 - ((2.361e-3)*temp));
  }


  /**
  * Saturation pressure of water vapour
  * @param {number} temp - temperature in degrees C
  * @return vapour pressure in kPa
  */
  saturationPressure (temp) {
    // convert temperature to kelvin
    temp = this.kelvinOffset + temp;
    return ((Math.pow(Math.E, (77.3450 + 0.0057 * temp - 7235 / temp)) / Math.pow(temp, 8.2)) / 1000);
  }

  /**
   * Saturation vapor density
   * @param {number} temp - the temperature in celsius
   * @param {number} press - the pressure in kPa
   * @return {number} kg/m^3
   */
  saturationDensity (temp, press) {
    // convert pressure to Pa
    press = press * 1000;
    // convert temperature to kelvin
    temp = this.kelvinOffset + temp;
    let molarMassWater = 18.01528;

    return ((press * molarMassWater) / (this.idealGasConstant * temp) * 0.001);
  }

  /**
   * Partial pressure of water vapor
   * @param {number} temp - the temperature in celsius
   * @param {number} densityWater - the density of water in kg/m^3
   * @return {number} the partial pressure of water vapor in kPa
   */
  partialPressure (temp, densityWater) {
    // convert celsius to kelvin
    temp = this.kelvinOffset + temp;
    return ((densityWater * temp)/2.2);
  }

  /**
   * Density of water vapor
   * @param {number} temp - the temperature in celsius
   * @param {number} partialPressure - the partial pressure of water vapor in kPa
   * @return {number} density of water vapor in kg/m^3
   */
  densityWaterVapor (temp, partialPressure) {
    // convert to Pa
    partialPressure *= 1000;
    // convert celsius to kelvin
    temp = this.kelvinOffset + temp;
    return ((0.0022 * partialPressure)/temp);
  }

  /**
   * Relative humidity as the relationship between the mass of
   * the water in the air to the mass required to saturate at
   * this temperature and pressure.
   * @param {number} temp - the temperature in C
   * @param {number} press - the pressure in kPa
   * @param {number} waterMass - the mass of the water vapor in kg
   */
  relativeHumidity (temp, press, waterMass) {
    return (waterMass / this.saturationDensity(temp, press));
  }

  /**
   * Determine the direction of the wind based
   * on the terrain and the density
   */
  wind (windxmap, windymap, heightmap, densitymap, width, height, rate, deltaT) {
    let a = rate * deltaT;

    for (let x = 1; x < width - 1; x++) {
      for (let y = 1; y < height - 1; y++) {
        let i = helpers.offset(x, y, width);
        // get the force due to difference in density
        let forcex = densitymap[i] - densitymap[i+1];
        let forcey = densitymap[i+width];
        // TODO: get the friction due to the terrain
        windxmap[i]         += a * forcex;
        windxmap[i+1]       += a * forcex;
        windymap[i]         += a * forcey;
        windymap[i+width]   += a * forcey;
      }
    }
  }

  /**
   * Calculate the air velocity based on the two directional components
   * @param  {array} velocitymap - the output array that will contain the velocities
   * @param  {array} windxmap    - the array containing the x components
   * @param  {array} windymap    - the array containing the y components
   */
  velocity (velocitymap, windxmap, windymap) {
    for (let i = 0; i < width; i++) {
      velocitymap[i] = Math.sqrt(Math.pow(windxmap[i], 2) + Math.pow(windymap[i], 2));
    }
  }

  /**
   * Diffuse density throughout the grid
   */
  diffuse (densitymap, width, height, diffuseRate, deltaT) {
    let a         = deltaT * diffuseRate * width * height;
    let originalmap  = Array.from(densitymap);

    for (let i = 0; i < 20; i++) {
      for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
          let west = densitymap[helpers.offset(x - 1, y, width)];
          let east = densitymap[helpers.offset(x + 1, y, width)];
          let north = densitymap[helpers.offset(x, y - 1, width)];
          let south = densitymap[helpers.offset(x, y + 1, width)];
          densitymap[helpers.offset(x, y, width)] = ((originalmap[helpers.offset(x, y, width)] + a * (west + east + north + south)) / (1 + 4 * a));
        }
      }
    }
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

  /**
   * Determine emissivity based on height
   */
  emissivity (height) {
    if (height < this.sealevel + this.hundredM) {
      return this._emissivity['water'];
    }
    else if (height < this.sealevel + this.hundredM*2) {
      return this._emissivity['sand'];
    }
    else if (height < this.sealevel + this.hundredM*3) {
      return this._emissivity['sandstone'];
    }
    else if (height < this.sealevel + this.hundredM*10) {
      return this._emissivity['soil'];
    }
    else {
      return this._emissivity['granite'];
    }
  }
}

module.exports = Atmosphere;
