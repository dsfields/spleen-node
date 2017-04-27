'use strict';

const elv = require('elv');

const JsonPointerParser = require('./json-pointer-parser');
const Tokenizer = require('./tokenizer');


class Target {

  constructor(path, field) {
    this.path = elv.coalesce(path, []);
    this.field = elv.coalesce(field, '');
  }


  static jsonPointer(value) {
    const tokenizer = new Tokenizer(value);
    const parser = new JsonPointerParser(tokenizer);
    const result = parser.parse(true);
    return new Target(result.path, result.field);
  }


  get(from) {
    let current = from;

    for (let i = 0; i < this.path.length; i++) {
      if (!elv(current)) return undefined;

      const key = this.path[i];

      if (Number.isInteger(key)
          && Array.isArray(current)
          && key >= current.length) return undefined;

      current = current[key];
    }

    return current;
  }


  toJsonPointer() {
    return '/' + this.path.join('/');
  }

}

module.exports = Target;
