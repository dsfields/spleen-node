'use strict';

const Like = require('./like');
const Operator = require('./operator');
const Range = require('./range');
const Target = require('./target');


const msg = {
  array: 'Argument "value" must be an array',
  literal: 'Argument "value" must be a string, number or boolean',
  nope: 'Method unavailable',
  pattern: 'Argument "value" must be a string or instance of Like',
};


const empty = { isEmpty: true };


class Clause {

  constructor() {
    this.subject = empty;
    this.operator = empty;
    this.object = empty;

    this.eq = this._eq;
    this.neq = this._neq;
    this.gt = this._gt;
    this.gte = this._gte;
    this.lt = this._lt;
    this.lte = this._lte;
    this.in = this._in;
    this.nin = this._nin;
    this.between = this._between;
    this.nbetween = this._nbetween;
    this.like = this._like;
    this.nlike = this._nlike;

    this.literal = Clause._nope;
    this.target = Clause._nope;
    this.array = Clause._nope;
    this.pattern = Clause._nope;
    this.range = Clause._nope;
    this.match = Clause._nope;
    this.toString = Clause._nope;
  }


  //
  // UTILS
  //


  static _nope() {
    throw new ReferenceError(msg.nope);
  }


  static _assertLiteral(value) {
    const tval = typeof value;
    if (tval !== 'string'
        && tval !== 'number'
        && tval !== 'boolean'
        && value !== null
    )
      throw new TypeError(msg.literal);
  }


  static _assertArray(value) {
    if (!Array.isArray(value))
      throw new TypeError(msg.array);
  }


  static _getPattern(value) {
    if (value instanceof Like) return value;

    if (typeof value !== 'string')
      throw new TypeError(msg.like);

    return new Like(value);
  }


  static _getTarget(pointer) {
    return (pointer instanceof Target)
      ? pointer
      : Target.jsonPointer(pointer);
  }


  //
  // FACTORIES
  //


  static target(pointer) {
    const target = Clause._getTarget(pointer);
    const clause = new Clause();
    clause.subject = target;

    return clause;
  }


  static literal(value) {
    Clause._assertLiteral(value);
    const clause = new Clause();
    clause.subject = value;

    if (typeof value !== 'string') {
      clause.like = Clause._nope;
      clause.nlike = Clause._nope;
    }

    return clause;
  }


  //
  // OPERATORS
  //


  _disableOperators() {
    this.eq = Clause._nope;
    this.neq = Clause._nope;
    this.gt = Clause._nope;
    this.gte = Clause._nope;
    this.lt = Clause._nope;
    this.lte = Clause._nope;
    this.in = Clause._nope;
    this.nin = Clause._nope;
    this.between = Clause._nope;
    this.nbetween = Clause._nope;
    this.like = Clause._nope;
    this.nlike = Clause._nope;
  }


  _eq() {
    this.operator = Operator.eq;
    this._disableOperators();
    this.literal = this._literal;
    this.target = this._target;
    return this;
  }


  _neq() {
    this.operator = Operator.neq;
    this._disableOperators();
    this.literal = this._literal;
    this.target = this._target;
    return this;
  }


  _gt() {
    this.operator = Operator.gt;
    this._disableOperators();
    this.literal = this._literal;
    this.target = this._target;
    return this;
  }


  _gte() {
    this.operator = Operator.gte;
    this._disableOperators();
    this.literal = this._literal;
    this.target = this._target;
    return this;
  }


  _lt() {
    this.operator = Operator.lt;
    this._disableOperators();
    this.literal = this._literal;
    this.target = this._target;
    return this;
  }


  _lte() {
    this.operator = Operator.lte;
    this._disableOperators();
    this.literal = this._literal;
    this.target = this._target;
    return this;
  }

  _in() {
    this.operator = Operator.in;
    this._disableOperators();
    this.array = this._array;
    return this;
  }


  _nin() {
    this.operator = Operator.nin;
    this._disableOperators();
    this.array = this._array;
    return this;
  }


  _between() {
    this.operator = Operator.between;
    this._disableOperators();
    this.range = this._range;
    return this;
  }


  _nbetween() {
    this.operator = Operator.nbetween;
    this._disableOperators();
    this.range = this._range;
    return this;
  }


  _like() {
    this.operator = Operator.like;
    this._disableOperators();
    this.pattern = this._pattern;
    return this;
  }


  _nlike() {
    this.operator = Operator.nlike;
    this._disableOperators();
    this.pattern = this._pattern;
    return this;
  }


  //
  // OBJECT
  //


  _complete() {
    this.target = Clause._nope;
    this.literal = Clause._nope;
    this.array = Clause._nope;
    this.pattern = Clause._nope;
    this.range = Clause._nope;
    this.match = this._match;
    this.toString = this._toString;
  }


  _target(pointer) {
    this.object = Clause._getTarget(pointer);
    this._complete();
    return this;
  }


  _literal(value) {
    Clause._assertLiteral(value);
    this.object = value;
    this._complete();
    return this;
  }


  _array(value) {
    Clause._assertArray(value);
    this.object = value;
    this._complete();
    return this;
  }


  _pattern(value) {
    this.object = Clause._getPattern(value);
    this._complete();
    return this;
  }


  _range(lower, upper) {
    this.object = new Range(lower, upper);
    this._complete();
    return this;
  }


  //
  // VALIDATION
  //


  isValid() {
    return (
      this.subject !== empty
      && this.operator !== empty
      && this.object !== empty
    );
  }


  //
  // MATCH
  //


  _match(src) {
    const subject = (this.subject instanceof Target)
      ? this.subject.get(src)
      : this.subject;

    const object = (this.object instanceof Target)
      ? this.object.get(src)
      : this.object;

    return this.operator.match(subject, object);
  }


  //
  // STRINGIFICATION
  //


  static _stringifyArray(array, urlEncode) {
    let str = '[';

    for (let i = 0; i < array.length; i++) {
      if (i > 0) str += ',';

      const value = array[i];
      str += Clause._stringify(value, urlEncode);
    }

    str += ']';

    return str;
  }


  static _stringify(value, urlEncode) {
    if (value === null)
      return 'nil';

    if (typeof value === 'number' || typeof value === 'boolean')
      return value.toString();

    if (value instanceof Like || value instanceof Range)
      return value.toString(urlEncode);

    if (value instanceof Target)
      return value.toJsonPointer(urlEncode);

    if (Array.isArray(value))
      return Clause._stringifyArray(value, urlEncode);

    return (urlEncode) ? `"${escape(value)}"` : `"${value}"`;
  }


  _toString(urlEncode) {
    const space = (urlEncode) ? '%20' : ' ';

    return Clause._stringify(this.subject, urlEncode)
      + space
      + this.operator.toString()
      + space
      + Clause._stringify(this.object, urlEncode);
  }

}


module.exports = Clause;
