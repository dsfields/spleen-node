'use strict';

const elv = require('elv');


const msg = {
  parser: 'Invalid token encountered',
  match: 'Unknown operator encountered while performing match',
  msgStr: 'Argument "msg" must be a string',
};


const coalesce = (length, defaultMsg, message, data) => {
  const result = {
    message: defaultMsg,
    data,
  };

  if (length === 0) return result;

  if (length === 1) {
    if (typeof message === 'string') result.message = message;
    else result.data = message;
    return result;
  }

  if (elv(message) && typeof message !== 'string')
    throw new TypeError(msg.msgStr);

  result.message = elv.coalesce(message, defaultMsg);
  result.data = data;

  return result;
};


/**
 * @class
 * Thrown when an error is encountered during parsing.
 *
 * @extends Error
 * @private
 *
 * @param {*} message
 * @param {*} data
 */
function ParserError(message, data) {
  Error.captureStackTrace(this, ParserError);
  const result = coalesce(arguments.length, msg.parser, message, data);
  this.message = result.message;
  this.data = result.data;
  this.name = 'ParserError';
}
ParserError.defaultMessage = msg.parser;
ParserError.prototype = Object.create(Error.prototype);
ParserError.prototype.constructor = ParserError;


/**
 * @class
 * Thrown when an invalid Filter is used during matching.
 *
 * @extends Error
 * @private
 *
 * @param {*} message
 * @param {*} data
 */
function MatchError(message, data) {
  Error.captureStackTrace(this, MatchError);
  const result = coalesce(arguments.length, msg.match, message, data);
  this.message = result.message;
  this.data = result.data;
  this.name = 'MatchError';
}
MatchError.defaultMessage = msg.match;
MatchError.prototype = Object.create(Error.prototype);
MatchError.prototype.constructor = MatchError;


/**
 * @module spleen/errors
 */
module.exports = {
  MatchError,
  ParserError,
};
