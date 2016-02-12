'use strict';
/**
 * Random Data Generator
 */

 class RandomDataGenerator {
   constructor (seeds) {
     this.c   = 1;
     this.s0  = 0;
     this.s1  = 0;
     this.s2  = 0;

     seeds = seeds || [];

     if (typeof seeds === 'string') {
       this.state(seeds);
     }
     else {
       this.sow(seeds);
     }
   }

   rnd () {
     let t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

     this.c = t | 0;
     this.s0 = this.s1;
     this.s1 = this.s2;
     this.s2 = t - this.c;

     return this.s2;
   }

   sow (seeds) {
     // always reset to default seed
     this.s0 = this.hash(' ');
     this.s1 = this.hash(this.s0);
     this.s2 = this.hash(this.s1);
     this.c = 1;

     if (!seeds) {
       return;
     }

     // apply any seeds
     seeds.forEach((seed) => {
       if (!seed) {
         return;
       }
       this.s0 -= this.hash(seed);
       this.s0 += ~~(this.s0 < 0);
       this.s1 -= this.hash(seed);
       this.s1 += ~~(this.s1 < 0);
       this.s2 -= this.hash(seed);
       this.s2 += ~~(this.s2 < 0);
     });
   }

   /**
    * Internal method that creates a seed hash
    */
   hash (data) {
     let h, i, n;
     n = 0xefc8249d;
     data = data.toString();

     for (let i = 0; i < data.length; i++) {
       n += data.charCodeAt(i);
       h = 0.02519603282416938 * n;
       n = h >>> 0;
       h -= n;
       h *= n;
       n = h >>> 0;
       h -= n;
       n += h * 0x100000000;// 2^32
     }

     return (n >>> 0) * 2.3283064365386963e-10;// 2^-32
   }

   /**
    * Returns a random integer between 0 and 2^32
    */
   integer () {
     return this.rnd() * 0x100000000;// 2^32
   }

   /**
    * Returns a random real number between 0 and 1
    */
   frac () {
     return this.rnd() + (this.rnd() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
   }

   /**
    * Returns a random real number between 0 and 2^32
    */
   real () {
     return this.integer() + this.frac();
   }

   /**
    * Returns a random integer between and including min and max
    */
   integerInRange (min, max) {
     return Math.floor(this.realInRange(0, max - min + 1) + min);
   }

   /**
    * Alias of integerInRange
    */
   between (min, max) {
     return this.integerInRange(min, max);
   }

   /**
    * Returns a random real number between min and max
    */
   realInRange (min, max) {
     return this.frac() * (max - min) + min;
   }

   /**
    * Returns a random real number between -1 and 1
    */
   normal () {
     return 1 - 2 * this.frac();
   }

   /**
    * Returns a valid RFC4122 version4 ID hex string from https://gist.github.com/1308368
    */
   uuid () {
     let a = '';
     let b = '';

     for (b = a = ''; a++ < 36; b +=~a % 5 | a * 3&4 ? (a^15 ? 8^this.frac() * (a^20 ? 16 : 4) : 4).toString(16) : '-') {}

     return b;
   }

   /**
    * Returns a random member of `array`
    */
   pick (arr) {
     return arr[this.integerInRange(0, arr.length - 1)];
   }
 };

 module.exports = RandomDataGenerator;
