'use strict';

const assert = require('chai').assert;

const Literal = require('../../lib/literal');


describe('Literal', () => {

  describe('#toString', () => {
    it('should return value if string', () => {
      const literal = new Literal(0, 'foo');
      const result = literal.toString();
      assert.strictEqual(result, '"foo"');
    });

    it('should return URL encoded value if string', () => {
      const literal = new Literal(0, ' foo=');
      const result = literal.toString(true);
      assert.strictEqual(result, '"%20foo%3D"');
    });

    it('should return stringified numeric', () => {
      const literal = new Literal(0, 42);
      const result = literal.toString();
      assert.strictEqual(result, '42');
    });

    it('should return stringified Boolean', () => {
      const literal = new Literal(0, true);
      const result = literal.toString();
      assert.strictEqual(result, 'true');
    });

    it('should return empty string for undefined', () => {
      const literal = new Literal(0, undefined);
      const result = literal.toString();
      assert.strictEqual(result, '');
    });

    it('should return null for null', () => {
      const literal = new Literal(0, null);
      const result = literal.toString();
      assert.strictEqual(result, 'null');
    });

    it('should return array values of string', () => {
      const literal = new Literal(0, ['foo', 'bar']);
      const result = literal.toString();
      assert.strictEqual(result, '["foo","bar"]');
    });

    it('should return array of URL encoded string values', () => {
      const literal = new Literal(0, [' foo=', 'bar?&']);
      const result = literal.toString(true);
      assert.strictEqual(result, '["%20foo%3D","bar%3F%26"]');
    });

    it('should return array of stringified numeric values', () => {
      const literal = new Literal(0, [42, 3.14]);
      const result = literal.toString();
      assert.strictEqual(result, '[42,3.14]');
    });

    it('should return array of stringified Boolean values', () => {
      const literal = new Literal(0, [false, true]);
      const result = literal.toString();
      assert.strictEqual(result, '[false,true]');
    });

    it('should return array of stringified mixed type values', () => {
      const literal = new Literal(0, [false, ' foo=', 3.14, null]);
      const result = literal.toString(true);
      assert.strictEqual(result, '[false,"%20foo%3D",3.14,null]');
    });
  });

});
