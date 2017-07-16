'use strict';

const elv = require('elv');

const Clause = require('./clause');
const PrioritizeStrategy = require('./prioritize-strategy');
const Target = require('./target');


const msg = {
  argFilter: 'Argument "filter" must be an instance of Filter',
  argClause: 'Argument "clause" must be an instance of Clause',
  argClauseInvalid: 'Argument "clause" must be in a valid state',
  argStatement: 'Argument "filter" must be instance of Filter or Clause',
  argPsArgs: 'Only one argument allowed when providing PrioritizeStrategy',
  unknownOp: 'Unknown operator encountered',
};


/**
 * Represents a filter expression.
 */
class Filter {

  constructor() {
    this.fields = [];
    this._fields = new Set();
    this.statements = [];
    this.root = null;
  }


  //
  // FACTORIES
  //


  /**
   * Factory method for creating a Filter instance starting with a Clause.
   *
   * @param {Clause} clause
   */
  static where(clause) {
    if (!(clause instanceof Clause)) throw new TypeError(msg.argClause);
    const filter = new Filter();
    filter._clause(clause, '');
    return filter;
  }


  /**
   * Factory method for creating a Filter instance starting with a Filter as a
   * parenthetical group.
   *
   * @param {Filter} filter
   */
  static group(filter) {
    const root = new Filter();
    root._group(filter, '');
    return root;
  }


  //
  // CLAUSES
  //


  _appendField(target) {
    if (this._fields.has(target.field)) return;
    this.fields.push(target.field);
    this._fields.add(target.field);
  }


  _clause(clause, conjunctive) {
    if (!clause.isValid())
      throw new TypeError(msg.argClauseInvalid);

    if (clause.subject instanceof Target)
      this._appendField(clause.subject);

    if (clause.object instanceof Target)
      this._appendField(clause.object);

    const node = {
      value: clause,
      conjunctive,
    };

    this.statements.push(node);
  }


  _join(filter, conjunctive) {
    for (let i = 0; i < filter.statements.length; i++) {
      const statement = filter.statements[i];
      const conj = (i === 0) ? conjunctive : statement.conjunctive;

      if (statement.value instanceof Filter)
        this._group(statement.value, conj);
      else
        this._clause(statement.value, conj);
    }
  }


  _statement(statement, conjunctive) {
    if (statement instanceof Filter)
      this._join(statement, conjunctive);
    else if (!(statement instanceof Clause))
      throw new TypeError(msg.argStatement);
    else
      this._clause(statement, conjunctive);
  }


  /**
   * Append a Clause to the Filter using an "and" conjunction.
   *
   * @param {Clause} statement
   */
  and(statement) {
    this._statement(statement, 'and');
    return this;
  }


  /**
   * Append a Clause to the Filter using an "or" conjunction.
   *
   * @param {Clause} statement
   */
  or(statement) {
    this._statement(statement, 'or');
    return this;
  }


  //
  // GROUPS
  //


  static _assertFilter(filter) {
    if (!(filter instanceof Filter))
      throw new TypeError(msg.argFilter);
  }


  _group(filter, conjunctive) {
    Filter._assertFilter(filter);

    const node = {
      value: filter,
      conjunctive,
    };

    for (let i = 0; i < filter.fields.length; i++) {
      const field = filter.fields[i];
      if (this._fields.has(field)) continue;
      this.fields.push(field);
      this._fields.add(field);
    }

    this.statements.push(node);
    filter.root = (this.root === null) ? this : this.root;
  }


  /**
   * Append a Filter as a parenthetical group to the Filter using an "and"
   * conjunction.
   *
   * @param {Filter} filter
   */
  andGroup(filter) {
    this._group(filter, 'and');
    return this;
  }


  /**
   * Append a Filter as a parenthetical group to the Filter using an "or"
   * conjunction.
   *
   * @param {Filter} filter
   */
  orGroup(filter) {
    this._group(filter, 'or');
    return this;
  }


  //
  // MATCH
  //


  /**
   * Determines if the Filter matches the given value.
   *
   * @param {*} src
   */
  match(src) {
    let result = true;

    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];
      const isMatch = statement.value.match(src);

      switch (statement.conjunctive) {
        case 'and':
          result = result && isMatch;
          break;

        case 'or':
          if (result) return true;
          result = isMatch;
          break;

        default:
          result = isMatch;
          break;
      }
    }

    return result;
  }


  //
  // STRINGIFICATION
  //


  /**
   * Converts the Filter to a spleen expression as a string.
   *
   * @param {Boolean} urlEncode
   */
  toString(urlEncode) {
    const space = (urlEncode) ? '%20' : ' ';
    let str = '';

    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];

      if (i > 0) str += `${space}${statement.conjunctive}${space}`;

      if (statement.value instanceof Filter) {
        str += `(${statement.value.toString(urlEncode)})`;
        continue;
      }

      str += statement.value.toString(urlEncode);
    }

    return str;
  }


  //
  // PRIORITIZATION
  //


  /**
   * Creates a shallow copy of the Filter, and reorders all statements to align
   * with a given list of field targets that is ordered by priority.
   *
   * @param {Array|PrioritizeStrategy} priorities
   * @param {Object} options
  */
  prioritize(priorities, options) {
    let strategy;

    if (priorities instanceof PrioritizeStrategy) {
      if (arguments.length > 1) throw new TypeError(msg.argPsArgs);
      strategy = priorities;
    } else {
      strategy = PrioritizeStrategy.create(priorities, options);
    }

    const result = Filter._prioritize(this, strategy, null);

    return {
      filter: result.filter,
    };
  }


  static _prioritize(oldFilter, strategy, root) {
    const filter = new Filter();
    filter.fields = oldFilter.fields;
    filter._fields = oldFilter._fields;
    filter.statements = [];
    filter.root = root;

    const statements = [];
    const priorities = [];
    let group = [];
    let groupPriorities = [];
    let groupHighest = -1;
    let highest = -1;

    for (let i = 0; i < oldFilter.statements.length; i++) {
      let statement = oldFilter.statements[i];
      let priority = -1;

      if (i === 1 && group.length > 0)
        group[0].conjunctive = statement.conjunctive;

      if (statement.conjunctive.length > 0
          && statement.conjunctive !== strategy.precedence
          && group.length > 0
      ) {
        Filter._addToPriorityGroup(
          statements,
          priorities,
          group,
          groupHighest
        );

        group = [];
        groupPriorities = [];
        groupHighest = -1;
      }

      if (statement.value instanceof Filter) {
        const result = Filter._prioritize(
          statement.value,
          strategy,
          elv.coalesce(root, filter)
        );
        priority = result.highest;
        statement = {
          value: result.filter,
          conjunctive: statement.conjunctive,
        };
      } else {
        const val = statement.value;
        const a = Filter._getTermPriority(val.subject, strategy);
        const b = Filter._getTermPriority(val.object, strategy);

        if (a === -1) {
          priority = b;
        } else if (b === -1) {
          priority = a;
        } else {
          priority = Math.min(a, b);
        }

        statement = {
          value: val,
          conjunctive: strategy.precedence,
        };
      }

      if (priority > -1) {
        groupHighest = (groupHighest === -1)
          ? priority
          : Math.min(groupHighest, priority);

        highest = (highest === -1)
          ? priority
          : Math.min(highest, priority);
      }

      Filter._addToPriorityGroup(
        group,
        groupPriorities,
        statement,
        priority
      );
    }

    Filter._addToPriorityGroup(
      statements,
      priorities,
      group,
      groupHighest
    );

    const secondary = (strategy.precedence === 'and') ? 'or' : 'and';

    for (let i = 0; i < statements.length; i++) {
      const stat = statements[i];
      stat[0].conjunctive = secondary;
      filter.statements = filter.statements.concat(stat);
    }

    filter.statements[0].conjunctive = '';

    return { filter, highest, labels: [] };
  }


  static _getTermPriority(term, strategy) {
    let priority = -1;

    if (term instanceof Target) {
      const order = strategy.order.get(term.field);
      if (elv(order)) priority = order.order;
    }

    return priority;
  }


  static _addToPriorityGroup(group, priorities, value, priority) {
    if (priority === -1) {
      Filter._appendToPriorityGroup(group, priorities, value, priority);
      return;
    }

    for (let i = 0; i < group.length; i++) {
      const itemP = priorities[i];
      if (itemP !== -1 && priority >= itemP) continue;
      group.splice(i, 0, value);
      priorities.splice(i, 0, priority);
      return;
    }

    Filter._appendToPriorityGroup(group, priorities, value, priority);
  }


  static _appendToPriorityGroup(group, priorities, value, priority) {
    group.push(value);
    priorities.push(priority);
  }

}


module.exports = Filter;
