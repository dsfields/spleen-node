'use strict';

const elv = require('elv');


const assert = function (val, name) {
  const type = typeof val;

  if (type !== 'string' && type !== 'number')
    throw new TypeError(`Argument "${name}" must be a string or number`);
};


class Range {

  constructor(lower, upper) {
    assert(lower, 'lower');
    assert(upper, 'upper');

    this.lower = lower;
    this.upper = upper;

    if (lower > upper) {
      this.lower = upper;
      this.upper = lower;
    }
  }


  between(value) {
    if (!elv(value)) return false;
    assert(value, 'value');
    return value >= this.lower && value <= this.upper;
  }


  static _stringify(value, urlEncode) {
    if (typeof value === 'number') return value.toString();
    const val = (urlEncode) ? escape(value) : value;
    return `"${val}"`;
  }


  toString(urlEncode) {
    const a = Range._stringify(this.lower, urlEncode);
    const b = Range._stringify(this.upper, urlEncode);
    return `${a},${b}`;
  }

}


module.exports = Range;
