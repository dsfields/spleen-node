'use strict';

const Clause = require('./clause');
const errors = require('./errors');
const Filter = require('./filter');
const Parser = require('./parser');
const Like = require('./like');
const Range = require('./range');
const Target = require('./target');


const parse = function (value) {
  const parser = new Parser(value);
  return parser.parse();
};


/**
 * @module spleen
 *
 * @property {Clause} Clause
 * @property {spleen/errors} errors
 * @property {Filter} Filter
 * @property {Like} Like
 * @property {Range} Range
 * @property {Target} Target
 *
 * @method parse
 *  Parses a spleen expression.
 * @param {string} value
 */
module.exports = {
  Clause,
  errors,
  Filter,
  Like,
  parse,
  Range,
  Target,
};
