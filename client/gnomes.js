"use strict";

const width = 800;
const height = 600;
const tilesX = width/32;
const tilesY = height/32;
const atlas = 'assets/img/gnomes.json';

const game = {
  renderer: null,
  stage: null,
  resources: null,
  gnomes: []
}

class TileMap {
  constructor (width, height, tileSize) {
    this.tileSize = tileSize || 32;
    this.width = width;
    this.height = height;
    this.tiles = new Array(this.width * this.height);
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = Object.create(null);
    }
  }

  getOffset (x, y) {
    return (y*this.width) + x;
  }

  getTile(x, y) {
    let offset = this.getOffset(x, y);
    return this.tiles[offset];
  }

  setTile (x, y, val) {
    let offset = this.getOffset(x, y);
    this.tiles[offset] = val;
  }

  pixelsToCoords (x, y) {
    return [ x*this.tileSize, y*this.tileSize ];
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

}

document.addEventListener('DOMContentLoaded', function () {
  setup();
});

function setup () {
  game.renderer = new PIXI.WebGLRenderer(800, 600);
  game.renderer.backgroundColor = 0x55aa55;
  let display = document.getElementById("display");
  display.appendChild(game.renderer.view);

  game.inspector = getInspector();

  game.stage = new PIXI.Container();

  // create a new tilemap
  game.tileMap = new TileMap(Math.floor(width/32), Math.floor(height/32), 32);

  // load the textures we need
  let loadImages = new Promise(function (resolve, reject) {
    PIXI.loader.add('gnomes', atlas)
    .on('error', function(err, loader, resources) {
      console.log(`Error: ${err} while loading resources ${resources}`);
      return reject(err);
    })
    .load(function (loader, resources) {
      return resolve(resources);
    });
  });

  loadImages.then((res) => {
    game.resources = res;
    console.log(res)

    let numGnomes = 10;
    for (let i = 0; i < numGnomes; i++) {
      let tileX = Math.floor(Math.random() * game.tileMap.width);
      let tileY = Math.floor(Math.random() * game.tileMap.height);
      let x, y;
      [x, y] = game.tileMap.pixelsToCoords(tileX, tileY);

      let gnome = gnomeFactory(game.resources.gnomes.textures['gnome'], x, y);
      game.tileMap.getTile(tileX, tileY).occupant = gnome;
      game.stage.addChild(gnome);
      game.gnomes.push(gnome);
    }

    // start main loop
    animate();
  });

}

function getInspector () {
  let insp = {
    name: document.getElementById("name"),
    position: document.getElementById("position"),
    health: document.getElementById("health"),
    mana: document.getElementById("mana"),
    exp: document.getElementById("exp"),
    gold: document.getElementById("gold"),
    level: document.getElementById("level"),
    class: document.getElementById("class"),
    currentAction: document.getElementById("currentAction")
  };
  return insp;
}

function gnomeFactory (texture, x, y) {
  let gnome = new PIXI.Sprite(texture);
  gnome.name = `gnome-${x}-${y}`;
  gnome.position.x = x;
  gnome.position.y = y;
  gnome.health = 10;
  gnome.mana = 1;
  gnome.exp = 0;
  gnome.gold = 100;
  gnome.lvl = 1;
  gnome.class = 'gnome';
  gnome.attributes = {
    str: 10,
    dex: 10,
    con: 10,
    wis: 10,
    int: 10,
    cha: 10
  };

  gnome.interactive = true;
  gnome.on('mousedown', (e) => {
    console.log(`mousedown on gnome`, e.target);
    game.inspector.name.innerHTML = e.target.name;
    game.inspector.position.innerHTML = `${e.target.position.x} ${e.target.position.y}`;
    game.inspector.health.innerHTML = e.target.health;
    game.inspector.mana.innerHTML = e.target.mana;
    game.inspector.exp.innerHTML = e.target.exp;
    game.inspector.gold.innerHTML = e.target.gold;
    game.inspector.level.innerHTML = e.target.level;
    game.inspector.class.innerHTML = e.target.class;
    game.inspector.currentAction.innerHTML = e.target.currentAction;
  });

  gnome.actions = setupActions();

  let actionKeys = Object.keys(gnome.actions);
  gnome.currentAction = actionKeys[Math.floor(Math.random()*actionKeys.length)];

  return gnome;
}

function setupActions () {
  function divy (n) {
    // create a new array and initialize it to 0
    let a = new Array(n);
    a.fill(0);

    // the running total
    let current = 0.0;

    // get a random value and clamp it between 0 and the remaining points
    return a.map((e) => {
      let r = Math.random() * 0.6;
      let amt = r * (1.0 - current);
      current += amt;
      return amt;
    })
    // divide up any remaining points between all the elements
    .map((e) => {
      let remainder = (1.0 - current);
      if (remainder > 0) {
        return e + (remainder/n);
      }
    });
    // shuffle
    a = shuffle(a);
    //.sort((a, b) => Math.round((Math.random() * 2.5) - 1.25));
  }

  return {
    move: divy(10),
    pickup: divy(10),
    fight: divy(10),
    spell: divy(10),
    rest: divy(10),
    steal: divy(10),
    shout: divy(10),
    hide: divy(10),
    quaff: divy(10),
    eat: divy(10)
  };
}

function shuffle (array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function updateGnomes (gnomes) {
  gnomes.forEach((gnome) => {

  })
}

/**
 * Main loop
 */
function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    // this is the main render call that makes pixi draw your container and its children.
    game.renderer.render(game.stage);
}
