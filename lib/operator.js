'use strict';

const errors = require('./errors');
const Like = require('./like');
const Range = require('./range');


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


  match(subject, object) {
    if (arguments.length !== 2)
      throw new TypeError(msg.matchArgs);

    switch (this.type) {
      case 'eq':
        return subject === object;

      case 'neq':
        return subject !== object;

      case 'gt':
        return subject > object;

      case 'gte':
        return subject >= object;

      case 'lt':
        return subject < object;

      case 'lte':
        return subject <= object;

      case 'in':
        assertArray(object);
        return object.indexOf(subject) > -1;

      case 'nin':
        assertArray(object);
        return object.indexOf(subject) === -1;

      case 'between':
        assertRange(object);
        return object.between(subject);

      case 'nbetween':
        assertRange(object);
        return !object.between(subject);

      case 'like':
        assertLike(object);
        return object.match(subject);

      case 'nlike':
        assertLike(object);
        return !object.match(subject);

      default:
        throw new errors.MatchError({ operator: this.type });
    }
  }


  toString() {
    return this.type;
  }

}


op.eq = new Operator('eq');
op.neq = new Operator('neq');
op.gt = new Operator('gt');
op.gte = new Operator('gte');
op.lt = new Operator('lt');
op.lte = new Operator('lte');
op.in = new Operator('in');
op.nin = new Operator('nin');
op.between = new Operator('between');
op.nbetween = new Operator('nbetween');
op.like = new Operator('like');
op.nlike = new Operator('nlike');


module.exports = Operator;
