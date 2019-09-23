'use strict';

const Like = require('./like');
const Operator = require('./operator');
const Range = require('./range');
const Target = require('./target');

const _ = require('lodash');

/**
 * @class ClauseBase
 *
 * @property {Target|String|Number|Boolean} subject
 *  The subject of the Clause.
 *
 * @property {String} operator
 *  The verb of the Clause.  This is an enumerated value that can be either: eq,
 *  neq, gt, gte, lt, lte, in, nin, between, nbetween, like, nlike.
 *
 * @property {Target|Range|Array|String|Number|Boolean} object
 *  The object of the Clause.
 *
 * @method isValid
 *  Determines if the Clause is in a valid state.  A Clause is valid if it
 *  has a subject, verb, and object.
 * @return {Boolean}
 */


/**
 * @class ClauseComplete
 * @extends ClauseBase
 *
 * @classdesc
 * A complete and well-formed Clause with a subject, verb, and object.
 */


/**
 * @class ClauseWithComparison
 * @extends ClauseBase
 *
 * @classdesc
 * A partial Clause containing a subject and a comparison verb.
 *
 * @method target
 *  Adds a field reference as the object on the Clause.
 * @param {Target|String} pointer
 * @return {ClauseComplete}
 *
 * @method literal
 *  Adds a literal value as the object on the Clause.
 * @param {String|Number|Boolean} value
 * @return {ClauseComplete}
 */


/**
 * @class ClauseWithArray
 * @extends ClauseBase
 *
 * @classdesc
 * A partial Clause containing a subject and an array verb.
 *
 * @method array
 *  Adds an array as the object on the Clause.
 * @param {Array} value
 * @return {ClauseComplete}
 */


/**
 * @class ClauseWithRange
 * @extends ClauseBase
 *
 * @classdesc
 * A partial Clause containing a subject and a range verb.
 *
 * @method range
 *  Adds a range as the object on the Clause.
 * @param {String|Number} lower
 * @param {String|Number} upper
 */


/**
 * @class ClauseWithSearch
 * @extends ClauseBase
 *
 * @classdesc
 * A partial Clause containing a subject and a search verb.
 *
 * @method pattern
 *  Adds a search pattern as the object on the Clause.
 * @param {Array} value
 * @return {ClauseComplete}
 */


/**
 * @class ClauseWithSubject
 * @extends ClauseBase
 *
 * @classdesc
 * A partial Clause containing a subject.
 *
 * @method eq
 *  Sets the operator to "eq" (equal to).
 * @return {ClauseWithComparison}
 *
 * @method neq
 *  Sets the operator to "neq" (not equal to).
 * @return {ClauseWithComparison}
 *
 * @method gt
 *  Sets the operator to "gt" (greater than).
 * @return {ClauseWithComparison}
 *
 * @method gte
 *  Sets the operator to "gte" (greater than equal to).
 * @return {ClauseWithComparison}
 *
 * @method lt
 *  Sets the operator to "lt" (less than).
 * @return {ClauseWithComparison}
 *
 * @method lte
 *  Sets the operator to "lte" (less than equal to).
 * @return {ClauseWithComparison}
 *
 * @method in
 *  Sets the operator to "in" (in array).
 * @return {ClauseWithArray}
 *
 * @method nin
 *  Sets the operator to "nin" (not in array).
 * @return {ClauseWithArray}
 *
 * @method between
 *  Sets the operator to "between" (in range).
 * @return {ClauseWithRange}
 *
 * @method nbetween
 *  Sets the operator to "nbetween" (not in range).
 * @return {ClauseWithRange}
 *
 * @method like
 *  Sets the operator to "like" (like pattern).
 * @return {ClauseWithSearch}
 *
 * @method nlike
 *  Sets the operator to "nlike" (not like pattern).
 * @return {ClauseWithSearch}
*/


const msg = {
  array: 'Argument "value" must be an array',
  literal: 'Argument "value" must be a string, number or boolean',
  nope: 'Method unavailable',
  pattern: 'Argument "value" must be a string or instance of Like',
};


const empty = { isEmpty: true };


/**
 * Represents a clause in a Boolean expression in subject-verb-object form.
 * @extends ClauseBase
 */
class Clause {

  /** @private */
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


  /** @private */
  static _nope() {
    throw new ReferenceError(msg.nope);
  }


  /** @private */
  static _assertLiteral(value) {
    const tval = typeof value;
    if (tval !== 'string'
        && tval !== 'number'
        && tval !== 'boolean'
        && value !== null
    )
      throw new TypeError(msg.literal);
  }


  /** @private */
  static _assertArray(value) {
    if (!Array.isArray(value))
      throw new TypeError(msg.array);
  }


  /** @private */
  static _getPattern(value) {
    if (value instanceof Like) return value;

    if (typeof value !== 'string')
      throw new TypeError(msg.like);

    return new Like(value);
  }


  /** @private */
  static _getTarget(pointer) {
    return (pointer instanceof Target)
      ? pointer
      : Target.jsonPointer(pointer);
  }


  //
  // FACTORIES
  //


  /**
   * Creates an instance of a Clause with a field reference as the subject.
   * @param {Target|String} pointer
   * @return {ClauseWithSubject}
   */
  static target(pointer) {
    const target = Clause._getTarget(pointer);
    const clause = new Clause();
    clause.subject = target;

    return clause;
  }


  /**
   * Creates an instance of Clause with a literal value as teh subject.
   * @param {String|Number|Boolean} value
   * @return {ClauseWithSubject}
   */
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


  /** @private */
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


  /** @private */
  _comparisonOperator() {
    this._disableOperators();
    this.literal = this._literal;
    this.target = this._target;
    return this;
  }


  /** @private */
  _eq() {
    this.operator = Operator.eq;
    return this._comparisonOperator();
  }


  /** @private */
  _neq() {
    this.operator = Operator.neq;
    return this._comparisonOperator();
  }


  /** @private */
  _gt() {
    this.operator = Operator.gt;
    return this._comparisonOperator();
  }


  /** @private */
  _gte() {
    this.operator = Operator.gte;
    return this._comparisonOperator();
  }


  /** @private */
  _lt() {
    this.operator = Operator.lt;
    return this._comparisonOperator();
  }


  /** @private */
  _lte() {
    this.operator = Operator.lte;
    return this._comparisonOperator();
  }


  /** @private */
  _arrayOperator() {
    this._disableOperators();
    this.array = this._array;
    return this;
  }

  /** @private */
  _in() {
    this.operator = Operator.in;
    return this._arrayOperator();
  }


  /** @private */
  _nin() {
    this.operator = Operator.nin;
    return this._arrayOperator();
  }


  /** @private */
  _rangeOperator() {
    this._disableOperators();
    this.range = this._range;
    return this;
  }


  /** @private */
  _between() {
    this.operator = Operator.between;
    return this._rangeOperator();
  }


  /** @private */
  _nbetween() {
    this.operator = Operator.nbetween;
    return this._rangeOperator();
  }


  /** @private */
  _searchOperator() {
    this._disableOperators();
    this.pattern = this._pattern;
    return this;
  }


  /** @private */
  _like() {
    this.operator = Operator.like;
    return this._searchOperator();
  }


  /** @private */
  _nlike() {
    this.operator = Operator.nlike;
    return this._searchOperator();
  }


  //
  // OBJECT
  //


  /** @private */
  _complete() {
    this.target = Clause._nope;
    this.literal = Clause._nope;
    this.array = Clause._nope;
    this.pattern = Clause._nope;
    this.range = Clause._nope;
    this.match = this._match;
    this.toString = this._toString;
  }


  /** @private */
  _object(value) {
    this.object = value;
    this._complete();
    return this;
  }


  /** @private */
  _target(pointer) {
    return this._object(Clause._getTarget(pointer));
  }


  /** @private */
  _literal(value) {
    const val = typeof value === 'string' ? _.trim(value) : value;
    Clause._assertLiteral(val);
    return this._object(val);
  }


  /** @private */
  _array(value) {
    Clause._assertArray(value);
    return this._object(value);
  }


  /** @private */
  _pattern(value) {
    return this._object(Clause._getPattern(value));
  }


  /** @private */
  _range(lower, upper) {
    return this._object(new Range(lower, upper));
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


  /** @private */
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


  /** @private */
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


  /** @private */
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


  /** @private */
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
