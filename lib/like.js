'use strict';


/**
 * Represents a search pattern.
 */
class Like {

  /** @private */
  constructor(value) {
    this.value = value;
    this.regex = null;
  }


  /** @private */
  static _parse(value) {
    let regex = '^';
    let isEscaping = false;

    for (let i = 0; i < value.length; i++) {
      const char = value[i];

      if (isEscaping) {
        isEscaping = false;
        if (char === '*') regex += '\\*';
        else regex += char;
        continue;
      }

      switch (char) {
        case '\\':
          isEscaping = true;
          break;

        case '*':
          regex += '.*';
          break;

        case '_':
          regex += '.{1}';
          break;

        default:
          regex += char;
          break;
      }
    }

    regex += '$';

    return new RegExp(regex, 'i');
  }


  /**
   * Determines whether or not the pattern matches a string value.
   *
   * @param {String} value
   *  A value to match
   *
   * @return {Boolean}
   */
  match(value) {
    if (typeof value !== 'string') return false;
    if (this.regex === null) this.regex = Like._parse(this.value);
    return this.regex.test(value);
  }


  /**
   * Converts the Like pattern to a string.
   * @param {Boolean} urlEncode
   *  Whether or not the returned value should be URL encoded.
   */
  toString(urlEncode) {
    return (urlEncode) ? `"${escape(this.value)}"` : `"${this.value}"`;
  }

}


module.exports = Like;
