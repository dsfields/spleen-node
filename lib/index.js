'use strict';

const Clause = require('./clause');
const errors = require('./errors');
const Filter = require('./filter');
const Parser = require('./parser');
const Like = require('./like');
const PrioritizeStrategy = require('./prioritize-strategy');
const Range = require('./range');
const Target = require('./target');


const parse = function (value) {
  const parser = new Parser(value);
  return parser.parse();
};


/**
 * @typedef {object} ParseResult
 *
 * @property {ParseError} error
 * @property {Filter} filter
 * @property {Boolean} success
 */


/**
 * @module spleen
 *
 * @property {Clause} Clause
 * @property {spleen/errors} errors
 * @property {Filter} Filter
 * @property {Like} Like
 * @property {PrioritizeStrategy} PrioritizeStrategy
 * @property {Range} Range
 * @property {Target} Target
 *
 * @method parse
 *  Parses a spleen expression.
 * @param {String} value
 * @return {ParseResult}
 */
module.exports = {
  Clause,
  errors,
  Filter,
  Like,
  parse,
  PrioritizeStrategy,
  Range,
  Target,
};
