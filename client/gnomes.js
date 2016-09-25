"use strict";

const NameGen             = require('../lib/language/NameGen');
const Tilemap             = require('../lib/ui/Tilemap');

const nameGen = new NameGen();
const width = 800;
const height = 600;
const tilesX = width/32;
const tilesY = height/32;
const gnomeAtlas = 'assets/img/gnomes.json';
const itemAtlas = 'assets/img/items.json';
const timeInterval = 1000;

const game = {
  renderer: null,
  stage: null,
  resources: null,
  gnomes: [],
  items: []
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
  game.tilemap = new Tilemap(Math.floor(width/32), Math.floor(height/32), 32);

  // load the textures we need
  let loadImages = new Promise(function (resolve, reject) {
    PIXI.loader.add('gnomes', gnomeAtlas)
    .add('items', itemAtlas)
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
      let tileX = Math.floor(Math.random() * game.tilemap.width);
      let tileY = Math.floor(Math.random() * game.tilemap.height);
      let x, y;
      [x, y] = game.tilemap.coordsToPixels(tileX, tileY);

      let gnome = gnomeFactory(game.resources.gnomes.textures['gnome'], x, y);
      game.tilemap.getTile(tileX, tileY).addOccupant(gnome);
      game.stage.addChild(gnome);
      game.gnomes.push(gnome);
    }

    let itemNames = Object.keys(game.resources.items.textures);
    itemNames.forEach((name) => {
      let item = new PIXI.Sprite(game.resources.items.textures[name]);
      item.name = name;
      let tileX = Math.floor(Math.random() * game.tilemap.width);
      let tileY = Math.floor(Math.random() * game.tilemap.height);
      let x, y;
      [x, y] = game.tilemap.coordsToPixels(tileX, tileY);
      item.position.x = x;
      item.position.y = y;
      game.tilemap.getTile(tileX, tileY).addItem(item);
      game.stage.addChild(item);
      game.items.push(item);
    });

    // start main loop
    step();
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
    food: document.getElementById("food"),
    level: document.getElementById("level"),
    class: document.getElementById("class"),
    currentAction: document.getElementById("currentAction")
  };
  return insp;
}


function gnomeFactory (texture, x, y) {
  let gnome = new PIXI.Sprite(texture);
  gnome.name = nameGen.male().short().generate();
  gnome.position.x = x;
  gnome.position.y = y;
  gnome.health = 10;
  gnome.mana = 1;
  gnome.exp = 0;
  gnome.gold = 100;
  gnome.food = 100;
  gnome.level = 1;
  gnome.class = 'gnome';
  gnome.attributes = {
    str: 10,
    dex: 10,
    con: 10,
    wis: 10,
    int: 10,
    cha: 10
  };
  gnome.inventory = [];

  gnome.interactive = true;
  gnome.on('mousedown', (e) => {
    console.log(`mousedown on gnome`, e.target);
    game.inspector.name.innerHTML = e.target.name;
    game.inspector.position.innerHTML = `${e.target.position.x} ${e.target.position.y}`;
    game.inspector.health.innerHTML = e.target.health;
    game.inspector.mana.innerHTML = e.target.mana;
    game.inspector.exp.innerHTML = e.target.exp;
    game.inspector.gold.innerHTML = e.target.gold;
    game.inspector.food.innerHTML = e.target.food;
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
    switch(gnome.currentAction) {
      case 'move':
        game.tilemap.move(gnome, 1, 0);
        break;
    }
  });
}

/**
 * Main loop
 */
function step() {
    // start the timer for the next animation loop
    setTimeout(step, timeInterval);

    updateGnomes(game.gnomes);

    // this is the main render call that makes pixi draw your container and its children.
    game.renderer.render(game.stage);
}
