'use strict';

const elv = require('elv');

const Clause = require('./clause');
const Filter = require('./filter');
const Target = require('./target');
const Tokenizer = require('./tokenizer');
const Token = require('./token');


class Parser {

  constructor(value) {
    this.tokenizer = new Tokenizer(value);
  }


  _expect(term) {
    if (!this._accept(term)) throw this.tokenizer.error();
    return true;
  }


  _accept(term) {
    return elv(this.tokenizer.current) && this.tokenizer.current.type === term;
  }


  _target(clause) {
    const target = Target.jsonPointer(this.tokenizer);
    return clause.target(target);
  }


  _assertLiteral() {
    if (!this._accept(Token.number)
        && !this._accept(Token.string)
        && !this._accept(Token.boolean)
    )
      this._expect(Token.nil);
  }


  _literal(clause) {
    this._assertLiteral();
    const value = this.tokenizer.current.value;
    this.tokenizer.next();
    return clause.literal(value);
  }


  _comparisonObject(clause) {
    this.tokenizer.next();

    if (this._accept(Token.target))
      return this._target(clause);

    return this._literal(clause);
  }


  _arrayObject(clause) {
    const value = [];

    this.tokenizer.next();
    this._expect(Token.openArray);

    while (this.tokenizer.next()) {
      if (this._accept(Token.closeArray)) break;

      if (value.length > 0) {
        this._expect(Token.listDelimiter);
        this.tokenizer.next();
      }

      this._assertLiteral();
      value.push(this.tokenizer.current.value);
    }

    this._expect(Token.closeArray);
    this.tokenizer.next();

    return clause.array(value);
  }


  _rangeLiteral() {
    if (!this._accept(Token.string) && !this._accept(Token.number))
      this._expect(Token.nil);

    return this.tokenizer.current.value;
  }


  _rangeObject(clause) {
    this.tokenizer.next();
    const lower = this._rangeLiteral();
    this.tokenizer.next();
    this._expect(Token.listDelimiter);
    this.tokenizer.next();
    const upper = this._rangeLiteral();
    this.tokenizer.next();
    return clause.range(lower, upper);
  }


  _patternObject(clause) {
    this.tokenizer.next();
    this._expect(Token.string);
    const value = this.tokenizer.current.value;
    this.tokenizer.next();
    return clause.pattern(value);
  }


  _predicate(clause) {
    if (this._accept(Token.eq)) {
      clause.eq();
      return this._comparisonObject(clause);
    }

    if (this._accept(Token.neq)) {
      clause.neq();
      return this._comparisonObject(clause);
    }

    if (this._accept(Token.gt)) {
      clause.gt();
      return this._comparisonObject(clause);
    }

    if (this._accept(Token.gte)) {
      clause.gte();
      return this._comparisonObject(clause);
    }

    if (this._accept(Token.lt)) {
      clause.lt();
      return this._comparisonObject(clause);
    }

    if (this._accept(Token.lte)) {
      clause.lte();
      return this._comparisonObject(clause);
    }

    if (this._accept(Token.in)) {
      clause.in();
      return this._arrayObject(clause);
    }

    if (this._accept(Token.nin)) {
      clause.nin();
      return this._arrayObject(clause);
    }

    if (this._accept(Token.between)) {
      clause.between();
      return this._rangeObject(clause);
    }

    if (this._accept(Token.nbetween)) {
      clause.nbetween();
      return this._rangeObject(clause);
    }

    if (this._accept(Token.like)) {
      clause.like();
      return this._patternObject(clause);
    }

    this._expect(Token.nlike);
    clause.nlike();

    return this._patternObject(clause);
  }


  _subject() {
    if (this._accept(Token.target))
      return this._target(Clause);

    return this._literal(Clause);
  }


  _clause() {
    const clause = this._subject();
    this._predicate(clause);
    return clause;
  }


  _group() {
    const group = this._filter();
    this._expect(Token.closeGroup);
    this.tokenizer.next();
    return group;
  }


  _groupJoin(filter, conjunctive) {
    this.tokenizer.next();

    if (this._accept(Token.openGroup)) {
      const group = this._group();
      if (conjunctive === 'and') filter.andGroup(group);
      else filter.orGroup(group);
      return true;
    }

    return false;
  }


  _conjunction(filter, conjunctive) {
    if (this._groupJoin(filter, conjunctive)) return;
    const clause = this._clause();
    filter[conjunctive](clause);
  }


  _body(filter) {
    do {
      if (this._accept(Token.and)) {
        this._conjunction(filter, 'and');
        continue;
      }

      this._expect(Token.or);
      this._conjunction(filter, 'or');
    } while (!this.tokenizer.isEnd && !this._accept(Token.closeGroup));
  }


  _open() {
    if (this._accept(Token.openGroup)) {
      const group = this._group();
      return Filter.group(group);
    }

    const clause = this._clause();
    return Filter.where(clause);
  }


  _filter() {
    if (!this.tokenizer.next())
      throw this.tokenizer.error({ value: '' });

    const filter = this._open();
    if (!this.tokenizer.isEnd) this._body(filter);

    return filter;
  }


  parse() {
    const result = {
      success: true,
      value: null,
      error: null,
    };

    try {
      result.value = this._filter();

      if (!this.tokenizer.isEnd) {
        result.value = null;
        result.success = false;
        result.error = this.tokenizer.error();
      }
    } catch (err) {
      result.success = false;
      result.error = err;
    }

    return result;
  }

}


module.exports = Parser;
