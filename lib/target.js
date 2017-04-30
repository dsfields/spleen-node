'use strict';

const elv = require('elv');

const JsonPointerParser = require('./json-pointer-parser');
const Tokenizer = require('./tokenizer');


class Target {

  constructor(path, field) {
    this.path = elv.coalesce(path, []);
    this.field = elv.coalesce(field, '');
  }


  static jsonPointer(pointer) {
    if (typeof pointer !== 'string' || pointer.length === 0)
      throw new TypeError('Argument "pointer" must be a non-empty string');

    const tokenizer = new Tokenizer(pointer);
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


  toJsonPointer(urlEncode) {
    if (!urlEncode) return '/' + this.path.join('/');

    let str = '';

    for (let i = 0; i < this.path.length; i++) {
      str += '/';

      const node = this.path[i];

      if (typeof node === 'number') {
        str += node.toString();
        continue;
      }

      str += escape(node);
    }

    return str;
  }

}

module.exports = Target;
