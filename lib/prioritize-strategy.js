'use strict';

const elv = require('elv');


/* eslint-disable max-len */
const msg = {
  argPrioritiesArray: 'Argument "priorities" must be an array',
  argPrioritiesOptionsObj: 'Argument "options" must be an object',
  argOptsPrecedence: 'Argument "options.precedence" must be "and" or "or"',
  argOptsPrecedenceStr: 'Argument "options.precedence" must be a string',
  argOptsMatchBool: 'Argument "options.matchAllLabels" must be a Boolean',
  argPrioritiesEntry: 'Argument "priorities" must contain strings or objects',
  argPriorityStrEmpty: 'Argument "priorities" cannot contain empty strings',
  argPrioritiesNull: 'Argument "priorities" items cannot be null',
  argPrioritiesTarget: 'Argument "priorities" object entries must contain a target of type string',
  argPrioritiesTargetStrEmpty: 'Argument "priorities" objects\' target key cannot be an empty string',
  argPrioritiesLabel: 'Argument "priorities" object entry label keys must be of type string',
};
/* eslint-enable max-len */


const DEFAULT_PRECEDENCE = 'and';
const DEFAULT_MATCH_ALL_LABELS = false;


/**
 * @typedef CreatePrioritizeStrategyOptions
 *
 * @property {String} precedence
 *  Specifies which conjunctive is evaluated first in a Boolean expression.
 *  This value can be either "and" or "or."  The default is "and."
 *
 * @property {Boolean} matchAllLabels
 *  Wheother or not all targets must be present in order for a label to be
 *  returned as matched.
 */


/**
 * A cache of computed information used to prioritize statements in a Filter.
 */
class PrioritizeStrategy {

  constructor() {
    this.labels = new Map();
    this.order = new Map();
    this.precedence = DEFAULT_PRECEDENCE;
    this.matchAllLabels = DEFAULT_MATCH_ALL_LABELS;
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
    opts.matchAllLabels = elv.coalesce(
      opts.matchAllLabels,
      DEFAULT_MATCH_ALL_LABELS
    );

    if (typeof opts.precedence !== 'string')
      throw new TypeError(msg.argOptsPrecedenceStr);
    else
      opts.precedence = opts.precedence.toLowerCase();

    if (opts.precedence !== 'and' && opts.precedence !== 'or')
      throw new TypeError(msg.argOptsPrecedence);

    strategy.precedence = opts.precedence;

    if (typeof opts.matchAllLabels !== 'boolean')
      throw new TypeError(msg.argOptsMatchBool);

    strategy.matchAllLabels = opts.matchAllLabels;

    for (let i = 0; i < priorities.length; i++) {
      const priority = priorities[i];

      if (typeof priority === 'string') {
        if (priority.length === 0)
          throw new TypeError(msg.argPriorityStrEmpty);

        if (!strategy.order.has(priority)) {
          strategy.order.set(priority, {
            order: i,
            labels: new Set(),
          });
        }
        continue;
      }

      if (typeof priority === 'object') {
        if (priority === null)
          throw new TypeError(msg.argPrioritiesNull);

        if (typeof priority.target !== 'string')
          throw new TypeError(msg.argPrioritiesTarget);

        if (priority.target.length === 0)
          throw new TypeError(msg.argPrioritiesTargetStrEmpty);

        if (!strategy.order.has(priority.target))
          strategy.order.set(priority.target, { order: i, labels: [] });

        if (elv(priority.label)) {
          if (typeof priority.label !== 'string')
            throw new TypeError(msg.argPrioritiesLabel);

          if (!strategy.labels.has(priority.label)) {
            strategy.labels.set(priority.label, {
              count: 0,
              targets: new Set(),
            });
          }

          strategy.order.get(priority.target).labels.push(priority.label);

          const labelTracker = strategy.labels.get(priority.label);
          const currentLength = labelTracker.targets.size;

          if (labelTracker.targets.add(priority.target).size > currentLength)
            labelTracker.count++;
        }

        continue;
      }

      throw new TypeError(msg.argPrioritiesEntry);
    }

    return strategy;
  }

}


module.exports = PrioritizeStrategy;
