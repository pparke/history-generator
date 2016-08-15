'use strict';
let chai = require('chai');
let assert = chai.assert;
let RandomDataGenerator = require('../lib/math/RandomDataGenerator');

/**
 * Test for Random Data Generator
 */
describe('RandomDataGenerator', function() {
  let rdg = new RandomDataGenerator([ '374847367262647' ]);
  rdg.sow(new Array(20).fill((Math.random()*100000) + 100));

  describe('#integer', function () {
    it('should return an integer value between 0 and 2^32', function () {
      let number = rdg.integer();
      assert.typeOf(number, 'number');
      assert.equal(number < 0, false);
      assert.equal(number % 1, 0);
      console.log('Number is:', number);
    });
  });

  describe('#frac', function () {
    it('should return a random real number between 0 and 1', function () {
      let number = rdg.frac();
      assert.typeOf(number, 'number');
      assert.equal(number <= 1.0, true);
      assert.equal(number >= 0, true);
      console.log('Number is:', number);
    });
  });

  describe('#real', function () {
    it('should return a random real number between 0 and 2^32', function () {
      let number = rdg.real();
      assert.typeOf(number, 'number');
      assert.equal(number >= 0, true);
      console.log('Number is:', number);
    });
  });

  describe('#integerInRange', function () {
    it('should return a random integer in the given range', function () {
      let number = rdg.integerInRange(20, 100);
      assert.typeOf(number, 'number');
      assert.equal(number <= 100, true);
      assert.equal(number >= 20, true);
      assert.equal(number % 1, 0);
      console.log('Number is:', number);
    });
  });

  describe('#realInRange', function () {
    it('should return a random real number in the given range', function () {
      let number = rdg.realInRange(20, 100);
      assert.typeOf(number, 'number');
      assert.equal(number <= 100, true);
      assert.equal(number >= 20, true);
      console.log('Number is:', number);
    });
  });

  describe('#normal', function () {
    it('should return a random real number between -1 and 1', function () {
      let number = rdg.normal();
      assert.typeOf(number, 'number');
      assert.equal(number <= 1, true);
      assert.equal(number >= -1, true);
      console.log('Number is:', number);
    });
  });

  describe('#uuid', function () {
    it('should return a valid uuid', function () {
      let number = rdg.integerInRange(20, 100);
      assert.typeOf(number, 'number');
      console.log('UUID is:', number);
    });
  });

  describe('#pick', function () {
    it('should return a random element from an array', function () {
      let arr = [12, 23, 34, 45, 56, 67, 78, 89, 90];
      let number = rdg.pick(arr);
      assert.equal(arr.indexOf(number) > -1, true);
      console.log('Element is:', number);
    });
  });
});
