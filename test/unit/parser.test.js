'use strict';

const assert = require('chai').assert;

const Clause = require('../../lib/clause');
const errors = require('../../lib/errors');
const Filter = require('../../lib/filter');
const Operator = require('../../lib/operator');
const Parser = require('../../lib/parser');
const Target = require('../../lib/target');


describe('Parser', () => {

  describe('#parse', () => {
    const src = {
      foo: 1,
      bar: 2,
      baz: 3,
      qux: 4,
      quux: 5,
      quuz: 6,
      corge: 'a',
      grault: 'b',
      garply: 'c',
      waldo: 'd',
      fred: null,
      plugh: 'f',
    };

    it('should parse target subject', () => {
      const parser = new Parser('/foo/bar eq 42');
      const filter = parser.parse().value;
      const subject = filter.statements[0].value.subject;
      assert.instanceOf(subject, Target);
      assert.lengthOf(subject.path, 2);
      assert.strictEqual(subject.path[0], 'foo');
      assert.strictEqual(subject.path[1], 'bar');
    });

    it('should parse number subject', () => {
      const parser = new Parser('42 eq /foo/bar');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.subject, 42);
    });

    it('should parse Boolean subject', () => {
      const parser = new Parser('true eq /foo/bar');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.subject, true);
    });

    it('should parse string subject', () => {
      const parser = new Parser('"foo" eq /bar/baz/qux');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.subject, 'foo');
    });

    it('should fail if no valid subject found', () => {
      const parser = new Parser('[1,2,3] eq /foo/bar');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse eq operator', () => {
      const parser = new Parser('/foo eq /bar');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.eq);
    });

    it('should parse neq operator', () => {
      const parser = new Parser('/foo neq /bar');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.neq);
    });

    it('should parse gt operator', () => {
      const parser = new Parser('/foo gt 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.gt);
    });

    it('should parse gte operator', () => {
      const parser = new Parser('/foo gte 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.gte);
    });

    it('should parse lt operator', () => {
      const parser = new Parser('/foo lt 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.lt);
    });

    it('should parse lte operator', () => {
      const parser = new Parser('/foo lte 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.lte);
    });

    it('should parse in operator', () => {
      const parser = new Parser('/foo in [1, 2, 3]');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.in);
    });

    it('should parse nin operator', () => {
      const parser = new Parser('/foo nin [1, 2, 3]');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.nin);
    });

    it('should parse between operator', () => {
      const parser = new Parser('/foo between 42,"plugh"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.between);
    });

    it('should parse nbetween operator', () => {
      const parser = new Parser('/foo nbetween 42,"plugh"');
      const filter = parser.parse().value;
      const op = filter.statements[0].value.operator;
      assert.strictEqual(op, Operator.nbetween);
    });

    it('should parse like operator', () => {
      const parser = new Parser('/foo like "*foo_"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.like);
    });

    it('should parse nlike operator', () => {
      const parser = new Parser('/foo nlike "*foo_"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.operator, Operator.nlike);
    });

    it('should fail if no valid operator found', () => {
      const parser = new Parser('/foo blorg 42');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse target object for eq', () => {
      const parser = new Parser('/foo eq /bar/baz');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.instanceOf(object, Target);
      assert.lengthOf(object.path, 2);
      assert.strictEqual(object.path[0], 'bar');
      assert.strictEqual(object.path[1], 'baz');
    });

    it('should parse nil literal for eq', () => {
      const parser = new Parser('/foo/bar/74 eq nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object);
    });

    it('should parse string object for eq', () => {
      const value = 'b\tlo\nrg';
      const parser = new Parser(`/foo/bar/74 eq "${value}"`);
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object, value);
    });

    it('should parse number object for eq', () => {
      const parser = new Parser('/foo/bar eq 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object, 42);
    });

    it('should parse Boolean object for eq', () => {
      const parser = new Parser('/foo eq false');
      const filter = parser.parse().value;
      assert.isFalse(filter.statements[0].value.object);
    });

    it('should fail if invalid object token for eq', () => {
      const parser = new Parser('/foo eq [1,2,3]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse target object for neq', () => {
      const parser = new Parser('/foo neq /bar/baz');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.instanceOf(object, Target);
      assert.lengthOf(object.path, 2);
      assert.strictEqual(object.path[0], 'bar');
      assert.strictEqual(object.path[1], 'baz');
    });

    it('should parse nil literal for neq', () => {
      const parser = new Parser('/foo/bar/74 neq nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object);
    });

    it('should parse string object for neq', () => {
      const value = 'b\tlo\nrg';
      const parser = new Parser(`/foo/bar/74 neq "${value}"`);
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object, value);
    });

    it('should parse number object for neq', () => {
      const parser = new Parser('/foo/bar neq 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object, 42);
    });

    it('should parse Boolean object for neq', () => {
      const parser = new Parser('/foo neq false');
      const filter = parser.parse().value;
      assert.isFalse(filter.statements[0].value.object);
    });

    it('should fail if invalid object token for neq', () => {
      const parser = new Parser('/foo neq [1,2,3]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse target object for gt', () => {
      const parser = new Parser('/foo gt /bar/baz');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.instanceOf(object, Target);
      assert.lengthOf(object.path, 2);
      assert.strictEqual(object.path[0], 'bar');
      assert.strictEqual(object.path[1], 'baz');
    });

    it('should parse nil literal for gt', () => {
      const parser = new Parser('/foo/bar/74 gt nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object);
    });

    it('should parse string object for gt', () => {
      const value = 'b\tlo\nrg';
      const parser = new Parser(`/foo/bar/74 gt "${value}"`);
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object, value);
    });

    it('should parse number object for gt', () => {
      const parser = new Parser('/foo/bar gt 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object, 42);
    });

    it('should parse Boolean object for gt', () => {
      const parser = new Parser('/foo gt false');
      const filter = parser.parse().value;
      assert.isFalse(filter.statements[0].value.object);
    });

    it('should fail if invalid object token for gt', () => {
      const parser = new Parser('/foo gt [1,2,3]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse target object for gte', () => {
      const parser = new Parser('/foo gte /bar/baz');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.instanceOf(object, Target);
      assert.lengthOf(object.path, 2);
      assert.strictEqual(object.path[0], 'bar');
      assert.strictEqual(object.path[1], 'baz');
    });

    it('should parse nil literal for gte', () => {
      const parser = new Parser('/foo/bar/74 gte nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object);
    });

    it('should parse string object for gte', () => {
      const value = 'b\tlo\nrg';
      const parser = new Parser(`/foo/bar/74 gte "${value}"`);
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object, value);
    });

    it('should parse number object for gte', () => {
      const parser = new Parser('/foo/bar gte 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object, 42);
    });

    it('should parse Boolean object for gte', () => {
      const parser = new Parser('/foo gte false');
      const filter = parser.parse().value;
      assert.isFalse(filter.statements[0].value.object);
    });

    it('should fail if invalid object token for gte', () => {
      const parser = new Parser('/foo gte [1,2,3]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse target object for lt', () => {
      const parser = new Parser('/foo lt /bar/baz');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.instanceOf(object, Target);
      assert.lengthOf(object.path, 2);
      assert.strictEqual(object.path[0], 'bar');
      assert.strictEqual(object.path[1], 'baz');
    });

    it('should parse nil literal for lt', () => {
      const parser = new Parser('/foo/bar/74 lt nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object);
    });

    it('should parse string object for lt', () => {
      const value = 'b\tlo\nrg';
      const parser = new Parser(`/foo/bar/74 lt "${value}"`);
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object, value);
    });

    it('should parse number object for lt', () => {
      const parser = new Parser('/foo/bar lt 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object, 42);
    });

    it('should parse Boolean object for lt', () => {
      const parser = new Parser('/foo lt false');
      const filter = parser.parse().value;
      assert.isFalse(filter.statements[0].value.object);
    });

    it('should fail if invalid object token for lt', () => {
      const parser = new Parser('/foo lt [1,2,3]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse target object for lte', () => {
      const parser = new Parser('/foo lte /bar/baz');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.instanceOf(object, Target);
      assert.lengthOf(object.path, 2);
      assert.strictEqual(object.path[0], 'bar');
      assert.strictEqual(object.path[1], 'baz');
    });

    it('should parse nil literal for lte', () => {
      const parser = new Parser('/foo/bar/74 lte nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object);
    });

    it('should parse string object for lte', () => {
      const value = 'b\tlo\nrg';
      const parser = new Parser(`/foo/bar/74 lte "${value}"`);
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object, value);
    });

    it('should parse number object for lte', () => {
      const parser = new Parser('/foo/bar lte 42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object, 42);
    });

    it('should parse Boolean object for lte', () => {
      const parser = new Parser('/foo lte false');
      const filter = parser.parse().value;
      assert.isFalse(filter.statements[0].value.object);
    });

    it('should fail if invalid object token for lte', () => {
      const parser = new Parser('/foo lte [1,2,3]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse empty array object for in', () => {
      const parser = new Parser('/foo/bar in []');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.isArray(object);
      assert.lengthOf(object, 0);
    });

    it('should parse nil array object for in', () => {
      const parser = new Parser('/foo/bar in [nil]');
      const filter = parser.parse().value;
      const value = [null];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse nils array object for in', () => {
      const parser = new Parser('/foo/bar in [nil,nil]');
      const filter = parser.parse().value;
      const value = [null, null];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse string array object for in', () => {
      const parser = new Parser('/foo/bar in ["baz"]');
      const filter = parser.parse().value;
      const value = ['baz'];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse strings array object for in', () => {
      const parser = new Parser('/foo/bar in ["baz","qux","quux","quuz"]');
      const filter = parser.parse().value;
      const value = ['baz', 'qux', 'quux', 'quuz'];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse number array object for in', () => {
      const parser = new Parser('/foo/bar in [42]');
      const filter = parser.parse().value;
      assert.deepEqual(filter.statements[0].value.object, [42]);
    });

    it('should parse numbers array object for in', () => {
      const parser = new Parser('/foo/bar in [42,3.14,1.61803399,13, 0xFF]');
      const filter = parser.parse().value;
      const value = [42, 3.14, 1.61803399, 13, 0xFF];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse Boolean array object for in', () => {
      const parser = new Parser('/foo/bar in [true]');
      const filter = parser.parse().value;
      assert.deepEqual(filter.statements[0].value.object, [true]);
    });

    it('should parse Booleans array object for in', () => {
      const parser = new Parser('/foo/bar in [true,true,false]');
      const filter = parser.parse().value;
      assert.deepEqual(filter.statements[0].value.object, [true, true, false]);
    });

    it('should parse strings, numbers, Booleans array object for in', () => {
      const parser = new Parser('/foo/bar in [0xFF, "blorg", false]');
      const filter = parser.parse().value;
      const value = [0xFF, 'blorg', false];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should fail if object for in does not start with [', () => {
      const parser = new Parser('/foo/bar in 0xFF, "blorg", false]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if object for in does not end with ]', () => {
      const parser = new Parser('/foo/bar in [0xFF, "blorg", false');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if array object for in contains non-literals', () => {
      const parser = new Parser('/foo/bar in [0xFF, "blorg", false, /baz]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse empty array object for nin', () => {
      const parser = new Parser('/foo/bar nin []');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.isArray(object);
      assert.lengthOf(object, 0);
    });

    it('should parse nil array object for nin', () => {
      const parser = new Parser('/foo/bar nin [nil]');
      const filter = parser.parse().value;
      const value = [null];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse nils array object for nin', () => {
      const parser = new Parser('/foo/bar nin [nil,nil]');
      const filter = parser.parse().value;
      const value = [null, null];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse string array object for nin', () => {
      const parser = new Parser('/foo/bar nin ["baz"]');
      const filter = parser.parse().value;
      const value = ['baz'];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse strings array object for nin', () => {
      const parser = new Parser('/foo/bar nin ["baz","qux","quux","quuz"]');
      const filter = parser.parse().value;
      const value = ['baz', 'qux', 'quux', 'quuz'];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse number array object for nin', () => {
      const parser = new Parser('/foo/bar nin [42]');
      const filter = parser.parse().value;
      assert.deepEqual(filter.statements[0].value.object, [42]);
    });

    it('should parse numbers array object for nin', () => {
      const parser = new Parser('/foo/bar nin [42,3.14,1.61803399,13, 0xFF]');
      const filter = parser.parse().value;
      const value = [42, 3.14, 1.61803399, 13, 0xFF];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should parse Boolean array object for nin', () => {
      const parser = new Parser('/foo/bar nin [true]');
      const filter = parser.parse().value;
      assert.deepEqual(filter.statements[0].value.object, [true]);
    });

    it('should parse Booleans array object for nin', () => {
      const parser = new Parser('/foo/bar nin [true,true,false]');
      const filter = parser.parse().value;
      assert.deepEqual(filter.statements[0].value.object, [true, true, false]);
    });

    it('should parse strings, numbers, Booleans array object for nin', () => {
      const parser = new Parser('/foo/bar nin [0xFF, "blorg", false]');
      const filter = parser.parse().value;
      const value = [0xFF, 'blorg', false];
      assert.deepEqual(filter.statements[0].value.object, value);
    });

    it('should fail if object for nin does not start with [', () => {
      const parser = new Parser('/foo/bar nin 0xFF, "blorg", false]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if object for nin does not end with ]', () => {
      const parser = new Parser('/foo/bar nin [0xFF, "blorg", false');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if array object for nin contains non-literals', () => {
      const parser = new Parser('/foo/bar nin [0xFF, /baz, false]');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse nil-lower range object for between', () => {
      const parser = new Parser('/foo between nil,nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object.lower);
    });

    it('should parse string-lower range object for between', () => {
      const parser = new Parser('/foo between "blorg","glorp"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.lower, 'blorg');
    });

    it('should parse number-lower range object for between', () => {
      const parser = new Parser('/foo between -42,42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.lower, -42);
    });

    it('should parse nil-upper range object for between', () => {
      const parser = new Parser('/foo between nil,nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object.upper);
    });

    it('should parse string-upper range object for between', () => {
      const parser = new Parser('/foo between "blorg","glorp"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.upper, 'glorp');
    });

    it('should parse number-upper range object for between', () => {
      const parser = new Parser('/foo between -42,42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.upper, 42);
    });

    it('should parse nil,string range object for between', () => {
      const parser = new Parser('/foo between nil,"blorg"');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, null);
      assert.strictEqual(object.upper, 'blorg');
    });

    it('should parse string,nil range object for between', () => {
      const parser = new Parser('/foo between "blorg",nil');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, 'blorg');
      assert.strictEqual(object.upper, null);
    });

    it('should parse nil,number range object for between', () => {
      const parser = new Parser('/foo between nil,42');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, null);
      assert.strictEqual(object.upper, 42);
    });

    it('should parse number,nil range object for between', () => {
      const parser = new Parser('/foo between 42,nil');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, null);
      assert.strictEqual(object.upper, 42);
    });

    it('should parse string,number range object for between', () => {
      const parser = new Parser('/foo between "blorg",42');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, 'blorg');
      assert.strictEqual(object.upper, 42);
    });

    it('should parse number,string range object for between', () => {
      const parser = new Parser('/foo between 42,"blorg"');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, 42);
      assert.strictEqual(object.upper, 'blorg');
    });

    it('should fail if lower range not string or number for between', () => {
      const parser = new Parser('/foo between /bar,42');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if upper range not string or number for between', () => {
      const parser = new Parser('/foo between "blorg",/bar');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if range not delimited by comma for between', () => {
      const parser = new Parser('/foo between 0|42');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse nil-lower range object for nbetween', () => {
      const parser = new Parser('/foo nbetween nil,nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object.lower);
    });

    it('should parse string-lower range object for nbetween', () => {
      const parser = new Parser('/foo nbetween "blorg","glorp"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.lower, 'blorg');
    });

    it('should parse number-lower range object for nbetween', () => {
      const parser = new Parser('/foo nbetween -42,42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.lower, -42);
    });

    it('should parse nil-upper range object for nbetween', () => {
      const parser = new Parser('/foo nbetween nil,nil');
      const filter = parser.parse().value;
      assert.isNull(filter.statements[0].value.object.upper);
    });

    it('should parse string-upper range object for nbetween', () => {
      const parser = new Parser('/foo nbetween "blorg","glorp"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.upper, 'glorp');
    });

    it('should parse number-upper range object for nbetween', () => {
      const parser = new Parser('/foo nbetween -42,42');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.upper, 42);
    });

    it('should parse nil,string range object for nbetween', () => {
      const parser = new Parser('/foo nbetween nil,"blorg"');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, null);
      assert.strictEqual(object.upper, 'blorg');
    });

    it('should parse string,nil range object for nbetween', () => {
      const parser = new Parser('/foo nbetween "blorg",nil');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, 'blorg');
      assert.strictEqual(object.upper, null);
    });

    it('should parse nil,number range object for nbetween', () => {
      const parser = new Parser('/foo nbetween nil,42');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, null);
      assert.strictEqual(object.upper, 42);
    });

    it('should parse number,nil range object for nbetween', () => {
      const parser = new Parser('/foo nbetween 42,nil');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, null);
      assert.strictEqual(object.upper, 42);
    });

    it('should parse string,number range object for nbetween', () => {
      const parser = new Parser('/foo nbetween "blorg",42');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, 'blorg');
      assert.strictEqual(object.upper, 42);
    });

    it('should parse number,string range object for nbetween', () => {
      const parser = new Parser('/foo nbetween 42,"blorg"');
      const filter = parser.parse().value;
      const object = filter.statements[0].value.object;
      assert.strictEqual(object.lower, 42);
      assert.strictEqual(object.upper, 'blorg');
    });

    it('should fail if lower range not string or number for nbetween', () => {
      const parser = new Parser('/foo nbetween /bar,42');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if upper range not string or number for nbetween', () => {
      const parser = new Parser('/foo nbetween "blorg",/bar');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if range not delimited by comma for nbetween', () => {
      const parser = new Parser('/foo nbetween 0|42');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse string pattern object for like', () => {
      const parser = new Parser('/foo like "*foo_"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.value, '*foo_');
    });

    it('should fail if pattern object not string for like', () => {
      const parser = new Parser('/foo like 42');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should parse string pattern object for nlike', () => {
      const parser = new Parser('/foo nlike "*foo_"');
      const filter = parser.parse().value;
      assert.strictEqual(filter.statements[0].value.object.value, '*foo_');
    });

    it('should fail if pattern object not string for like', () => {
      const parser = new Parser('/foo nlike 42');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should join clause and clause', () => {
      const parser = new Parser('/foo gt 42 and /bar in [1,nil,"3"]');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'and');
    });

    it('should join clause and clause and clause', () => {
      const parser = new Parser('/foo gt 42 and /bar in [1,2] and /baz neq 2');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      const c = filter.statements[2];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Clause);
      assert.instanceOf(c.value, Clause);
      assert.strictEqual(b.conjunctive, 'and');
      assert.strictEqual(c.conjunctive, 'and');
    });

    it('should join clause or clause', () => {
      const parser = new Parser('/foo gt 42 or /bar in [1,2,"3"]');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'or');
    });

    it('should join clause or clause or clause', () => {
      const parser = new Parser('/foo gt nil or /bar in [1,2] or /baz neq 2');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      const c = filter.statements[2];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Clause);
      assert.instanceOf(c.value, Clause);
      assert.strictEqual(b.conjunctive, 'or');
      assert.strictEqual(c.conjunctive, 'or');
    });

    it('should join clause and clause or clause', () => {
      const parser = new Parser('/foo gt 42 and /bar in [1,2] or /baz neq 2');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      const c = filter.statements[2];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Clause);
      assert.instanceOf(c.value, Clause);
      assert.strictEqual(b.conjunctive, 'and');
      assert.strictEqual(c.conjunctive, 'or');
    });

    it('should join clause or clause and clause', () => {
      const parser = new Parser('/foo gt 42 or /bar in [1,2] and /baz neq 2');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      const c = filter.statements[2];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Clause);
      assert.instanceOf(c.value, Clause);
      assert.strictEqual(b.conjunctive, 'or');
      assert.strictEqual(c.conjunctive, 'and');
    });

    it('should join group and clause', () => {
      const parser = new Parser('(/foo gt 42 or /bar in [1,2]) and /baz neq 2');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const a1 = a.value.statements[0];
      const a2 = a.value.statements[1];
      const b = filter.statements[1];
      assert.instanceOf(a.value, Filter);
      assert.instanceOf(a1.value, Clause);
      assert.instanceOf(a2.value, Clause);
      assert.strictEqual(a2.conjunctive, 'or');
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'and');
    });

    it('should join group or clause', () => {
      const parser = new Parser('(/foo gt 42 and /bar in [1,2]) or /baz neq 2');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const a1 = a.value.statements[0];
      const a2 = a.value.statements[1];
      const b = filter.statements[1];
      assert.instanceOf(a.value, Filter);
      assert.instanceOf(a1.value, Clause);
      assert.instanceOf(a2.value, Clause);
      assert.strictEqual(a2.conjunctive, 'and');
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'or');
    });

    it('should join clause and group', () => {
      const parser = new Parser('/baz neq 2 and (/foo gt 42 or /bar in [1,2])');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Filter);
      assert.strictEqual(b.conjunctive, 'and');
      const b1 = b.value.statements[0];
      const b2 = b.value.statements[1];
      assert.instanceOf(b1.value, Clause);
      assert.instanceOf(b2.value, Clause);
      assert.strictEqual(b2.conjunctive, 'or');
    });

    it('should join clause or group', () => {
      const parser = new Parser('/baz neq 2 or (/foo gt 42 and /bar in [1,2])');
      const filter = parser.parse().value;
      const a = filter.statements[0];
      const b = filter.statements[1];
      assert.instanceOf(a.value, Clause);
      assert.instanceOf(b.value, Filter);
      assert.strictEqual(b.conjunctive, 'or');
      const b1 = b.value.statements[0];
      const b2 = b.value.statements[1];
      assert.instanceOf(b1.value, Clause);
      assert.instanceOf(b2.value, Clause);
      assert.strictEqual(b2.conjunctive, 'and');
    });

    it('should join group and group', () => {
      const val = '(/foo lt 42 or /bar eq 10) and (/baz gte 3 and /qux lte 64)';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      const a = filter.statements[0];
      assert.instanceOf(a.value, Filter);
      const a1 = a.value.statements[0];
      const a2 = a.value.statements[1];
      assert.instanceOf(a1.value, Clause);
      assert.instanceOf(a2.value, Clause);
      assert.strictEqual(a2.conjunctive, 'or');
      const b = filter.statements[1];
      assert.instanceOf(b.value, Filter);
      assert.strictEqual(b.conjunctive, 'and');
      const b1 = b.value.statements[0];
      const b2 = b.value.statements[1];
      assert.instanceOf(b1.value, Clause);
      assert.instanceOf(b2.value, Clause);
      assert.strictEqual(b2.conjunctive, 'and');
    });

    it('should join group or group', () => {
      const val = '(/foo lt 42 or /bar eq 10) or (/baz gte 3 and /qux lte 64)';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      const a = filter.statements[0];
      assert.instanceOf(a.value, Filter);
      const a1 = a.value.statements[0];
      const a2 = a.value.statements[1];
      assert.instanceOf(a1.value, Clause);
      assert.instanceOf(a2.value, Clause);
      assert.strictEqual(a2.conjunctive, 'or');
      const b = filter.statements[1];
      assert.instanceOf(b.value, Filter);
      assert.strictEqual(b.conjunctive, 'or');
      const b1 = b.value.statements[0];
      const b2 = b.value.statements[1];
      assert.instanceOf(b1.value, Clause);
      assert.instanceOf(b2.value, Clause);
      assert.strictEqual(b2.conjunctive, 'and');
    });

    it('should join (group and clause) and clause', () => {
      const val = '((/foo eq 1 or /bar eq 2) and /baz lt 9) and /qux neq false';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      const a = filter.statements[0];
      assert.instanceOf(a.value, Filter);
      const a1 = a.value.statements[0];
      assert.instanceOf(a1.value, Filter);
      const a1a = a1.value.statements[0];
      const a1b = a1.value.statements[1];
      assert.instanceOf(a1a.value, Clause);
      assert.instanceOf(a1b.value, Clause);
      assert.strictEqual(a1b.conjunctive, 'or');
      const a2 = a.value.statements[1];
      assert.instanceOf(a2.value, Clause);
      assert.strictEqual(a2.conjunctive, 'and');
      const b = filter.statements[1];
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'and');
    });

    it('should join (group or clause) or clause', () => {
      const val = '((/foo eq 1 and /bar eq 2) or /baz lt 9) or /qux neq false';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      const a = filter.statements[0];
      assert.instanceOf(a.value, Filter);
      const a1 = a.value.statements[0];
      assert.instanceOf(a1.value, Filter);
      const a1a = a1.value.statements[0];
      const a1b = a1.value.statements[1];
      assert.instanceOf(a1a.value, Clause);
      assert.instanceOf(a1b.value, Clause);
      assert.strictEqual(a1b.conjunctive, 'and');
      const a2 = a.value.statements[1];
      assert.instanceOf(a2.value, Clause);
      assert.strictEqual(a2.conjunctive, 'or');
      const b = filter.statements[1];
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'or');
    });

    it('should join (clause and group) or clause', () => {
      const val = '(/foo lt 9 and (/bar eq 1 and /baz eq 2)) or /qux neq false';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      const a = filter.statements[0];
      assert.instanceOf(a.value, Filter);
      const a1 = a.value.statements[0];
      assert.instanceOf(a1.value, Clause);
      const a2 = a.value.statements[1];
      assert.instanceOf(a2.value, Filter);
      assert.strictEqual(a2.conjunctive, 'and');
      const a2a = a2.value.statements[0];
      assert.instanceOf(a2a.value, Clause);
      const a2b = a2.value.statements[1];
      assert.instanceOf(a2b.value, Clause);
      assert.strictEqual(a2b.conjunctive, 'and');
      const b = filter.statements[1];
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'or');
    });

    it('should join (clause or group) and clause', () => {
      const val = '(/foo lt 9 or (/bar eq 1 or /baz eq 2)) and /qux neq false';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      const a = filter.statements[0];
      assert.instanceOf(a.value, Filter);
      const a1 = a.value.statements[0];
      assert.instanceOf(a1.value, Clause);
      const a2 = a.value.statements[1];
      assert.instanceOf(a2.value, Filter);
      assert.strictEqual(a2.conjunctive, 'or');
      const a2a = a2.value.statements[0];
      assert.instanceOf(a2a.value, Clause);
      const a2b = a2.value.statements[1];
      assert.instanceOf(a2b.value, Clause);
      assert.strictEqual(a2b.conjunctive, 'or');
      const b = filter.statements[1];
      assert.instanceOf(b.value, Clause);
      assert.strictEqual(b.conjunctive, 'and');
    });

    it('should fail if group not closed', () => {
      const parser = new Parser('(/foo eq /bar and /baz lt 9 or /qux gt nil');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if ) encountered with no associated (', () => {
      const parser = new Parser('/foo eq /bar and /baz lt 9) or /qux gt 0');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if ) encountered and end with no associated (', () => {
      const parser = new Parser('/foo eq /bar and /baz lt 9 or /qux gt 0)');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should fail if opening ( found at end', () => {
      const parser = new Parser('/foo eq /bar and (');
      const result = parser.parse();
      assert.isFalse(result.success);
      assert.instanceOf(result.error, errors.ParserError);
    });

    it('should match true on {true}', () => {
      const parser = new Parser('/foo eq 1');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match false on {false}', () => {
      const parser = new Parser('/corge eq 1');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match true on {true&true}', () => {
      const parser = new Parser('/foo eq 1 and /bar eq 2');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match false on {true&false}', () => {
      const parser = new Parser('/foo eq 1 and /corg eq 1');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match false on {false&true}', () => {
      const parser = new Parser('/corg eq 1 and /foo eq 1');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match true on {true | true}', () => {
      const parser = new Parser('/foo eq 1 or /bar eq 2');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true | false}', () => {
      const parser = new Parser('/foo eq 1 or /corg eq 1');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {false | true}', () => {
      const parser = new Parser('/corg eq 1 or /foo eq 1');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match false on {false | false}', () => {
      const parser = new Parser('/corg eq 1 or /grault eq 2');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match true on {true | true&true}', () => {
      const parser = new Parser('/foo eq 1 or /bar eq 2 and /baz eq 3');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true | false&true}', () => {
      const parser = new Parser('/foo eq 1 or /corge eq 1 and /bar eq 2');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true | true&false}', () => {
      const parser = new Parser('/foo eq 1 or /bar eq 2 and /corge eq 1');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true | false&false}', () => {
      const parser = new Parser('/foo eq 1 or /corge eq 1 and /grault eq 2');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {false | true&true}', () => {
      const parser = new Parser('/corge eq 1 or /foo eq 1 and /bar eq 2');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match false on {false | false&true}', () => {
      const parser = new Parser('/corge eq 1 or /grault eq 2 and /foo eq 1');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match false on {false | true&false}', () => {
      const parser = new Parser('/corge eq 1 or /foo eq 1 and /grault eq 2');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match false on {false | false&false}', () => {
      const parser = new Parser('/corge eq 1 or /grault eq 2 and /garply eq 3');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match true on {false | true&false | true}', () => {
      const val = '/corge eq 1 or /foo eq 1 and /grault eq 2 or /bar eq 2';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {false | true&true | false}', () => {
      const val = '/corge eq 1 or /foo eq 1 and /bar eq 2 or /grault eq 2';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match false on {false | false&true | false}', () => {
      const val = '/corge eq 1 or /grault eq 2 and /foo eq 1 or /garply eq 3';
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match true on {true&true | false&true | true&false}', () => {
      const val = `   /foo eq 1 and /bar eq 2
                   or /corge eq 1 and /baz eq 3
                   or /qux eq 4 and /grault eq 2`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true&true | false&true | true&false}', () => {
      const val = `   /foo eq 1 and /bar eq 2
                   or /corge eq 1 and /baz eq 3
                   or /fred eq nil and /grault eq 2`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {false&true | true&true | true&false}', () => {
      const val = `/corge eq 1 and /foo eq 1
                or /bar eq 2 and /baz eq 3
                or /qux eq 4 and /grault eq 2`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {false&true | true&true | true&false}', () => {
      const val = `/corge eq 1 and /foo eq 1
                or /fred eq nil and /baz eq 3
                or /qux eq 4 and /grault eq 2`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true&false | false&true | true&true}', () => {
      const val = `/foo eq 1 and /corge eq 1
                or /grault eq 2 and /bar eq 2
                or /baz eq 3 and /qux eq 4`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true&false | false&true | true&true}', () => {
      const val = `/foo eq 1 and /fred eq nil
                or /grault eq 2 and /bar eq 2
                or /baz eq 3 and /qux eq 4`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match false on {false&true | true&false | false&false}', () => {
      const val = `/corge eq 1 and /foo eq 1
                or /bar eq 2 and /grault eq 2
                or /garply eq 3 and /waldo eq 4`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match false on {false&true | true&false | false&false}', () => {
      const val = `/fred eq 1 and /foo eq 1
                or /bar eq 2 and /grault eq 2
                or /garply eq 3 and /waldo eq 4`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match false on {false | true&true&false | false}', () => {
      const val = `/corge eq 1
                or /foo eq 1 and /bar eq 1 and /grault eq 2
                or /garply eq 3`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match false on {false | true&true&false | false}', () => {
      const val = `/corge eq 1
                or /fred eq nil and /bar eq 1 and /grault eq 2
                or /garply eq 3`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match true on {false | true&true&true | false}', () => {
      const val = `/corge eq 1
                or /foo eq 1 and /bar eq 2 and /baz eq 3
                or /grault eq 2`;
      const parser = new Parser(val);
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match false on {(true | false) & false}', () => {
      const parser = new Parser('(/foo eq 1 or /corge eq 1) and /grault eq 2');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match false on {false & (false | true)}', () => {
      const parser = new Parser('/corge eq 1 and (/grault eq 2 or /foo eq 1)');
      const filter = parser.parse().value;
      assert.isFalse(filter.match(src));
    });

    it('should match true on {(true | false) & true}', () => {
      const parser = new Parser('(/foo eq 1 or /corge eq 1) and /bar eq 2');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });

    it('should match true on {true & (false | true)}', () => {
      const parser = new Parser('/foo eq 1 and (/corge eq 1 or /bar eq 2)');
      const filter = parser.parse().value;
      assert.isTrue(filter.match(src));
    });
  });

});
