'use strict';

const Parser = require('./parser');
const TokenType = require('./token-type');


class JsonPointerParser extends Parser {

  parse(strict) {
    const path = [];
    let field = '';
    let endField = false;

    do {
      if (this.accept(TokenType.none)) continue;

      if ((strict && this.expect(TokenType.target))
          || (!strict && this.accept(TokenType.target))
      ) {
        const val = this.tokenizer.current.value;
        path.push(val);

        if (typeof val === 'number') endField = true;
        else if (!endField) field += '/' + val;

        continue;
      }

      break;
    } while (this.tokenizer.next());

    if (field.length === 0) field = '/';

    return {
      field,
      path,
    };
  }

}


module.exports = JsonPointerParser;
