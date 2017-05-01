'use strict';

const Filter = require('./filter');
const Operator = require('./operator');
const Parser = require('./parser');
const TokenType = require('./token-type');


class InfixParser extends Parser {

  constructor(value) {
    super(value);
    this._jpParser = new JsonPointerParser(this.tokenizer);
    this._opParser = new OperatorParser(this.tokenizer);
    this._rangeParser = new RangeParser(this.tokenizer);
  }


  _subject() {
    if (this.accept(TokenType.target))
      return this._jpParser.parse();

    if (this.accept(TokenType.string) || this.expect(TokenType.number)) {
      const value = this.tokenizer.current.value;
      this.tokenizer.next();
      return value;
    }
  }


  _predicate() {
    const op = this.opParser.parse();
    let object;
    const tkn = this.tokenizer;
    tkn.next();

    switch (op.value) {
      case Operator.eq.value:
      case Operator.neq.value:
      case Operator.gt.value:
      case Operator.gte.value:
      case Operator.lt.value:
      case Operator.lte.value:
        if (this.accept(TokenType.target)) {
          object = this._jpParser.parse();
          break;
        }

        if (this.accept(TokenType.string)
            || this.accept(TokenType.number)
            || this.expect(TokenType.boolean)) {
          object = tkn.current.value;
          tkn.next();
          break;
        }

        break;

      case Operator.between.value:
      case Operator.nbetween.value:
        object = this._rangeParser.parse();
        break;

      case Operator.in.value:
      case Operator.nin.value:
        this.expect(TokenType.openArray);
        object = [];
        let isFirst = true;

        while (tkn.next()) {
          if (this.accept(TokenType.closeArray)) break;

          if (isFirst) {
            isFirst = false;
          } else {
            this.expect(TokenType.listDilimiter);
            tkn.next();
          }

          if (this.accept(TokenType.string)
              || this.accept(TokenType.number)
              || this.expect(TokenType.boolean)) {
            object.push(tkn.current.value);
          }
        }

        this.expect(TokenType.closeArray);
        tkn.next();
        break;

      default:
        this.expect(TokenType.string);
        const object = tkn.current.value;
        tkn.next();
        break;
    }

    return {
      op,
      object,
    };
  }


  _condition(filter) {
    let conjunctive = null;

    if (filter !== null) {
      if (this.accept(TokenType.and) || this.expect(TokenType.or)) {
        conjunctive = this.tokenizer.current.type;
        this.tokenizer.next();
      }
    }

    if (this.accept(TokenType.openGroup))
      return this._group(filter, conjunctive);

    const subject = this._subject();
    const predicate = this._predicate();

    if (filter === null)
      filter = Filter.where(subject, predicate.op, predicate.object);
    else if (conjunctive === TokenType.or)
      filter.or(subject, predicate.op, predicate.object);
    else
      filter.and(subject, predicate.op, predicate.object);

    if (this.tokenizer.next())
      filter = this._condition(filter);

    return filter;
  }


  _group(filter, conjunctive) {
    this.tokenizer.next();
    const group = this._condition(null);
    this.expect(TokenType.closeGroup);
    if (filter === null) return Filter.group(group);
    if (conjunctive === TokenType.or) return filter.orGroup(group);
    return filter.andGroup(group);
  }


  parse() {
    const result = {
      success: false,
      value: null,
      error: null,
    };

    try {
      if (!this.tokenizer.next()) return result;
      result.value = this._condition(null);
      result.success = true;
    } catch (err) {
      if (!(err instanceof errors.ParserError)) throw err;
      result.error = err;
    }

    return result;
  }

}


module.exports = InfixParser;
