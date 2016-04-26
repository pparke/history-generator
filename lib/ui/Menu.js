'use strict';

const NameGen   = require('../language/NameGen');
const Myth      = require('../language/Myth');
const Grid      = require('../world/Grid');
const Flag      = require('../art/Flag');
const Display   = require('./Display');
const fs        = require('fs');

const nameGen = new NameGen();

class Menu {
  constructor (outdir) {
    this.state = 'main';
    this.outdir = outdir;

    this.width   = 512;
    this.height  = 512;

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
        options: ['reset', 'reseed', 'generate', 'render', 'set key=value', 'export [data|perm] file.json', 'import [data|perm] file.json']
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
      text = text.replace(/^(names\W*)/i, '');
      let args = text.split(' ');
      let num = parseInt(args[0]) || 10;
      let type = args[1] || 'male';
      let length = parseInt(args[2]) || 5;

      let names = this.generateNames(num, type, length);
      names.forEach((name) => {
        console.log(name);
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
    // reset
    if (text.match(/^reset/i)) {
      console.log('\nResetting grid...');
      this.setupGrid();
    }
    // reseed
    else if (text.match(/^reseed/i)) {
      console.log('\nReseeding noise function...');
      this.grid.randomizePerm();
    }
    // generate
    else if (text.match(/^generate/i)) {
      process.stdout.write('\nGenerating new grid... ');
      this.grid.generate();
      process.stdout.write('done.\n');
    }
    // render
    else if (text.match(/^render/i)) {
      process.stdout.write('\nRendering grid to an image... ');
      // render the heightmap
      let height = this.grid.heightmap;
      this.display.render(height, this.width, this.height, 'heightmap.png', {renderStyle: 'palette', renderKey: 'terrain'});

      // show the iterations of the noise fn
      /*
      let iterations = this.grid.simplex.iterations;
      for (let i = 0; i < iterations.length; i++) {
        this.display.render(iterations[i], this.width, this.height, `iter${i}.png`, {renderStyle: 'hsl'});
      }
      */

      // render the heatmap
      let heat = this.grid.heatmap;
      this.display.render(heat, this.width, this.height, 'heatmap.png', {renderStyle: 'gradient', renderKey: 'temp'});

      // render pressure map
      let pressure = this.grid.pressuremap;
      this.display.render(pressure, this.width, this.height, 'pressuremap.png', {renderStyle: 'hsl'});

      // render density map
      for (let i = 0; i < 3; i++) {
        //this.display.render(this.grid.densitymap, this.width, this.height, `densitymap_${i}.png`, {renderStyle: 'hsl'});
        let velmap = this.grid.windxmap.map((el, i) => {
          return Math.sqrt(Math.pow(el, 2) + Math.pow(this.grid.windymap[i], 2));
        });
        this.display.render(velmap, this.width, this.height, 'windmap.png', {renderStyle: 'hsl'});
        this.grid.step(0.6);
      }


      process.stdout.write('done.\n');
    }
    // set
    else if (text.match(/^set/i)) {
      text = text.replace(/^(set\W*)/i, '');
      let args = text.split(' ');
      args = args.map((arg) => arg.split('='));
      let params = args.reduce((p, arg) => {
        p[arg[0].trim()] = arg[1].trim();
        return p;
      }, {});
      process.stdout.write(`\nSetting params to ${params}... `);
      this.grid.setNoiseParams(params);
      process.stdout.write('done.\n');
    }
    // export
    else if (text.match(/^export/i)) {
      text = text.replace(/^export\W*/i, '');
      let args = text.split(' ');
      let type = args[0].trim();
      let name = args[1].trim();

      process.stdout.write(`\nExporting ${type} to file ${name}... `);

      if (type === 'data') {
        let data = this.grid.exportData(name);
        fs.writeFile(name, data, (err) => {
          if (err) {
            console.error('Problem writing permutations to file:', err);
          }
          else {
            console.log(`${name} written.`);
            process.stdout.write('done.\n');
          }
        });
      }
      else if (type === 'perm') {
        let buffer = this.grid.exportPerm(name);
        let out = fs.createWriteStream(`${this.outdir}/${name}`);
        out.write(buffer);
        out.end();
      }

    }
    // import
    else if (text.match(/^import/i)) {
      text = text.replace(/^import\W*/i, '');
      let args = text.split(' ');
      let type = args[0].trim();
      let name = args[1].trim();

      process.stdout.write(`\nImporting ${type} from file ${name}... `);

      if (type === 'data') {
        fs.readFile(`${this.outdir}/${name}`, (err, data) => {
          if (err) {
            console.error('Problem reading data file:', err);
            process.stdout.write(`Error importing ${type} from file ${name}`);
          }
          else {
            this.grid.importData(data);
            process.stdout.write('done.\n');
          }
        });
      }
      else if (type === 'perm') {
        fs.readFile(`${this.outdir}/${name}`, (err, data) => {
          if (err) {
            console.error('Problem reading permutations file:', err);
          }
          else {
            this.grid.importPerm(data);
          }
        });
      }
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

  generateNames (n, type, length) {
    let names   = [];
    for (let i = 0; i < n; i++) {
      names.push(nameGen[type]().ofLength(length).generate())
    }
    return names;
  }

  writeMyth () {
    let myth = new Myth();
    myth.write();
  }

  setupGrid () {
    this.grid = new Grid(this.width, this.height);
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
