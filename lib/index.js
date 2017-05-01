'use strict';

const Clause = require('./clause');
const errors = require('./errors');
const Filter = require('./filter');
const InfixParser = require('./infix-parser');
const Like = require('./like');
const Range = require('./range');
const Target = require('./target');


const parse = function (value) {
  const parser = new InfixParser(value);
  return parser.parse();
};


module.exports = {
  Clause,
  errors,
  Filter,
  Like,
  parse,
  Range,
  Target,
};
