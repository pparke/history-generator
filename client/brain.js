/* brain.js */
'use strict';

const NeuralNet = require('../lib/ai/NeuralNet');

const net = new NeuralNet();
net.createNet();

console.log(net)
function setup () {
  let inputContainer = document.getElementById('inputs');
  let outputContainer = document.getElementById('outputs');
  for (let i = 0; i < net.numInputs; i++) {
    // create input
    let input = document.createElement('input');
    input.id = `input-${i}`;
    inputContainer.appendChild(input);

    // create output
    let output = document.createElement('input');
    output.id = `output-${i}`;
    output.readOnly = true;
    outputContainer.appendChild(output);
  }

  let updateBtn = document.getElementById('update-button');
  updateBtn.onclick = update;
}

function update () {
  let inputs = new Array(net.numInputs);
  for (let i = 0; i < net.numInputs; i++) {
    inputs[i] = document.getElementById(`input-${i}`).value;
  }

  let outputs = net.update(inputs);

  outputs.forEach((val, i) => {
    document.getElementById(`output-${i}`).value = val;
  });

}

setup();
