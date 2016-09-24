/* dungeon.js */
'use strict';

const helpers = require('../lib/math/helpers');

const width = 640;
const height = 480;

const images = {
  knight: 'assets/img/deep_elf_knight.png',
  floors: 'assets/img/floors.png',
  player2: 'assets/img/Player0002.png',
  player3: 'assets/img/Player0003.png',
  skeleton: 'assets/img/skeleton_humanoid_small.png'
};

class Entity {
  constructor () {
    this.components = {};
  }

  recieveEvent (event) {
    Object.keys(event.effects).forEach((key) => {
      if (this.components[key]) {
        event.effects[key](this);
      }
    });
  }
}

class Event {
  constructor () {
    this.type = '';
    this.effects = {};
  }
}

class Component {
  constructor () {
    this.name = 'base';
  }
}

class Appearance extends Component {
  constructor () {
    super();
    this.name = 'appearance';
    this.image = 'knight';
  }
}

class Body extends Component {
  constructor () {
    super();
    this.name = 'body';
    this.x = 0;
    this.y = 0;
    this.w = 16;
    this.h = 16;
    this.history = [];
  }
}

class Input extends Component {
  constructor () {
    super();
    this.name = 'input';
    this.lastInput = 0;
    this.cooldown = 120;
    this.map = {
      left: 37,
      up: 38,
      right: 39,
      down: 40
    }
  }
}

const components = {
  base: Component,
  appearance: Appearance,
  body: Body,
  input: Input
};

let assetStore = {
  images: {},

  getImage (key) {
    return this.images[key];
  },

  hasImage (key) {
    return !!this.images[key];
  }
};

let keymap = new Array(256);


let world = {
  canvas: null,
  ctx: null,
  entities: []
};

function setup () {
  // create the canvas
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  world.canvas = canvas;
  world.ctx = canvas.getContext('2d');

  // init keymap
  keymap.fill(false);

  // load images
  Object.keys(images).forEach((key) => {
    loadImage(key, images[key]);
  });

  let ent1 = createEntity(['appearance', 'body', 'input']);

  let ent = createEntity(['appearance', 'body']);
  console.log('ent1 === ent', ent1 === ent);
  ent.components.body.x = 100;
  ent.components.body.y = 100;

  // start main loop
  update();
}

function loadImage (key, url) {
  console.log('loading image', key, url)
  let canvas = document.createElement('canvas');
  if (!assetStore.hasImage(key)) {
    assetStore.images[key] = new Image();
    assetStore.getImage(key).src = url;
  }
}

function createEntity (comps) {
  let entity = new Entity();
  comps.forEach((c) => {
    entity.components[c] = new components[c]();
  });
  world.entities.push(entity);
  console.log(world.entities)
  return entity;
}

function addHistory (obj, action) {
  obj.history.push(action);
  if (obj.history.length > 10) {
    obj.history.shift();
  }
}

function undoHistory (obj) {
  let action = obj.history.pop();
  Object.keys(action).forEach((key) => {
    obj[key] -= action[key];
  });
}

/**
 * Render System
 * @return {[type]} [description]
 */
function renderSystem () {
  world.ctx.clearRect(0, 0, world.canvas.width, world.canvas.height);
  world.entities.forEach((ent) => {
    if (ent.components['appearance'] && ent.components['body']) {
      world.ctx.drawImage(assetStore.getImage(ent.components.appearance.image),
                          ent.components.body.x,
                          ent.components.body.y,
                          ent.components.body.w,
                          ent.components.body.h);
    }
  });
}

/**
 * Input System
 * @return {[type]} [description]
 */
function inputSystem () {
  world.entities.forEach((ent) => {
    if (ent.components['input'] && ent.components['body']) {
      let input = ent.components.input;
      let body = ent.components.body;
      let now = new Date().getTime();
      // limit input rate
      if (input.lastInput + input.cooldown > now) {
        return;
      }
      input.lastInput = now;
      // process key state
      if (keymap[input.map.up]) {
        body.y -= body.h;
        addHistory(body, {y: -body.h});
      }
      else if (keymap[input.map.down]) {
        body.y += body.h;
        addHistory(body, {y: body.h});
      }
      if (keymap[input.map.right]) {
        body.x += body.w;
        addHistory(body, {x: body.w});
      }
      else if (keymap[input.map.left]) {
        body.x -= body.w;
        addHistory(body, {x: -body.w});
      }
    }
  });
}

function physicsSystem () {
  let bodies = world.entities.filter((ent) => !!ent.components['body']);
  bodies.forEach((bodyA) => {
    bodies.forEach((bodyB) => {
      // check if body a is out of bounds of body b
      if (bodyA.x + bodyA.w < bodyB.x ||
          bodyA.x > bodyB.x + bodyB.w ||
          bodyA.y + bodyA.h < bodyB.y ||
          bodyA.y > bodyB.y + bodyB.h) {
            return;
          }
      undoHistory(bodyA);
    })
  })
}

/**
 * Main loop
 */
function update () {
  // update logic
  renderSystem();
  inputSystem();
  requestAnimationFrame(update);
}

/*
 * On ready
 */
document.addEventListener('DOMContentLoaded', setup, false);
setup();
document.addEventListener('keydown', (e) => {
  e.preventDefault();
  keymap[e.keyCode] = true;
}, false);
document.addEventListener('keyup', (e) => {
  e.preventDefault();
  keymap[e.keyCode] = false;
}, false);
