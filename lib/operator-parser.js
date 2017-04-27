'use strict';

const OperatorType = require('./operator-type');
const Parser = require('./parser');
const TokenType = require('./token-type');


class OperatorParser extends Parser {

  parse(strict) {
    if (this.accept(TokenType.none)) this.tokenizer.next();
    if (this.accept(TokenType.eq)) return OperatorType.eq;
    if (this.accept(TokenType.neq)) return OperatorType.neq;
    if (this.accept(TokenType.gt)) return OperatorType.gt;
    if (this.accept(TokenType.gte)) return OperatorType.gte;
    if (this.accept(TokenType.lt)) return OperatorType.lt;
    if (this.accept(TokenType.lte)) return OperatorType.lte;
    if (this.accept(TokenType.in)) return OperatorType.in;
    if (this.accept(TokenType.nin)) return OperatorType.nin;
    if (this.accept(TokenType.between)) return OperatorType.between;
    if (this.accept(TokenType.nbetween)) return OperatorType.nbetween;
    if (this.accept(TokenType.like)) return OperatorType.like;

    if ((strict && this.expect(TokenType.nlike))
        || (!strict && this.accept(TokenType.nlike))) return OperatorType.nlike;

    return OperatorType.unknown;
  }

}

module.exports = OperatorParser;
