/* NeuralNet.js */
'use strict';

const NeuronLayer = require('./NeuronLayer');


class NeuralNet {
  constructor (numInputs = 5, numNeurons = 5, numHidden = 1) {
    this.numInputs = numInputs;
    this.numOutputs = numInputs;
    this.numHiddenLayers = numHidden;
    this.neuronsPerHiddenLayer = numNeurons;
    this.layers = [];
    this.output = null;
  }

  createNet (seeds = [457, 557, 757, 857]) {
    // create hidden layers
    for (let i = 0; i < this.numHiddenLayers; i++) {
      this.layers.push(new NeuronLayer(this.neuronsPerHiddenLayer, this.numInputs, seeds));
    }

    // create the output layer
    this.output = new NeuronLayer(this.neuronsPerHiddenLayer, this.numInputs, seeds);
    this.layers.push(this.output);
  }

  getWeights () {

  }

  getNumWeights () {

  }

  setWeights () {

  }

  update (inputs) {
    // if inputs length is incorrect
    if (inputs.length != this.numInputs) {
      throw new Error(`Number of inputs must equal number of inputs per neuron.\n You provided ${inputs.length}, expected ${this.numInputs}`);
    }

    // feed the inputs through the layers
    // each layer receives the output of the last as its input
    return this.layers.reduce((currentInput, layer) => {
      return layer.processInputs(currentInput);
    }, inputs);
  }
}

module.exports = NeuralNet;
