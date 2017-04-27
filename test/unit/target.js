'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const Target = require('../../lib/target');


describe('Target', () => {

  describe('#jsonPointer', () => {
    it('should throw if JSON pointer invalid', () => {
      assert.throws(() => {
        Target.jsonPointer('foo/bar/baz');
      }, errors.ParserError);
    });

    it('should parse JSON pointer to Target', () => {
      const result = Target.jsonPointer('/foo/bar/baz');
      assert.instanceOf(result, Target);
    });
  });


  describe('#get', () => {
    it('should return undefined if from null', () => {
      const target = Target.jsonPointer('/foo/bar/baz');
      const result = target.get(null);
      assert.isUndefined(result);
    });

    it('should return undefined if from undefined', () => {
      const target = Target.jsonPointer('/foo/bar/baz');
      const result = target.get(undefined);
      assert.isUndefined(result);
    });

    it('should return undefined if key does not exist', () => {
      const target = Target.jsonPointer('/foo/bar/baz');
      const result = target.get({
        foo: {
          bar: {
            qux: 42,
          },
        },
      });
      assert.isUndefined(result);
    });

    it('should return undefined if value does not exist in array', () => {
      const target = Target.jsonPointer('/foo/bar/27/baz');
      const result = target.get({
        foo: {
          bar: [
            {
              baz: 42,
            },
          ],
        },
      });
      assert.isUndefined(result);
    });

    it('should return found value for key', () => {
      const target = Target.jsonPointer('/foo/bar/baz');
      const result = target.get({
        foo: {
          bar: {
            baz: 42,
          },
        },
        blah: {
          blorg: 'nope',
        },
      });
      assert.strictEqual(result, 42);
    });

    it('should return found value in array', () => {
      const target = Target.jsonPointer('/foo/bar/baz/2');
      const result = target.get({
        foo: {
          bar: {
            baz: [1, 2, 42, 7, 9],
          },
        },
        blah: {
          blorg: 'nope',
        },
      });
      assert.strictEqual(result, 42);
    });
  });


  describe('#toJsonPointer', () => {
    it('should return full path', () => {
      const target = new Target(['foo', 'bar', 'baz', 2], '/foo/bar/baz');
      const result = target.toJsonPointer();
      assert.strictEqual(result, '/foo/bar/baz/2');
    });
  });

});
