'use strict';


class Like {

  constructor(value) {
    this.value = value;
    this.regex = null;
  }


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


  match(value) {
    if (typeof value !== 'string') return false;
    if (this.regex === null) this.regex = Like._parse(this.value);
    return this.regex.test(value);
  }


  toString(urlEncode) {
    return (urlEncode) ? `"${escape(this.value)}"` : `"${this.value}"`;
  }

}


module.exports = Like;
