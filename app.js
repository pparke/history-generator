'use strict';

const RandomDataGenerator = require('./lib/math/RandomDataGenerator');
const NameGen             = require('./lib/language/NameGen');
const Myth                = require('./lib/language/Myth');
const util                = require('util');

const nameGen = new NameGen();
const myth    = new Myth();
const random  = new RandomDataGenerator([374847367262647]);
//random.sow(new Array(20).fill((Math.random()*100000) + 100));

let histLength = random.integerInRange(500, 1000);
let decendants = myth.geneology(histLength);
let begats = decendants.reduce((str, cur, i, arr) => {
  let pronoun = cur.sex === 'male' ? 'he' : 'she';
  let next = arr[i+1];
  let bornAt = random.integerInRange(16, cur.age);

  if (i < arr.length - 1) {
    str += `${cur.name} lived ${bornAt} years, and begat a ${next.sex === 'male' ? 'son' : 'daughter'}
            and called ${next.sex === 'male' ? 'his' : 'her'} name ${next.name}.  And the days of ${cur.name}
            after ${pronoun} had begotten ${next.name} were ${cur.age - bornAt} years`;

    if ((cur.age - bornAt) > 5) {
      str += ` and ${pronoun} begat sons and daughters`;
    }

    str += ` and all the days that ${cur.name} lived were ${cur.age} and ${pronoun} died.`;

    str += 'And ';
  }
  else {
    str += `And it came to pass, when men began to multiply on the face of the Earth...`;
  }

  return str;
}, '');

console.log(nameGen, nameGen.male(), nameGen.male().ofLength(9))

document.getElementById('output').innerHTML = `
<p>This is the record of the lifelong researches of ${nameGen.male().ofLength(9).generate()} the ${myth.title()},
set upon the page so they may be preserved from the ravages of time and brought before the eyes of men
to tell their tales of wonder and speak warning of dangers long forgotten.</p>
<p>${histLength} years before our time ${begats}`;
