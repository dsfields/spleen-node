'use strict';

const elv = require('elv');

const errors = require('./errors');
const Tokenizer = require('./tokenizer');
const TokenType = require('./token-type');


class Parser {

  constructor(value) {
    this.tokenizer = (value instanceof Tokenizer)
      ? value
      : new Tokenizer(value);
  }


  throwError() {
    const val = this.tokenizer.current.value.toString();
    const pos = this.tokenizer.cursor - val.length;

    const msg = 'Unexpected token "'
      + val
      + '" at position '
      + pos.toString();

    throw new errors.ParserError(msg, pos);
  }


  expect(term) {
    if (!this.accept(term)) this.throwError();
    return true;
  }


  accept(term) {
    if (elv(this.tokenizer.current))
      return this.tokenizer.current.type === term;

    return term === TokenType.none;
  }

}


module.exports = Parser;
