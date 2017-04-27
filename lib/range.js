'use strict';

const RangeParser = require('./range-parser');
const Tokenizer = require('./tokenizer');


const assert = function (val, name) {
  const type = typeof val;

  if (type !== 'string' && type !== 'number')
    throw new TypeError(`Argument ${name} must be a string or number`);
};


class Range {

  constructor(lower, upper) {
    this.lower = lower;
    this.upper = upper;

    if (lower > upper) {
      this.lower = upper;
      this.upper = lower;
    }

    this.lowerIndex = -1;
    this.upperIndex = -1;
  }


  static from(lower, upper) {
    assert(lower, 'lower');
    assert(upper, 'upper');
    return new Range(lower, upper);
  }


  static parse(value) {
    const tokenizer = new Tokenizer(value);
    const parser = new RangeParser(tokenizer);
    const result = parser.parse();
    return new Range(result.lower, result.upper);
  }


  between(value) {
    assert(value, 'value');
    return value >= this.lower && value <= this.upper;
  }

}


module.exports = Range;
