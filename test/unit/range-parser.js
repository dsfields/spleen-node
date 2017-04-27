'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const RangeParser = require('../../lib/range-parser');
const Tokenizer = require('../../lib/tokenizer');


describe('RangeParser', () => {

  describe('#parse', () => {
    it('should parse lower when str', () => {
      const parser = new RangeParser('"foo","bar"');
      const result = parser.parse();
      assert.isString(result.lower);
      assert.strictEqual(result.lower, 'foo');
    });

    it('should parse lower when num', () => {
      const parser = new RangeParser('24,42');
      const result = parser.parse();
      assert.isNumber(result.lower);
      assert.strictEqual(result.lower, 24);
    });

    it('should parse upper when str', () => {
      const parser = new RangeParser('"foo","bar"');
      const result = parser.parse();
      assert.isString(result.upper);
      assert.strictEqual(result.upper, 'bar');
    });

    it('should parse upper when num', () => {
      const parser = new RangeParser('24,42');
      const result = parser.parse();
      assert.isNumber(result.upper);
      assert.strictEqual(result.upper, 42);
    });

    it('should parse num lower & str upper', () => {
      const parser = new RangeParser('24,"bar"');
      const result = parser.parse();
      assert.isNumber(result.lower);
      assert.strictEqual(result.lower, 24);
      assert.isString(result.upper);
      assert.strictEqual(result.upper, 'bar');
    });

    it('should parse str lower & num upper', () => {
      const parser = new RangeParser('"foo",42');
      const result = parser.parse();
      assert.isString(result.lower);
      assert.strictEqual(result.lower, 'foo');
      assert.isNumber(result.upper);
      assert.strictEqual(result.upper, 42);
    });

    it('should throw if not delimited by comma', () => {
      assert.throws(() => {
        const parser = new RangeParser('24|42');
        parser.parse();
      }, errors.ParserError);
    });

    it('should throw if lower not str or num', () => {
      assert.throws(() => {
        const parser = new RangeParser('eq,42');
        parser.parse();
      }, errors.ParserError);
    });

    it('should throw if upper not str or num', () => {
      assert.throws(() => {
        const parser = new RangeParser('24,or');
        parser.parse();
      }, errors.ParserError);
    });

    it('should parse lower when str with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('"foo","bar"');
      const parser = new RangeParser(tokenizer);
      tokenizer.next();
      const result = parser.parse();
      assert.isString(result.lower);
      assert.strictEqual(result.lower, 'foo');
    });

    it('should parse lower when num with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('24,42');
      const parser = new RangeParser(tokenizer);
      tokenizer.next();
      const result = parser.parse();
      assert.isNumber(result.lower);
      assert.strictEqual(result.lower, 24);
    });

    it('should parse upper when str with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('"foo","bar"');
      const parser = new RangeParser(tokenizer);
      tokenizer.next();
      const result = parser.parse();
      assert.isString(result.upper);
      assert.strictEqual(result.upper, 'bar');
    });

    it('should parse upper when num with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('24,42');
      const parser = new RangeParser(tokenizer);
      tokenizer.next();
      const result = parser.parse();
      assert.isNumber(result.upper);
      assert.strictEqual(result.upper, 42);
    });

    it('should parse num lower & str upper with dirty tokenizer', () => {
      const tokenizer = new Tokenizer('24,"bar"');
      const parser = new RangeParser(tokenizer);
      tokenizer.next();
      const result = parser.parse();
      assert.isNumber(result.lower);
      assert.strictEqual(result.lower, 24);
      assert.isString(result.upper);
      assert.strictEqual(result.upper, 'bar');
    });

    it('should parse str lower & num upper with dirty tokenizer', () => {
      const tokenizer = new Tokenizer('"foo",42');
      const parser = new RangeParser(tokenizer);
      tokenizer.next();
      const result = parser.parse();
      assert.isString(result.lower);
      assert.strictEqual(result.lower, 'foo');
      assert.isNumber(result.upper);
      assert.strictEqual(result.upper, 42);
    });

    it('should throw if not delimited by comma with dirty tokenizer', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('24|42');
        const parser = new RangeParser(tokenizer);
        tokenizer.next();
        parser.parse();
      }, errors.ParserError);
    });

    it('should throw if lower not str or num with dirty tokenizer', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('eq,42');
        const parser = new RangeParser(tokenizer);
        tokenizer.next();
        parser.parse();
      }, errors.ParserError);
    });

    it('should throw if upper not str or numnum with dirty tokenizer', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('24,or');
        const parser = new RangeParser(tokenizer);
        tokenizer.next();
        parser.parse();
      }, errors.ParserError);
    });
  });

});
