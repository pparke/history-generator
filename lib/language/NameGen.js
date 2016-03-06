'use strict';
/**
   Name Gen
   Name generator.
 */
let RandomDataGenerator = require('../math/RandomDataGenerator');

class NameGen {
  constructor () {
    this.consonants   = 'bcdfghjklmnpqrstvwxz';
    this.consonantFreq = [0.02489, 0.04642, 0.07097, 0.03717, 0.03362, 0.10169, 0.00255, 0.01288, 0.06716, 0.04014, 0.11262, 0.03218, 0.00158, 0.09990, 0.10558, 0.15111, 0.01632, 0.03939, 0.00250, 0.00123 ];
    this.vowels       = 'aeiouy';
    this.vowelFreq    = [0.20379, 0.31696, 0.17382, 0.18732, 0.06882, 0.04925];
    this.double       = 'bdeoglmnprst';
    this.doubleFreq   = 0.1;
    this.compoundCon  = [ 'ch', 'ck', 'gh', 'ng', 'ph', 'qu', 'sc', 'sh', 'th', 'wh', 'bt', 'pt', 'kn', 'gn', 'pn', 'mb', 'lm', 'ps', 'rh', 'wr' ];
    this.compConFreq  = 0.1;
    this.compoundVow   = [ 'io', 'ie', 'ia', 'ua', 'eu', 'ae', 'ea', 'oy', 'yo', 'eo', 'oe', 'oa' ];
    this.compVowFreq  = 0.1;
    this.gender       = 'male';
    this.length       = 2;
    this.random       = new RandomDataGenerator([ '374847367262647' ]);
    this.random.sow(new Array(20).fill((Math.random()*100000) + 100));
  }

  male () {
    this.gender = 'male';
    return this;
  }

  female () {
    this.gender = 'female';
    return this;
  }

  short () {
    this.length = this.random.between(3, 5);
    return this;
  }

  medium () {
    this.length = this.random.between(5, 10);
    return this;
  }

  long () {
    this.length = this.random.between(10, 15);
    return this;
  }

  ofLength (n) {
    this.length = n;
    return this;
  }

  generate () {
    let name = new Array(this.length).fill(' ');
    // initial name generation
    name = name.reduce((hist, char, i) => {
      // special case for beginning or end
      if (i === 0 || i === this.length-1) {
        switch (this.gender) {
        // begin and end with a consonant
        case 'male':
          // if the current last letter is a consonant add another vowel
          // before adding a final consonant
          if (i > 0 && this.isConsonant(hist[i-1])) {
            hist.push(this.getRandomVow());
          }
          hist.push(this.getRandomCon());
          break;
        // begin and end with a vowel
        case 'female':
          if (i == 0 || (i > 0 && !this.isVowel(hist[i-1]))) {
            hist.push(this.getRandomVow());
          }
          break;
        default:
          hist.push(this.getRandomChar());
          break;
        }
      }
      else {
        hist.push(this.getNextChar(hist[i-1]));
      }

      return hist;
    }, []);

    // capitalize the name
    name[0] = name[0].toUpperCase();
    name = name.join('');

    return name;
  }

  isConsonant (char) {
    if (char.length > 1) {
      char = char.charAt[char.length-1];
    }
    return this.consonants.indexOf(char) > -1;
  }

  isVowel (char) {
    if (char.length > 1) {
      char = char.charAt[char.length-1];
    }
    return this.vowels.indexOf(char) > -1;
  }

  getNextChar (prevChar) {
    if (prevChar.length > 1) {
      prevChar = prevChar.charAt(prevChar.length-1);
    }
    let char;
    // if the previous charcter was a vowel
    if (this.isVowel(prevChar)) {
      if (Math.random() < this.compConFreq) {
        char = this.getRandomCompCon();
      }
      else {
        char = this.getRandomCon();
      }
    }
    else {
      if (Math.random() < this.compVowFreq) {
        char = this.getRandomCompVow();
      }
      else {
        char = this.getRandomVow();
      }
    }
    // occasionally double the character if it is doublable
    if (this.double.indexOf(prevChar) > -1 && Math.random() < this.doubleFreq) {
      return prevChar;
    }

    return char;
  }

  getRandomCon () {
    for (let j = 0; j < 1000; j++) {
      let i = this.random.between(0, this.consonants.length-1);
      if (this.random.frac() <= this.consonantFreq[i]) {
        return this.consonants.charAt(i);
      }
    }
    throw new Error('to many tries for consonant');
  }

  getRandomCompCon () {
    return this.compoundCon[this.random.between(0, this.compoundCon.length-1)];
  }

  getRandomVow () {
    for (let j = 0; j < 1000; j++) {
      let i = this.random.between(0, this.vowels.length-1);
      if (this.random.frac() <= this.vowelFreq[i]) {
        return this.vowels.charAt(i);
      }
    }
    throw new Error('to many tries for vowel');
  }

  getRandomCompVow () {
    return this.compoundVow[this.random.between(0, this.compoundVow.length-1)];
  }

  getRandomChar () {
    if (this.random.frac() >= 0.5) {
      return this.getRandomVow();
    }
    else {
      return this.getRandomCon();
    }
  }
}

module.exports = NameGen;
