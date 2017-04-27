'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const JsonPointerParser = require('../../lib/json-pointer-parser');
const Tokenizer = require('../../lib/tokenizer');


describe('JsonPointerParser', () => {

  describe('#parse', () => {
    it('should throw encountering non-target token type in strict', () => {
      assert.throws(() => {
        const parser = new JsonPointerParser('/foo/bar and');
        parser.parse(true);
      }, errors.ParserError);
    });

    it('should throw if invalid JSON pointer', () => {
      assert.throws(() => {
        const parser = new JsonPointerParser('foo/bar');
        parser.parse(true);
      }, errors.ParserError);
    });

    it('should bail encountering non-target token type in non-strict', () => {
      const parser = new JsonPointerParser('/foo/bar and');
      const result = parser.parse();

      assert.lengthOf(result.path, 2);
    });

    it('should parse using an advanced Tokenizer', () => {
      const tokenizer = new Tokenizer('and /foo/bar');
      tokenizer.next();
      tokenizer.next();

      const parser = new JsonPointerParser(tokenizer);
      const result = parser.parse();
      assert.lengthOf(result.path, 2);
    });

    it('should set field to JSON pointer', () => {
      const field = '/foo/bar';
      const parser = new JsonPointerParser(field);
      const result = parser.parse();
      assert.strictEqual(result.field, field);
    });

    it('should set path to all target keys', () => {
      const field = '/foo/bar/42/baz/0xFF/qux';
      const parser = new JsonPointerParser(field);
      const result = parser.parse();
      assert.strictEqual(result.path[0], 'foo');
      assert.strictEqual(result.path[1], 'bar');
      assert.strictEqual(result.path[2], 42);
      assert.strictEqual(result.path[3], 'baz');
      assert.strictEqual(result.path[4], 0xFF);
      assert.strictEqual(result.path[5], 'qux');
    });

    it('should terminate field name when encountering numeric', () => {
      const field = '/foo/bar/42/baz/0xFF/qux';
      const parser = new JsonPointerParser(field);
      const result = parser.parse();
      assert.strictEqual(result.field, '/foo/bar');
    });

    it('should result in root pointer if empty', () => {
      const parser = new JsonPointerParser('');
      const result = parser.parse();
      assert.strictEqual(result.field, '/');
    });
  });

});
