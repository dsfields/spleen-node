'use strict';


class Like {

  constructor(index, value) {
    this.index = index;
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
        regex += char;
        continue;
      }

      switch (char) {
        case '\\':
          isEscaping = true;
          break;

        case '%':
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

}


module.exports = Like;
