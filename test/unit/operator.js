'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const Like = require('../../lib/like');
const Operator = require('../../lib/operator');
const Range = require('../../lib/range');


describe('Operator', () => {

  describe('#match', () => {
    it('should be true on eq match', () => {
      const op = Operator.eq;
      const result = op.match(42, 42);
      assert.isTrue(result);
    });

    it('should be false on eq miss', () => {
      const op = Operator.eq;
      const result = op.match(42, 24);
      assert.isFalse(result);
    });

    it('should be true on neq match', () => {
      const op = Operator.neq;
      const result = op.match(42, 24);
      assert.isTrue(result);
    });

    it('should be false on neq miss', () => {
      const op = Operator.neq;
      const result = op.match(42, 42);
      assert.isFalse(result);
    });

    it('should be true on gt match', () => {
      const op = Operator.gt;
      const result = op.match(42, 24);
      assert.isTrue(result);
    });

    it('should be false on gt miss', () => {
      const op = Operator.gt;
      const result = op.match(24, 42);
      assert.isFalse(result);
    });

    it('should be true on gte match', () => {
      const op = Operator.gte;
      const result = op.match(42, 42);
      assert.isTrue(result);
    });

    it('should be false on gte miss', () => {
      const op = Operator.gte;
      const result = op.match(24, 42);
      assert.isFalse(result);
    });

    it('should be true on lt match', () => {
      const op = Operator.lt;
      const result = op.match(24, 42);
      assert.isTrue(result);
    });

    it('should be false on lt miss', () => {
      const op = Operator.lt;
      const result = op.match(42, 24);
      assert.isFalse(result);
    });

    it('should be true on lte match', () => {
      const op = Operator.lte;
      const result = op.match(42, 42);
      assert.isTrue(result);
    });

    it('should be false on lte miss', () => {
      const op = Operator.lte;
      const result = op.match(42, 24);
      assert.isFalse(result);
    });

    it('should be true on in match', () => {
      const op = Operator.in;
      const result = op.match(42, [1, 2, 42, 3]);
      assert.isTrue(result);
    });

    it('should be false on in miss', () => {
      const op = Operator.in;
      const result = op.match(42, [1, 2, 3]);
      assert.isFalse(result);
    });

    it('should be true on nin match', () => {
      const op = Operator.nin;
      const result = op.match(42, [1, 2, 3]);
      assert.isTrue(result);
    });

    it('should be false on nin miss', () => {
      const op = Operator.nin;
      const result = op.match(42, [1, 2, 42, 3]);
      assert.isFalse(result);
    });

    it('should be true on between match', () => {
      const op = Operator.between;
      const result = op.match(42, new Range(1, 42));
      assert.isTrue(result);
    });

    it('should be false on between miss', () => {
      const op = Operator.between;
      const result = op.match(42, new Range(1, 24));
      assert.isFalse(result);
    });

    it('should be true on nbetween match', () => {
      const op = Operator.nbetween;
      const result = op.match(42, new Range(1, 24));
      assert.isTrue(result);
    });

    it('should be false on nbetween miss', () => {
      const op = Operator.nbetween;
      const result = op.match(42, new Range(1, 42));
      assert.isFalse(result);
    });

    it('should be true on like match', () => {
      const op = Operator.like;
      const result = op.match('foo', new Like('*foo*'));
      assert.isTrue(result);
    });

    it('should be false on like miss', () => {
      const op = Operator.like;
      const result = op.match('oof', new Like('*foo*'));
      assert.isFalse(result);
    });

    it('should be true on nlike match', () => {
      const op = Operator.nlike;
      const result = op.match('oof', new Like('*foo*'));
      assert.isTrue(result);
    });

    it('should be false on nlike miss', () => {
      const op = Operator.nlike;
      const result = op.match('foo', new Like('*foo*'));
      assert.isFalse(result);
    });

    it('should throw on unknonwn operator', () => {
      assert.throws(() => {
        const op = new Operator('unknown');
        op.match(42, 42);
      }, errors.MatchError);
    });

    it('should throw if two arguments not passed', () => {
      assert.throws(() => {
        const op = Operator.eq;
        op.match(42);
      }, TypeError);
    });

    it('should throw if object not array with in operator', () => {
      assert.throws(() => {
        Operator.in.match(42, 'derp');
      }, TypeError);
    });

    it('should throw if object not array with nin operator', () => {
      assert.throws(() => {
        Operator.nin.match(42, 'derp');
      }, TypeError);
    });

    it('should throw if object not range with between operator', () => {
      assert.throws(() => {
        Operator.between.match(42, 'derp');
      }, TypeError);
    });

    it('should throw if object not range with nbetween operator', () => {
      assert.throws(() => {
        Operator.nbetween.match(42, 'derp');
      }, TypeError);
    });

    it('should throw if object not Like with like operator', () => {
      assert.throws(() => {
        Operator.like.match('foo', 'derp');
      }, TypeError);
    });

    it('should throw if object not Like with nlike operator', () => {
      assert.throws(() => {
        Operator.nlike.match('foo', 'derp');
      }, TypeError);
    });
  });


  describe('#toString', () => {
    it('should return eq', () => {
      assert.strictEqual(Operator.eq.toString(), 'eq');
    });

    it('should return neq', () => {
      assert.strictEqual(Operator.neq.toString(), 'neq');
    });

    it('should return gt', () => {
      assert.strictEqual(Operator.gt.toString(), 'gt');
    });

    it('should return gte', () => {
      assert.strictEqual(Operator.gte.toString(), 'gte');
    });

    it('should return lt', () => {
      assert.strictEqual(Operator.lt.toString(), 'lt');
    });

    it('should return lte', () => {
      assert.strictEqual(Operator.lte.toString(), 'lte');
    });

    it('should return in', () => {
      assert.strictEqual(Operator.in.toString(), 'in');
    });

    it('should return nin', () => {
      assert.strictEqual(Operator.nin.toString(), 'nin');
    });

    it('should return between', () => {
      assert.strictEqual(Operator.between.toString(), 'between');
    });

    it('should return nbetween', () => {
      assert.strictEqual(Operator.nbetween.toString(), 'nbetween');
    });

    it('should return like', () => {
      assert.strictEqual(Operator.like.toString(), 'like');
    });

    it('should return nlike', () => {
      assert.strictEqual(Operator.nlike.toString(), 'nlike');
    });
  });

});
