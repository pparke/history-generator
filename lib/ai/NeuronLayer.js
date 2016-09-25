/* NeuronLayer.js */
'use strict';

const Neuron = require('./Neuron');
const math = require('../math/helpers');
const RandomDataGenerator = require('../math/RandomDataGenerator');

class NeuronLayer {
  constructor (numNeurons, inputsPerNeuron, seeds) {
    this.numNeurons = numNeurons;
    this.neurons = new Array(numNeurons);
    this.activationResponse = 1;

    // setup random data generator
    let rand = new RandomDataGenerator(seeds);

    // initialize neurons
    for (let i = 0; i < numNeurons; i++) {
      // create the neuron
      this.neurons[i] = new Neuron(inputsPerNeuron);

      // generate random weights
      let weights = new Array(inputsPerNeuron);
      weights.fill(0);
      weights = weights.map(() => {
        return rand.normal();
      });

      // set the weights on the neuron
      this.neurons[i].setWeights(weights);
    }
  }

  /**
   * Pass the inputs to each neuron for it to apply its weights and sum
   * the values into the net input.  Run the net input through the sigmoid
   * function and return the array of outputs.
   * @param  {array} inputs - the array of input values
   * @return {array}        - the resultant values after being summed by each neuron
   */
  processInputs (inputs) {
    return this.neurons.map((neuron) => {
      let netInput = neuron.sumInputs(inputs);
      // pass the net input through the sigmoid function
      return math.sigmoid(netInput, this.activationResponse);
    });
  }
}

module.exports = NeuronLayer;
