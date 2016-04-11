'use strict';

const NameGen   = require('./lib/language/NameGen');
const Menu      = require('./lib/ui/Menu');
const util      = require('util');
const path      = require('path');

const nameGen = new NameGen();

// stdin starts off paused
process.stdin.resume();
process.stdin.setEncoding('utf8');

console.log(`This is the record of the lifelong researches of ${nameGen.male().ofLength(9).generate()},
set upon the page so they may be preserved from the ravages of time and brought before the eyes of men
to tell their tales of wonder and speak warning of dangers long forgotten.`);


/**
* Menu
*/
const menu = new Menu(path.join(__dirname, 'output'));
process.stdin.on('data', menu.mainHandler.bind(menu));
