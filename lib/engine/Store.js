'use strict';

class Store {
  constructor () {
    this.entities = [];
    this.resources = {};

  }

  loadImages (resourceList) {
    return new Promise(function(resolve, reject) {
      // add the image atlas' to be loaded
      for (const {key, atlas} of resourceList) {
        PIXI.loader.add(key, atlas);
      }
      // set error handler
      PIXI.loader.on('error', function(err, loader, resources) {
        console.log(`Error: ${err} while loading resources ${resources}`);
        return reject(err);
      })
      // begin loading
      .load(function (loader, resources) {
        this.resources = this.resources.assign(resources);
        return resolve(this.resources);
      });
    })
  }
}

module.exports = Store;
