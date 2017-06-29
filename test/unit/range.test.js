'use strict';

const assert = require('chai').assert;

const Range = require('../../lib/range');


describe('Range', () => {

  describe('#constructor', () => {
    it('should throw if lower is not string, number, or null', () => {
      assert.throws(() => {
        const range = new Range(false, 42);
        assert.isNotOk(range);
      }, TypeError);
    });

    it('should throw if upper is not string, number, or null', () => {
      assert.throws(() => {
        const range = Range(24, {});
        assert.isNotOk(range);
      }, TypeError);
    });

    it('should accept number for lower and upper', () => {
      assert.doesNotThrow(() => {
        const range = new Range(3.14, 42);
        assert.isOk(range);
      }, TypeError);
    });

    it('should accept string for lower and upper', () => {
      assert.doesNotThrow(() => {
        const range = new Range('bar', 'foo');
        assert.isOk(range);
      }, TypeError);
    });

    it('should accept null for lower and upper', () => {
      assert.doesNotThrow(() => {
        const range = new Range(null, null);
        assert.isOk(range);
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


  describe('#between', () => {
    it('should throw if value not string, number, or null', () => {
      assert.throws(() => {
        const range = new Range(24, 42);
        range.between({});
      });
    });

    it('should accept number', () => {
      assert.doesNotThrow(() => {
        const range = new Range(24, 42);
        range.between(33);
      }, TypeError);
    });

    it('should accept string', () => {
      assert.doesNotThrow(() => {
        const range = new Range(24, 42);
        range.between('foo');
      }, TypeError);
    });

    it('should accept null', () => {
      assert.doesNotThrow(() => {
        const range = new Range(24, 42);
        range.between(null);
      }, TypeError);
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

    it('should be false if null not between strings', () => {
      const range = new Range('b', 'y');
      const result = range.between(null);
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

    it('should be false if null not between numerics', () => {
      const range = new Range(24, 42);
      const result = range.between(null);
      assert.isFalse(result);
    });

    it('should be true if numeric between null and numeric', () => {
      const range = new Range(null, 42);
      const result = range.between(10);
      assert.isTrue(result);
    });

    it('should be true if null between null and numeric', () => {
      const range = new Range(null, 42);
      const result = range.between(null);
      assert.isTrue(result);
    });

    it('should be false if string compared to null', () => {
      const range = new Range(null, 'z');
      const result = range.between('a');
      assert.isFalse(result);
    });

    it('should be true if null compared to string', () => {
      const range = new Range(null, 'z');
      const result = range.between(null);
      assert.isFalse(result);
    });

    it('should be false if numeric not between null and numeric', () => {
      const range = new Range(null, 42);
      const result = range.between(100);
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

    it('should return stringified when number and string', () => {
      const range = new Range(24, 'foo');
      const str = range.toString();
      assert.strictEqual(str, '24,"foo"');
    });

    it('should return stringified strings when URL encoding', () => {
      const range = new Range('bar&', '?foo');
      const str = range.toString(true);
      assert.strictEqual(str, '"%3Ffoo","bar%26"');
    });

    it('should return stringified when URL encoding number and string', () => {
      const range = new Range(24, '?foo');
      const str = range.toString(true);
      assert.strictEqual(str, '24,"%3Ffoo"');
    });

    it('should return stringified when nulls', () => {
      const range = new Range(null, null);
      const str = range.toString();
      assert.strictEqual(str, 'nil,nil');
    });

    it('should return stringified when URL encoding with nulls', () => {
      const range = new Range(null, null);
      const str = range.toString(true);
      assert.strictEqual(str, 'nil,nil');
    });

    it('should return stringified when null and string', () => {
      const range = new Range(null, '?foo');
      const str = range.toString();
      assert.strictEqual(str, 'nil,"?foo"');
    });

    it('should return stringified when URL encoding null and string', () => {
      const range = new Range(null, '?foo');
      const str = range.toString(true);
      assert.strictEqual(str, 'nil,"%3Ffoo"');
    });

    it('should return stringified when null and number', () => {
      const range = new Range(null, 42);
      const str = range.toString(true);
      assert.strictEqual(str, 'nil,42');
    });

    it('should return stringified when URL encoding null and number', () => {
      const range = new Range(null, 42);
      const str = range.toString(true);
      assert.strictEqual(str, 'nil,42');
    });
  });
});
