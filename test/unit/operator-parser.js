'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const OperatorParser = require('../../lib/operator-parser');
const Tokenizer = require('../../lib/tokenizer');


describe('OperatorParser', () => {

  describe('#parse', () => {
    it('should parse eq', () => {
      const tokenizer = new Tokenizer('eq');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'eq');
    });

    it('should parse neq', () => {
      const tokenizer = new Tokenizer('neq');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'neq');
    });

    it('should parse gt', () => {
      const tokenizer = new Tokenizer('gt');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'gt');
    });

    it('should parse gte', () => {
      const tokenizer = new Tokenizer('gte');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'gte');
    });

    it('should parse lt', () => {
      const tokenizer = new Tokenizer('lt');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'lt');
    });

    it('should parse lte', () => {
      const tokenizer = new Tokenizer('lte');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'lte');
    });

    it('should parse in', () => {
      const tokenizer = new Tokenizer('in');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'in');
    });

    it('should parse nin', () => {
      const tokenizer = new Tokenizer('nin');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'nin');
    });

    it('should parse between', () => {
      const tokenizer = new Tokenizer('between');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'between');
    });

    it('should parse nbetween', () => {
      const tokenizer = new Tokenizer('nbetween');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'nbetween');
    });

    it('should parse like', () => {
      const tokenizer = new Tokenizer('like');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'like');
    });

    it('should parse nlike', () => {
      const tokenizer = new Tokenizer('nlike');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'nlike');
    });

    it('should return unknown for non-operator in !strict', () => {
      const tokenizer = new Tokenizer('asdf');
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'unknown');
    });

    it('should throw on non-operator in strict', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('asdf');
        const parser = new OperatorParser(tokenizer);
        parser.parse(true);
      }, errors.ParserError);
    });

    it('should parse eq with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('eq');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'eq');
    });

    it('should parse neq with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('neq');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'neq');
    });

    it('should parse gt with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('gt');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'gt');
    });

    it('should parse gte with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('gte');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'gte');
    });

    it('should parse lt with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('lt');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'lt');
    });

    it('should parse lte with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('lte');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'lte');
    });

    it('should parse in with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('in');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'in');
    });

    it('should parse nin with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('nin');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'nin');
    });

    it('should parse between with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('between');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'between');
    });

    it('should parse nbetween with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('nbetween');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'nbetween');
    });

    it('should parse like with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('like');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'like');
    });

    it('should parse nlike with advanced tokenizer', () => {
      const tokenizer = new Tokenizer('nlike');
      tokenizer.next();
      const parser = new OperatorParser(tokenizer);
      const result = parser.parse();
      assert.strictEqual(result, 'nlike');
    });
  });

});
