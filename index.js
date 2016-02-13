'use strict';

let NameGen   = require('./lib/language/NameGen');
let Menu      = require('./lib/ui/Menu');
let util      = require('util');

let nameGen = new NameGen();

// stding starts off paused
process.stdin.resume();
process.stdin.setEncoding('utf8');

console.log(`This is the record of the lifelong researches of ${nameGen.male().ofLength(9).generate()},
set upon the page so they may be preserved from the ravages of time and brought before the eyes of men
to tell their tales of wonder and speak warning of dangers long forgotten.`);


/**
* Menu
*/
let menu = new Menu(__dirname);
process.stdin.on('data', menu.mainHandler.bind(menu));
