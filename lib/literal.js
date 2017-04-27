'use strict';

class Literal {

  constructor(index, value) {
    this.index = index;
    this.value = value;
  }


  static _stringify(value, urlEncode) {
    if (typeof value === 'string') {
      const val = (urlEncode) ? escape(value) : value;
      return '"' + val + '"';
    }

    if (typeof value === 'undefined')
      return '';

    if (value === null)
      return 'null';

    return value.toString();
  }


  toString(urlEncode) {
    if (Array.isArray(this.value)) {
      let str = '[';

      for (let i = 0; i < this.value.length; i++) {
        const val = this.value[i];
        if (i > 0) str += ',';
        str += Literal._stringify(val, urlEncode);
      }

      str += ']';

      return str;
    }

    return Literal._stringify(this.value, urlEncode);
  }

}

module.exports = Literal;
