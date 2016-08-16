/* NeuralNet.js */
'use strict';

const NeuronLayer = require('./NeuronLayer');
const math = require('../math/helpers');

class NeuralNet {
  constructor () {
    this.numInputs;
    this.numOutputs;
    this.numHiddenLayers = 0;
    this.neuronsPerHiddenLayer;
    this.layers = [];
    this.output = null;
  }

  createNet (seeds) {
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
    let outputs = [];
    let weight = 0;

    if (inputs.length != this.numInputs) {
      return outputs;
    }

    for (let i = 0; i < this.layers.length; i++) {
      // use the outputs from the last layer as the inputs so long as
      // we aren't on the first layer
      if (i > 0) {
        inputs = outputs;
      }

      outputs = [];
      weight = 0;

      for (let j = 0; j < this.layers[i].numNeurons; j++) {
        let netInput = this.layers[i] // TODO
      }
    }
  }
}
