'use strict';
let chai = require('chai');
let assert = chai.assert;
let should = chai.should();
let NameGen = require('../lib/language/NameGen');

let helpers = require('../lib/math/helpers');

describe('NameGen', function() {
  let namer = new NameGen();

  describe('normalize vowels', function () {

    it('should give the normalized frequencies of consonants', function () {
      console.log('length', namer.consonantFreq.length)
      let sum = namer.consonantFreq.reduce((sum, val) => {
        return sum + val;
      }, 0);
      console.log('sum', sum)
      // get the percent freq for vowels
      let percents = namer.consonantFreq.map((f) => {
        return f / sum;
      });

      console.log('percent values', percents)

      // normalize
      helpers.normalize1d(percents);

      console.log('normalized', percents)
    });
  });
});
