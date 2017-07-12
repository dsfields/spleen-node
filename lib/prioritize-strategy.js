'use strict';

const elv = require('elv');


const msg = {
  argPrioritiesArray: 'Argument "priorities" must be an array',
  argPrioritiesOptionsObj: 'Argument "options" must be an object',
  argOptsPrecedence: 'Argument "options.precedence" must be "and" or "or"',
  argOptsPrecedenceStr: 'Argument "options.precedence" must be a string',
  argPriorityStrEmpty: 'Argument "priorities" must be a non-empty string',
};


const DEFAULT_PRECEDENCE = 'and';


/**
 * @typedef CreatePrioritizeStrategyOptions
 *
 * @property {String} precedence
 *  Specifies which conjunctive is evaluated first in a Boolean expression.
 *  This value can be either "and" or "or."  The default is "and."
 */


/**
 * A cache of computed information used to prioritize statements in a Filter.
 */
class PrioritizeStrategy {

  constructor() {
    this.labels = new Map();
    this.order = new Map();
    this.precedence = DEFAULT_PRECEDENCE;
  }


  // This is some pretty ugly code, with a lot of validation rules.  It could
  // probably be broken up into multiple functions.  However, this could
  // potentially be called in a performance-sensitive code path.  Function
  // calls are expensive in JavaScript, so lets leave it a single function
  // for now.

  /**
   * Create an instance of PrioritizeStrategy.
   *
   * @param {Array} priorities
   *  An array of strings in JSON Pointer format.
   *
   * @param {CreatePrioritizeStrategyOptions} options
   *  Optional parameters for the prioritization strategy.
   *
   * @return {PrioritizeStrategy}
   */
  static create(priorities, options) {
    if (!Array.isArray(priorities))
      throw new TypeError(msg.argPrioritiesArray);

    const strategy = new PrioritizeStrategy();

    const opts = elv.coalesce(options, {});

    if (typeof opts !== 'object')
      throw new TypeError(msg.argPrioritiesOptionsObj);

    opts.precedence = elv.coalesce(opts.precedence, DEFAULT_PRECEDENCE);

    if (typeof opts.precedence !== 'string')
      throw new TypeError(msg.argOptsPrecedenceStr);
    else
      opts.precedence = opts.precedence.toLowerCase();

    if (opts.precedence !== 'and' && opts.precedence !== 'or')
      throw new TypeError(msg.argOptsPrecedence);

    strategy.precedence = opts.precedence;

    let count = 0;

    for (let i = 0; i < priorities.length; i++) {
      const priority = priorities[i];

      if (typeof priority !== 'string' || priority.length === 0)
        throw new TypeError(msg.argPriorityStrEmpty);

      if (!strategy.order.has(priority)) {
        strategy.order.set(priority, {
          order: count,
          labels: new Set(),
        });
        count++;
      }
    }

    return strategy;
  }

}


module.exports = PrioritizeStrategy;
