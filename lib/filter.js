'use strict';

const Clause = require('./clause');
const Target = require('./target');


const msg = {
  argFilter: 'Argument "filter" must be an instance of Filter',
  argClause: 'Argument "clause" must be an instance of Clause',
  argClauseInvalid: 'Argument "clause" must be in a valid state',
  argStatement: 'Argument "filter must be instance of Filter or Clause',
  unknownOp: 'Unknown operator encountered',
};


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


  static where(clause) {
    if (!(clause instanceof Clause)) throw new TypeError(msg.argClause);
    const filter = new Filter();
    filter._clause(clause, '');
    return filter;
  }


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


  and(statement) {
    this._statement(statement, 'and');
    return this;
  }


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


  andGroup(filter) {
    this._group(filter, 'and');
    return this;
  }


  orGroup(filter) {
    this._group(filter, 'or');
    return this;
  }


  //
  // MATCH
  //


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

}


module.exports = Filter;
