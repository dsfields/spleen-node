'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const Range = require('../../lib/range');


describe('RangeParser', () => {

  describe('#constructor', () => {
    it('should throw if lower is not string or number', () => {
      assert.throws(() => {
        const range = new Range(false, 42);
        assert.isNotOk(range);
      }, TypeError);
    });

    it('should throw if upper is not string or number', () => {
      assert.throws(() => {
        const range = Range(24, {});
        assert.isNotOk(range);
      }, TypeError);
    });

    it('should set lower and upper', () => {
      const range = new Range(24, 'bar');
      assert.strictEqual(range.lower, 24);
      assert.strictEqual(range.upper, 'bar');
    });

    it('should set lower to upper if upper is less than lower', () => {
      const range = new Range(42, 24);
      assert.strictEqual(range.lower, 24);
      assert.strictEqual(range.upper, 42);
    });
  });


  describe('#parse', () => {
    it('should throw if invalid range', () => {
      assert.throws(() => {
        Range.parse('asdf');
      }, errors.ParserError);
    });

    it('should set lower and upper', () => {
      const range = Range.parse('24,42');
      assert.strictEqual(range.lower, 24);
      assert.strictEqual(range.upper, 42);
    });

    it('should set lower to upper if upper is less than lower', () => {
      const range = Range.parse('24,42');
      assert.strictEqual(range.lower, 24);
      assert.strictEqual(range.upper, 42);
    });
  });


  describe('#between', () => {
    it('should throw if value not string or number', () => {
      assert.throws(() => {
        const range = new Range(24, 42);
        range.between({});
      });
    });

    it('should be true if string between', () => {
      const range = new Range('b', 'y');
      const result = range.between('m');
      assert.isTrue(result);
    });

    it('should be true if string equals lower', () => {
      const range = new Range('b', 'y');
      const result = range.between('b');
      assert.isTrue(result);
    });

    it('should be true if string equals upper', () => {
      const range = new Range('b', 'y');
      const result = range.between('y');
      assert.isTrue(result);
    });

    it('should be false if string less than lower', () => {
      const range = new Range('b', 'y');
      const result = range.between('a');
      assert.isFalse(result);
    });

    it('should be false if string greater than upper', () => {
      const range = new Range('b', 'y');
      const result = range.between('z');
      assert.isFalse(result);
    });

    it('should be true if number between', () => {
      const range = new Range(24, 42);
      const result = range.between(33);
      assert.isTrue(result);
    });

    it('should be true if number equals lower', () => {
      const range = new Range(24, 42);
      const result = range.between(24);
      assert.isTrue(result);
    });

    it('should be true if number equals upper', () => {
      const range = new Range(24, 42);
      const result = range.between(42);
      assert.isTrue(result);
    });

    it('should be false if number less than lower', () => {
      const range = new Range(24, 42);
      const result = range.between(23);
      assert.isFalse(result);
    });

    it('should be false if number greater than upper', () => {
      const range = new Range(24, 42);
      const result = range.between(100);
      assert.isFalse(result);
    });

    it('should be false if value not defined', () => {
      const range = new Range(24, 42);
      const result = range.between(null);
      assert.isFalse(result);
    });
  });

  describe('#toString', () => {
    it('should return stringified when numbers', () => {
      const range = new Range(24, 42);
      const str = range.toString();
      assert.strictEqual(str, '24,42');
    });

    it('should return stringified when strings', () => {
      const range = new Range('bar', 'foo');
      const str = range.toString();
      assert.strictEqual(str, '"bar","foo"');
    });

    it('should return stringified when mixed', () => {
      const range = new Range(24, 'foo');
      const str = range.toString();
      assert.strictEqual(str, '24,"foo"');
    });

    it('should return stringified strings when URL encoding', () => {
      const range = new Range('bar&', '?foo');
      const str = range.toString(true);
      assert.strictEqual(str, '"%3Ffoo","bar%26"');
    });

    it('should return stringified string when URL encoding mixed', () => {
      const range = new Range(24, '?foo');
      const str = range.toString(true);
      assert.strictEqual(str, '24,"%3Ffoo"');
    });
  });
});
