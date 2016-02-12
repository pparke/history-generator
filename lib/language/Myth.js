'use strict';
/**
 * Myth generator
 */
let RandomDataGenerator = require('../math/RandomDataGenerator');
let NameGen             = require('./NameGen');
let adjectives  = require('../../data/adjectives');
let animals     = require('../../data/animals');
let creators    = require('../../data/creators');
let substances  = require('../../data/substances');
let titles      = require('../../data/titles');
let beginnings  = require('../../data/beginnings');
let verbs       = require('../../data/verbs');
let realms      = require('../../data/realms');

/**
 * TODO: add more than one template for the text of the myth
 * TODO: generate a name for the race
 */

class Myth {
  constructor () {
    this.text = '';
    this.random = new RandomDataGenerator([ '374847367262647' ]);
    this.random.sow(new Array(20).fill((Math.random()*100000) + 100));
    this.nameGen = new NameGen();
  }

  write () {
    let beginning = this.capitalize(this.random.pick(beginnings));
    let realm = this.capitalizeAll(this.random.pick(realms));
    this.text =  `${beginning} ${this.nameGen.male().medium().generate()} the
${this.random.pick(adjectives)} ${this.random.pick(creators)}, ${this.random.pick(titles)} of ${realm} ${this.random.pick(verbs.past)}
the first men from ${this.random.pick(substances)}.`

    console.log(this.text);
  }

  capitalize (word) {
    return word.charAt(0).toUpperCase() + word.substr(1);
  }

  capitalizeAll (words) {
    return words.split(' ').map((word) => {
      return this.capitalize(word);
    }).join(' ');
  }

};

module.exports = Myth;
