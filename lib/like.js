'use strict';


/**
 * Represents a search pattern.
 */
class Like {

  /** @private */
  constructor(value) {
    this.value = value;
    this._regex = null;
    this._regexString = null;
  }


  /**
   * Determines whether or not the pattern matches a string value.
   *
   * @param {String} value
   *  A value to match
   *
   * @return {Boolean}
   */
  match(value, isRegex = false) {
    if (typeof value !== 'string') return false;
    if (this._regex === null) this._regex = this.toRegex(isRegex);
    return this._regex.test(value);
  }


  /**
   * Converts the Like pattern to a compatible regular expression.
   *
   * @return {RegExp}
   */
  toRegex(isRegex = false) {
    if (this._regex !== null) return this._regex;
    let regex;
    if (isRegex) {
      regex = this.value;
      this._regexString = regex;
    } else {
      regex = this.toRegexString();
    }
    this._regex = new RegExp(regex, 'i');
    return this._regex;
  }


  /**
   * Converts the Like pattern to a compatible regular expression string.
   *
   * @return {String}
   */
  toRegexString() {
    if (this._regexString !== null) return this._regexString;

    let regex = '^';
    let isEscaping = false;

    for (let i = 0; i < this.value.length; i++) {
      const char = this.value[i];

      if (isEscaping) {
        isEscaping = false;
        switch (char) {
          case '*':
            regex += '\\*';
            break;

          case '_':
            regex += '_';
            break;

          default:
            regex += `\\\\${char}`;
            break;
        }

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

    if (isEscaping) regex += '\\\\';

    regex += '$';

    this._regexString = regex;

    return regex;
  }


  /**
   * Converts the Like pattern to a string.
   *
   * @param {Boolean} urlEncode
   *  Whether or not the returned value should be URL encoded.
   *
   * @return {String}
   */
  toString(urlEncode) {
    return (urlEncode) ? `"${escape(this.value)}"` : `"${this.value}"`;
  }

}


module.exports = Like;
