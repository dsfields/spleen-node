'use strict';

const elv = require('elv');

const Token = require('./token');
const Tokenizer = require('./tokenizer');


/**
 * Represents a field reference.
 *
 * @property {Array} path
 *  The individual components of the path to the target field.
 *
 * @property {String} field
 *  The full field name being targeted (in JSON pointer format).  If the target
 *  includes an array index, this value is a reference to the array field
 *  itself.
 */
class Target {

  /** @private */
  constructor(path, field) {
    this.path = elv.coalesce(path, []);
    this.field = elv.coalesce(field, '');
  }


  /**
   * Parses a JSON Pointer in RFC 6901 into an instance of Target.
   *
   * @param {String} value
   *
   * @return {Target}
   */
  static jsonPointer(value) {
    let strict = true;
    let tokenizer;

    if (value instanceof Tokenizer) {
      tokenizer = value;
      if (tokenizer.isStart) tokenizer.next();
      strict = false;
    } else {
      tokenizer = new Tokenizer(value);
      tokenizer.next();
    }

    const path = [];
    let field = '';
    let endField = false;

    do {
      if (tokenizer.current.type !== Token.target) {
        if (!strict) break;
        throw tokenizer.error();
      }

      const val = tokenizer.current.value;
      path.push(val);

      if (typeof val === 'number') endField = true;
      else if (!endField) field += '/' + val;
    } while (tokenizer.next());

    if (field.length === 0) field = '/';

    return new Target(path, field);
  }


  /**
   * Gets the value from a provided object at the path specified by the Target.
   *
   * @param {Object} from
   *
   * @return {*}
   */
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


  /**
   * Converts the Target to a JSON Pointer in RFC 6901 format.
   *
   * @param {Boolean} urlEncode
   *  Whether or not the returned value should be URL encoded.
   *
   * @return {String}
   */
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
