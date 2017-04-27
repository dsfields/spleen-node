'use strict';

const Parser = require('./parser');
const TokenType = require('./token-type');


class RangeParser extends Parser {

  _literal() {
    if (!this.accept(TokenType.string)) this.expect(TokenType.number);
    return this.tokenizer.current.value;
  }


  parse() {
    if (this.accept(TokenType.none)) this.tokenizer.next();

    const lower = this._literal();
    this.tokenizer.next();
    this.expect(TokenType.listDelimiter);
    this.tokenizer.next();
    const upper = this._literal();

    return { lower, upper };
  }

}


module.exports = RangeParser;
