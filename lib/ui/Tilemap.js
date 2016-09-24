/* Tilemap.js */
'use strict';

class Tilemap {
  constructor (width, height, tileSize) {
    this.tileSize = tileSize || 32;
    this.width = width;
    this.height = height;
    this.wrap = true;
    this.tiles = new Array(this.width * this.height);
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = new Tile(this, ...this.getCoords(i));
    }
  }

  getOffset (x, y) {
    return (y * this.width) + x;
  }

  getCoords (i) {
    let y = Math.floor(i / this.width);
    let x = i % this.width;
    return [x, y];
  }

  getTile(x, y) {
    let offset = this.getOffset(x, y);
    return this.tiles[offset];
  }

  setTile (x, y, val) {
    let offset = this.getOffset(x, y);
    this.tiles[offset] = val;
  }

  coordsToPixels (x, y) {
    return [x * this.tileSize, y * this.tileSize];
  }

  pixelsToCoords (x, y) {
    return [Math.floor(x / this.tileSize), Math.floor(y / this.tileSize)];
  }

  northOf (x, y) {
    return this.getTile(x, y-1);
  }

  eastOf (x, y) {
    return this.getTile(x+1, y);
  }

  southOf (x, y) {
    return this.getTile(x, y+1);
  }

  westOf (x, y) {
    return this.getTile(x-1, y);
  }

  move (mob, dx, dy) {
    let x, y;
    [x, y] = this.pixelsToCoords(mob.position.x, mob.position.y);
    let newx = x + dx;
    let newy = y + dy;

    // constrain movement to within bounds by wrapping or limiting
    if (newx >= this.width) {
      if (this.wrap) {
        newx = 0;
      }
      else {
        newx = x;
      }
    }
    else if (newx < 0) {
      if (this.wrap) {
        newx = this.width - 1;
      }
      else {
        newx = x;
      }
    }

    if (newy >= this.height) {
      if (this.wrap) {
        newy = 0;
      }
      else {
        newy = y;
      }
    }
    else if (newy < 0) {
      if (this.wrap) {
        newy = this.height - 1;
      }
      else {
        newy = y;
      }
    }

    let source = this.getTile(x, y);
    let dest = this.getTile(newx, newy);
    if (source && dest) {
      let px, py;
      [px, py] = this.coordsToPixels(newx, newy);
      mob.position.x = px;
      mob.position.y = py;
      dest.addOccupant(mob);
      source.removeOccupant(mob);
    }
  }
}

class Tile {
  constructor (tilemap, x, y) {
    this.items = [];
    this.occupants = [];
    this.tilemap = tilemap;
    this.x = x;
    this.y = y;
  }

  north () {
    return this.tilemap.northOf(this.x, this.y);
  }

  east () {
    return this.tilemap.eastOf(this.x, this.y);
  }

  south () {
    return this.tilemap.southOf(this.x, this.y);
  }

  west () {
    return this.tilemap.westOf(this.x, this.y);
  }

  addOccupant (occ) {
    if (!this.occupants.includes(occ)) {
      this.occupants.push(occ);
    }
  }

  removeOccupant (occ) {
    let i = this.occupants.findIndex((el) => {
      return el === occ;
    });

    if (i > -1) {
      this.occupants.splice(i, 1);
    }
  }

  addItem (item) {
    this.items.push(item);
  }

  removeItem (item) {
    let i = this.items.findIndex((el) => {
      return el === item;
    });

    if (i > -1) {
      this.items.splice(i, 1);
    }
  }
}

module.exports = Tilemap;
