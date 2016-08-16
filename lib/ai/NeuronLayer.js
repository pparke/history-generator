/* NeuronLayer.js */
'use strict';

const Neuron = require('./Neuron');

class NeuronLayer {
  constructor (numNeurons, inputsPerNeuron, seeds) {
    this.numNeurons = numNeurons;
    this.neurons = new Array(numNeurons);

    // initialize neurons
    for (let i = 0; i < numNeurons; i++) {
      this.neurons[i] = new Neuron(inputsPerNeuron, seeds);
    }
  }
}

module.exports = NeuronLayer;
