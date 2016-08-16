/* Neuron.js */
'use strict';

const RandomDataGenerator = require('../math/RandomDataGenerator');


class Neuron {
  constructor (numInputs, seeds) {
    this.numInputs = numInputs;
    this.weights = new Array(numInputs);
    this.bias = -1;

    let rand = new RandomDataGenerator(seeds);

    // initialize weights with random values
    for (let i = 0; i < numInputs; i++) {
      this.weights[i] = rand.normal();
    }
  }

  sumInputs (inputs) {
    let netInput = 0;
    // sum weights * inputs
    for (let i = 0; i < this.numInputs - 1; i++) {
      netInput += this.weights[i] * inputs[i];
    }

    // add the bias
    netInput += this.weights[this.numInputs-1] * this.bias;

    return netInput;
  }
}

module.exports = Neuron;
