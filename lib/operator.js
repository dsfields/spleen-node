'use strict';

const errors = require('./errors');
const Like = require('./like');
const OperatorParser = require('./operator-parser');
const OperatorType = require('./operator-type');
const Range = require('./range');
const Tokenizer = require('./tokenizer');


const msg = {
  array: 'Argument "object" must be an array',
  like: 'Argument "object" must be an instance of Like',
  matchArgs: 'The match() method takes two arguments',
  range: 'Argument object must be instance of Range',
};


const assertArray = function (object) {
  if (!Array.isArray(object)) throw new TypeError(msg.array);
};


const assertRange = function (object) {
  if (!(object instanceof Range)) throw new TypeError(msg.range);
};


const assertLike = function (object) {
  if (!(object instanceof Like)) throw new TypeError(msg.like);
};


const op = {};


class Operator {

  constructor(type) {
    this.type = type;
  }


  static get eq() { return op.eq; }
  static get neq() { return op.neq; }
  static get gt() { return op.gt; }
  static get gte() { return op.gte; }
  static get lt() { return op.lt; }
  static get lte() { return op.lte; }
  static get in() { return op.in; }
  static get nin() { return op.nin; }
  static get between() { return op.between; }
  static get nbetween() { return op.nbetween; }
  static get like() { return op.like; }
  static get nlike() { return op.nlike; }


  static parse(value) {
    const tokenizer = new Tokenizer(value);
    const parser = new OperatorParser(tokenizer);
    const result = parser.parse(true);
    return new Operator(result);
  }


  match(subject, object) {
    if (arguments.length !== 2)
      throw new TypeError(msg.matchArgs);

    switch (this.type) {
      case OperatorType.eq:
        return subject === object;

      case OperatorType.neq:
        return subject !== object;

      case OperatorType.gt:
        return subject > object;

      case OperatorType.gte:
        return subject >= object;

      case OperatorType.lt:
        return subject < object;

      case OperatorType.lte:
        return subject <= object;

      case OperatorType.in:
        assertArray(object);
        return object.indexOf(subject) > -1;

      case OperatorType.nin:
        assertArray(object);
        return object.indexOf(subject) === -1;

      case OperatorType.between:
        assertRange(object);
        return object.between(subject);

      case OperatorType.nbetween:
        assertRange(object);
        return !object.between(subject);

      case OperatorType.like:
        assertLike(object);
        return object.match(subject);

      case OperatorType.nlike:
        assertLike(object);
        return !object.match(subject);

      default:
        throw new errors.MatchError({ operator: this.type });
    }
  }

}


op.eq = new Operator(OperatorType.eq);
op.neq = new Operator(OperatorType.neq);
op.gt = new Operator(OperatorType.gt);
op.gte = new Operator(OperatorType.gte);
op.lt = new Operator(OperatorType.lt);
op.lte = new Operator(OperatorType.lte);
op.in = new Operator(OperatorType.in);
op.nin = new Operator(OperatorType.nin);
op.between = new Operator(OperatorType.between);
op.nbetween = new Operator(OperatorType.nbetween);
op.like = new Operator(OperatorType.like);
op.nlike = new Operator(OperatorType.nlike);


module.exports = Operator;
