'use strict';

let NameGen   = require('../language/NameGen');
let Myth      = require('../language/Myth');
let Grid      = require('../world/Grid');
let Flag      = require('../art/Flag');
let Display   = require('./Display');

let nameGen = new NameGen();

class Menu {
  constructor (outdir) {
    this.state = 'main';
    this.outdir = outdir;

    this.menus = {
      main: {
        title: 'Menu',
        options: ['text', 'map', 'quit']
      },
      text: {
        title: 'Text',
        options: ['names', 'myth']
      },
      map: {
        title: 'Map',
        options: ['grid', 'flag']
      },
      grid: {
        title: 'Grid',
        options: ['reset', 'reseed', 'generate', 'set key=value', 'export file.json', 'import file.json']
      }
    };

    this.display = new Display(outdir, 'test.png');

    this.prompt();
  }

  prompt () {
    let menu = this.menus[this.state];
    let str = menu.options.reduce((str, option) => {
      str += `* ${option}\n`;
      return str;
    }, '');

    process.stdout.write(`\n${menu.title}\n~~~~~~~~\n${str}\n>> `);
  }

  exitHandler (text) {
    if (text.match(/^close|^quit|^exit/i)) {
      this.done();
    }
    else if (text.match(/^back|^main|^up/i)) {
      this.state = 'main';
      this.prompt();
    }
  }

  mainHandler (text) {
    this.exitHandler(text);

    switch (this.state) {
      case 'main':
      this.mainMenu(text);
      break;
      case 'text':
      this.textMenu(text);
      break;
      case 'map':
      this.mapMenu(text);
      break;
      case 'grid':
      this.gridMenu(text);
      break;
      default:
      this.invalidState();
    }
  }

  /**
   * Main Menu
   */
  mainMenu (text) {
    if (text.match(/^text/i)) {
      this.state = 'text';
      this.prompt();
    }
    else if (text.match(/^map/i)) {
      this.state = 'map';
      this.prompt();
    }
  }

  /**
   * Text Menu
   */
  textMenu (text) {
    if (text.match(/^names/i)) {
      this.generateNames(10, 5).forEach((name, i) => {
        console.log(`${i}) ${name}`);
      });
    }
    else if (text.match(/^myth/i)) {
      this.writeMyth();
    }
  }

  /**
   * Map Menu
   */
  mapMenu (text) {
    if (text.match(/^grid/i)) {
      this.state = 'grid';
      this.setupGrid();
      this.prompt();
    }
    else if (text.match(/^flag/i)) {
      console.log('\nCreating new flag...');
      this.makeFlag();
    }
  }

  /**
   * Grid Menu
   */
  gridMenu (text) {
    if (text.match(/^reset/i)) {
      console.log('\nResetting grid...');
      this.setupGrid();
    }
    else if (text.match(/^reseed/i)) {
      console.log('\nReseeding noise function...');
      this.grid.randomizePerm();
    }
    else if (text.match(/^generate/i)) {
      process.stdout.write('\nGenerating new grid... ');
      this.grid.generate();
      process.stdout.write('done.\n');
    }
    else if (text.match(/^render/i)) {
      process.stdout.write('\nRendering grid to an image... ');
      let data = this.grid.toArray('height');
      this.display.render(data);
      process.stdout.write('done.\n');
    }
    else if (text.match(/^set/i)) {
      text = text.replace(/^(set\W*)/i, '');
      let args = text.split(' ');
      args = args.map((arg) => arg.split('='));
      let params = args.reduce((p, arg) => {
        p[arg[0].trim()] = arg[1].trim();
        return p;
      }, {});
      console.log('\nSetting params to', params);
      this.grid.setNoiseParams(params);
    }
    else if (text.match(/^export/i)) {
      text = text.replace(/^export\W*/i, '');
      let name = text.split(' ')[0].trim();
      this.grid.exportPerm(name);
    }
    else if (text.match(/^import/i)) {
      text = text.replace(/^import\W*/i, '');
      let name = text.split(' ')[0].trim();
      this.grid.importPerm(name);
    }
  }

  invalidState () {
    console.log('\nInvalid state.');
    this.done();
  }

  done () {
    process.exit();
  }

  //----------------------------------------------------------------------------

  generateNames (n, length) {
    let names   = [];
    for (let i = 0; i < n; i++) {
      names.push(nameGen.male().ofLength(length).generate())
    }
    return names;
  }

  writeMyth () {
    let myth = new Myth();
    myth.write();
  }

  setupGrid () {
    let width   = 512;
    let height  = 512;
    let persistance = 0.3;
    let octaves     = 8;
    let xfreq       = 2/width;
    let yfreq       = 2/height;
    let lacun       = 4;
    console.log(`\nCreating new grid with persistance=${persistance} octaves=${octaves} xfrequency=${xfreq} yfrequency=${yfreq} lacunarity=${lacun} noiseFn='simplex'`);
    this.grid = new Grid(width, height, persistance, octaves, xfreq, yfreq, lacun, this.outdir);
  }

  generateGrid () {
    console.log('\nGenerating grid...');
    this.grid.generate();
    this.grid.render(this.outdir);
  }

  makeFlag() {
    let flag = new Flag(400, 400, this.outdir);
    flag.gradient(10, 10);
    flag.render();
  }
}

module.exports = Menu;
