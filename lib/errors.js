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


function SError(defaultMessage, name, argLength, message, data) {
  const result = coalesce(argLength, defaultMessage, message, data);
  this.message = result.message;
  this.data = result.data;
  this.name = name;
}
SError.prototype = Object.create(Error.prototype);
SError.prototype.constructor = SError;


/**
 * @class
 * Thrown when an error is encountered during parsing.
 *
 * @extends Error
 * @private
 *
 * @param {String} message
 * @param {Object} data
 */
function ParserError(message, data) {
  Error.captureStackTrace(this, ParserError);
  SError.call(this, msg.parser, 'ParserError', arguments.length, message, data);
}
ParserError.defaultMessage = msg.parser;
ParserError.prototype = Object.create(SError.prototype);
ParserError.prototype.constructor = ParserError;


/**
 * @class
 * Thrown when an invalid Filter is used during matching.
 *
 * @extends Error
 * @private
 *
 * @param {String} message
 * @param {Object} data
 */
function MatchError(message, data) {
  Error.captureStackTrace(this, MatchError);
  SError.call(this, msg.match, 'MatchError', arguments.length, message, data);
}
MatchError.defaultMessage = msg.match;
MatchError.prototype = Object.create(SError.prototype);
MatchError.prototype.constructor = MatchError;


/**
 * @module spleen/errors
 */
module.exports = {
  MatchError,
  ParserError,
};
