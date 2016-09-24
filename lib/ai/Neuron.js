/* Neuron.js */
'use strict';

class Neuron {
  constructor (numInputs) {
    this.weights = new Array(numInputs);
    this.bias = -1;
    // set all weights to neutral (no change)
    this.weights.fill(1);
  }

  /**
   * Set the values of this neurons weights to those provided
   * @param {array} weights - the new weights to set on the neuron
   */
  setWeights (weights) {
    if (this.weights.length !== weights.length) {
      throw new Error(`You must provide the same number of weights.\n ${weights.length} given, expected ${this.weights.length}`);
    }

    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] = weights[i];
    }
  }

  /**
   * Sum the products of each weight and each input and add the bias
   * @param  {array} inputs - input values
   * @return {number}       - summed output including bias
   */
  sumInputs (inputs) {
    let netInput = 0;
    // for each weight excluding the bias weight
    for (let i = 0; i < this.weights.length - 1; i++) {
      // sum weights * inputs
      netInput += this.weights[i] * inputs[i];
    }

    // add the bias
    netInput += this.weights[this.weights.length-1] * this.bias;
    return netInput;
  }
}

module.exports = Neuron;
