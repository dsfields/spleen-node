'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');


describe('MatchError', () => {

  describe('#constructor', () => {
    it('should set message to 1st arg if is string', () => {
      const e = new errors.MatchError('a');
      assert.strictEqual(e.message, 'a');
    });

    it('should set message to default if 1st arg is not string', () => {
      const e = new errors.MatchError(42);
      assert.strictEqual(e.message, errors.MatchError.defaultMessage);
    });

    it('should set data to 1st arg if not string', () => {
      const e = new errors.MatchError(42);
      assert.strictEqual(e.data, 42);
    });

    it('should throw if 2 args, and 1st is not string', () => {
      assert.throws(() => {
        const e = new errors.MatchError(21, 12);
        assert.isNotOk(e);
      }, TypeError);
    });

    it('should set message to 1st arg if 2 args', () => {
      const e = new errors.MatchError('a', 42);
      assert.strictEqual(e.message, 'a');
    });

    it('should set data to 2nd arg if 2 args', () => {
      const e = new errors.MatchError('a', 42);
      assert.strictEqual(e.data, 42);
    });

    it('should set message to defualt if undefined and 2 args', () => {
      const e = new errors.MatchError(undefined, 42);
      assert.strictEqual(e.message, errors.MatchError.defaultMessage);
    });

    it('should be instanceof Error', () => {
      const e = new errors.MatchError();
      assert.instanceOf(e, Error);
    });

    it('should set name', () => {
      const e = new errors.MatchError();
      assert.strictEqual(e.name, 'MatchError');
    });
  });

});


describe('ParserError', () => {

  describe('#constructor', () => {
    it('should set message to 1st arg if is string', () => {
      const e = new errors.ParserError('a');
      assert.strictEqual(e.message, 'a');
    });

    it('should set message to default if 1st arg is not string', () => {
      const e = new errors.ParserError(42);
      assert.strictEqual(e.message, errors.ParserError.defaultMessage);
    });

    it('should set data to 1st arg if not string', () => {
      const e = new errors.ParserError(42);
      assert.strictEqual(e.data, 42);
    });

    it('should throw if 2 args, and 1st is not string', () => {
      assert.throws(() => {
        const e = new errors.ParserError(21, 12);
        assert.isNotOk(e);
      }, TypeError);
    });

    it('should set message to 1st arg if 2 args', () => {
      const e = new errors.ParserError('a', 42);
      assert.strictEqual(e.message, 'a');
    });

    it('should set data to 2nd arg if 2 args', () => {
      const e = new errors.ParserError('a', 42);
      assert.strictEqual(e.data, 42);
    });

    it('should set message to defualt if undefined and 2 args', () => {
      const e = new errors.ParserError(undefined, 42);
      assert.strictEqual(e.message, errors.ParserError.defaultMessage);
    });

    it('should be instanceof Error', () => {
      const e = new errors.ParserError();
      assert.instanceOf(e, Error);
    });

    it('should set name', () => {
      const e = new errors.ParserError();
      assert.strictEqual(e.name, 'ParserError');
    });
  });

});
