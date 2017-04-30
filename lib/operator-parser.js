'use strict';

const Parser = require('./parser');
const TokenType = require('./token-type');


class OperatorParser extends Parser {

  parse(strict) {
    if (this.accept(TokenType.none)) this.tokenizer.next();
    if (this.accept(TokenType.eq)) return 'eq';
    if (this.accept(TokenType.neq)) return 'neq';
    if (this.accept(TokenType.gt)) return 'gt';
    if (this.accept(TokenType.gte)) return 'gte';
    if (this.accept(TokenType.lt)) return 'lt';
    if (this.accept(TokenType.lte)) return 'lte';
    if (this.accept(TokenType.in)) return 'in';
    if (this.accept(TokenType.nin)) return 'nin';
    if (this.accept(TokenType.between)) return 'between';
    if (this.accept(TokenType.nbetween)) return 'nbetween';
    if (this.accept(TokenType.like)) return 'like';

    if ((strict && this.expect(TokenType.nlike))
        || (!strict && this.accept(TokenType.nlike))) return 'nlike';

    return 'unknown';
  }

}

module.exports = OperatorParser;
