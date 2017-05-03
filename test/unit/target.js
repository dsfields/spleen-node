'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const Target = require('../../lib/target');
const Tokenizer = require('../../lib/tokenizer');


describe('Target', () => {

  describe('#jsonPointer', () => {
    it('should throw if pointer not string or instance of Tokenizer', () => {
      assert.throws(() => {
        Target.jsonPointer(42);
      }, errors.TypeError);
    });

    it('should throw if empty string', () => {
      assert.throws(() => {
        Target.jsonPointer('');
      }, TypeError);
    });

    it('should throw encountering non-target token when given string', () => {
      assert.throws(() => {
        Target.jsonPointer('/foo/bar and');
      }, errors.ParserError);
    });

    it('should return target portion of value with Tokenizer', () => {
      const tokenizer = new Tokenizer('/foo/bar and');
      const target = Target.jsonPointer(tokenizer);
      assert.lengthOf(target.path, 2);
      assert.strictEqual(target.path[0], 'foo');
      assert.strictEqual(target.path[1], 'bar');
    });

    it('should throw if invalid JSON pointer', () => {
      assert.throws(() => {
        Target.jsonPointer('foo/bar');
      }, errors.ParserError);
    });

    it('should end on unknown token with Tokenizer', () => {
      const tokenizer = new Tokenizer('asdf /foo/bar');
      const target = Target.jsonPointer(tokenizer);
      assert.lengthOf(target.path, 0);
    });

    it('should parse using an advanced Tokenizer', () => {
      const tokenizer = new Tokenizer('and /foo/bar');
      tokenizer.next();
      tokenizer.next();

      const target = Target.jsonPointer(tokenizer);
      assert.lengthOf(target.path, 2);
      assert.strictEqual(target.path[0], 'foo');
      assert.strictEqual(target.path[1], 'bar');
    });

    it('should set field to JSON pointer', () => {
      const field = '/foo/bar';
      const target = Target.jsonPointer(field);
      assert.strictEqual(target.field, field);
    });

    it('should set field to JSON pointer with Tokenizer', () => {
      const field = '/foo/bar';
      const tokenizer = new Tokenizer(field);
      const target = Target.jsonPointer(tokenizer);
      assert.strictEqual(target.field, field);
    });

    it('should set path to all target keys', () => {
      const field = '/foo/bar/42/baz/0xFF/qux';
      const target = Target.jsonPointer(field);
      assert.strictEqual(target.path[0], 'foo');
      assert.strictEqual(target.path[1], 'bar');
      assert.strictEqual(target.path[2], 42);
      assert.strictEqual(target.path[3], 'baz');
      assert.strictEqual(target.path[4], 0xFF);
      assert.strictEqual(target.path[5], 'qux');
    });

    it('should set path to all target keys with Tokenizer', () => {
      const field = '/foo/bar/42/baz/0xFF/qux';
      const tokenizer = new Tokenizer(field);
      const target = Target.jsonPointer(tokenizer);
      assert.strictEqual(target.path[0], 'foo');
      assert.strictEqual(target.path[1], 'bar');
      assert.strictEqual(target.path[2], 42);
      assert.strictEqual(target.path[3], 'baz');
      assert.strictEqual(target.path[4], 0xFF);
      assert.strictEqual(target.path[5], 'qux');
    });

    it('should end field when encountering numeric', () => {
      const field = '/foo/bar/42/baz/0xFF/qux';
      const target = Target.jsonPointer(field);
      assert.strictEqual(target.field, '/foo/bar');
    });

    it('should end field when encountering numeric with Tokenizer', () => {
      const field = '/foo/bar/42/baz/0xFF/qux';
      const tokenizer = new Tokenizer(field);
      const target = Target.jsonPointer(tokenizer);
      assert.strictEqual(target.field, '/foo/bar');
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

    it('should URL encode string portions of path', () => {
      const target = new Target(['?foo', 'bar&'], '/?foo/bar&');
      const result = target.toJsonPointer(true);
      assert.strictEqual(result, '/%3Ffoo/bar%26');
    });

    it('should stringify numerbers when URL encoding', () => {
      const target = new Target(['foo', 2], '/foo');
      const result = target.toJsonPointer(true);
      assert.strictEqual(result, '/foo/2');
    });
  });

});
