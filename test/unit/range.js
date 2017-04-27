'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const Range = require('../../lib/range');


describe('RangeParser', () => {

  describe('#constructor', () => {
    it('should set lower to upper if upper is less than lower', () => {
      const range = new Range(42, 24);
      assert.strictEqual(range.lower, 24);
      assert.strictEqual(range.upper, 42);
    });
  });


  describe('#from', () => {
    it('should throw if lower is not string or number', () => {
      assert.throws(() => {
        Range.from(false, 42);
      }, TypeError);
    });

    it('should throw if upper is not string or number', () => {
      assert.throws(() => {
        Range.from(24, {});
      }, TypeError);
    });

    it('should set lower and upper', () => {
      const range = Range.from(24, 'bar');
      assert.strictEqual(range.lower, 24);
      assert.strictEqual(range.upper, 'bar');
    });

    it('should set lower to upper if upper is less than lower', () => {
      const range = Range.from(42, 24);
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
        const range = Range.from(24, 42);
        range.between({});
      });
    });

    it('should be true if string between', () => {
      const range = Range.from('b', 'y');
      const result = range.between('m');
      assert.isTrue(result);
    });

    it('should be true if string equals lower', () => {
      const range = Range.from('b', 'y');
      const result = range.between('b');
      assert.isTrue(result);
    });

    it('should be true if string equals upper', () => {
      const range = Range.from('b', 'y');
      const result = range.between('y');
      assert.isTrue(result);
    });

    it('should be false if string less than lower', () => {
      const range = Range.from('b', 'y');
      const result = range.between('a');
      assert.isFalse(result);
    });

    it('should be false if string greater than upper', () => {
      const range = Range.from('b', 'y');
      const result = range.between('z');
      assert.isFalse(result);
    });

    it('should be true if number between', () => {
      const range = Range.from(24, 42);
      const result = range.between(33);
      assert.isTrue(result);
    });

    it('should be true if number equals lower', () => {
      const range = Range.from(24, 42);
      const result = range.between(24);
      assert.isTrue(result);
    });

    it('should be true if number equals upper', () => {
      const range = Range.from(24, 42);
      const result = range.between(42);
      assert.isTrue(result);
    });

    it('should be false if number less than lower', () => {
      const range = Range.from(24, 42);
      const result = range.between(23);
      assert.isFalse(result);
    });

    it('should be false if number greater than upper', () => {
      const range = Range.from(24, 42);
      const result = range.between(100);
      assert.isFalse(result);
    });
  });

});
