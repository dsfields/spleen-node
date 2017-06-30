'use strict';

const assert = require('chai').assert;

const Clause = require('../../lib/clause');
const Like = require('../../lib/like');
const Range = require('../../lib/range');
const Target = require('../../lib/target');


describe('Clause', () => {

  describe('#target (static)', () => {
    it('should throw if pointer not string or Target', () => {
      assert.throws(() => {
        Clause.target(42);
      }, TypeError);
    });

    it('should set subject to parsed JSON pointer', () => {
      const clause = Clause.target('/foo/bar');
      assert.deepEqual(clause.subject.path, ['foo', 'bar']);
    });

    it('should set subject to provided Target', () => {
      const target = Target.jsonPointer('/foo/bar');
      const clause = Clause.target(target);
      assert.strictEqual(clause.subject, target);
    });

    it('should make eq() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').eq();
      }, ReferenceError);
    });

    it('should make neq() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').neq();
      }, ReferenceError);
    });

    it('should make gt() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').gt();
      }, ReferenceError);
    });

    it('should make gte() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').gte();
      }, ReferenceError);
    });

    it('should make lt() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').lt();
      }, ReferenceError);
    });

    it('should make lte() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').lte();
      }, ReferenceError);
    });

    it('should make in() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').in();
      }, ReferenceError);
    });

    it('should make nin() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').nin();
      }, ReferenceError);
    });

    it('should make between() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').between();
      }, ReferenceError);
    });

    it('should make nbetween() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').nbetween();
      }, ReferenceError);
    });

    it('should make like() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').like();
      }, ReferenceError);
    });

    it('should make nlike() available', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo/bar').nlike();
      }, ReferenceError);
    });

    it('should make literal() unavailable', () => {
      assert.throws(() => {
        Clause.target('/foo/bar').literal(42);
      }, ReferenceError);
    });

    it('should make target() unavailable', () => {
      assert.throws(() => {
        Clause.target('/foo/bar').target('/baz/qux');
      }, ReferenceError);
    });

    it('should make array() unavailable', () => {
      assert.throws(() => {
        Clause.target('/foo/bar').array([42]);
      }, ReferenceError);
    });

    it('should make pattern() unavailable', () => {
      assert.throws(() => {
        Clause.target('/foo/bar').pattern('%blorg%');
      }, ReferenceError);
    });

    it('should make range() unavailable', () => {
      assert.throws(() => {
        Clause.target('/foo/bar').range(24, 42);
      }, ReferenceError);
    });

    it('should make match() unavailable', () => {
      assert.throws(() => {
        Clause.target('/foo/bar').match({});
      }, ReferenceError);
    });

    it('should make toString() unavailable', () => {
      assert.throws(() => {
        Clause.target('/foo/bar').toString(true);
      }, ReferenceError);
    });
  });


  describe('#literal (static)', () => {
    it('should throw if value not string, number, Boolean, or null', () => {
      assert.throws(() => {
        Clause.literal({});
      }, TypeError);
    });

    it('should accept string value', () => {
      assert.doesNotThrow(() => {
        Clause.literal('foo');
      }, TypeError);
    });

    it('should accept number value', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42);
      }, TypeError);
    });

    it('should accept Boolean value', () => {
      assert.doesNotThrow(() => {
        Clause.literal(false);
      }, TypeError);
    });

    it('should accept null value', () => {
      assert.doesNotThrow(() => {
        Clause.literal(null);
      }, TypeError);
    });

    it('should not enable like if number or Boolean', () => {
      assert.throws(() => {
        Clause.literal(42).like();
      }, ReferenceError);
    });

    it('should not enable nlike if number or Boolean', () => {
      assert.throws(() => {
        Clause.literal(42).nlike();
      }, ReferenceError);
    });

    it('should set subject to value', () => {
      const clause = Clause.literal(42);
      assert.strictEqual(clause.subject, 42);
    });

    it('should make eq() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).eq();
      }, ReferenceError);
    });

    it('should make neq() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).neq();
      }, ReferenceError);
    });

    it('should make gt() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).gt();
      }, ReferenceError);
    });

    it('should make gte() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).gte();
      }, ReferenceError);
    });

    it('should make lt() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).lt();
      }, ReferenceError);
    });

    it('should make lte() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).lte();
      }, ReferenceError);
    });

    it('should make in() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).in();
      }, ReferenceError);
    });

    it('should make nin() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).nin();
      }, ReferenceError);
    });

    it('should make between() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).between();
      }, ReferenceError);
    });

    it('should make nbetween() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal(42).nbetween();
      }, ReferenceError);
    });

    it('should make like() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal('foo').like();
      }, ReferenceError);
    });

    it('should make nlike() available', () => {
      assert.doesNotThrow(() => {
        Clause.literal('foo').nlike();
      }, ReferenceError);
    });

    it('should make literal() unavailable', () => {
      assert.throws(() => {
        Clause.literal(42).literal(42);
      }, ReferenceError);
    });

    it('should make target() unavailable', () => {
      assert.throws(() => {
        Clause.literal(42).target('/baz/qux');
      }, ReferenceError);
    });

    it('should make array() unavailable', () => {
      assert.throws(() => {
        Clause.literal(42).array([42]);
      }, ReferenceError);
    });

    it('should make pattern() unavailable', () => {
      assert.throws(() => {
        Clause.literal('foo').pattern('%blorg%');
      }, ReferenceError);
    });

    it('should make range() unavailable', () => {
      assert.throws(() => {
        Clause.literal(42).range(24, 42);
      }, ReferenceError);
    });

    it('should make match() unavailable', () => {
      assert.throws(() => {
        Clause.literal(42).match({});
      }, ReferenceError);
    });

    it('should make toString() unavailable', () => {
      assert.throws(() => {
        Clause.literal(42).toString(true);
      }, ReferenceError);
    });
  });


  describe('#eq', () => {
    it('should set operator to Operator.eq', () => {
      const clause = Clause.target('/foo').eq();
      assert.strictEqual(clause.operator.type, 'eq');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().nlike();
      }, ReferenceError);
    });

    it('should enable literal()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().literal(42);
      }, ReferenceError);
    });

    it('should enable target()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().target('/bar');
      }, ReferenceError);
    });
  });


  describe('#neq', () => {
    it('should set operator to Operator.neq', () => {
      const clause = Clause.target('/foo').neq();
      assert.strictEqual(clause.operator.type, 'neq');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').neq().nlike();
      }, ReferenceError);
    });

    it('should enable literal()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').neq().literal(42);
      }, ReferenceError);
    });

    it('should enable target()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').neq().target('/bar');
      }, ReferenceError);
    });
  });


  describe('#gt', () => {
    it('should set operator to Operator.gt', () => {
      const clause = Clause.target('/foo').gt();
      assert.strictEqual(clause.operator.type, 'gt');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').gt().nlike();
      }, ReferenceError);
    });

    it('should enable literal()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').gt().literal(42);
      }, ReferenceError);
    });

    it('should enable target()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').gt().target('/bar');
      }, ReferenceError);
    });
  });


  describe('#gte', () => {
    it('should set operator to Operator.gte', () => {
      const clause = Clause.target('/foo').gte();
      assert.strictEqual(clause.operator.type, 'gte');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').gte().nlike();
      }, ReferenceError);
    });

    it('should enable literal()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').gte().literal(42);
      }, ReferenceError);
    });

    it('should enable target()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').gte().target('/bar');
      }, ReferenceError);
    });
  });


  describe('#lt', () => {
    it('should set operator to Operator.lt', () => {
      const clause = Clause.target('/foo').lt();
      assert.strictEqual(clause.operator.type, 'lt');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').lt().nlike();
      }, ReferenceError);
    });

    it('should enable literal()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').lt().literal(42);
      }, ReferenceError);
    });

    it('should enable target()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').lt().target('/bar');
      }, ReferenceError);
    });
  });


  describe('#lte', () => {
    it('should set operator to Operator.lte', () => {
      const clause = Clause.target('/foo').lte();
      assert.strictEqual(clause.operator.type, 'lte');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').lte().nlike();
      }, ReferenceError);
    });

    it('should enable literal()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').lte().literal(42);
      }, ReferenceError);
    });

    it('should enable target()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').lte().target('/bar');
      }, ReferenceError);
    });
  });


  describe('#in', () => {
    it('should set operator to Operator.in', () => {
      const clause = Clause.target('/foo').in();
      assert.strictEqual(clause.operator.type, 'in');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().nlike();
      }, ReferenceError);
    });

    it('should enable array()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').in().array([42, 'bar']);
      }, ReferenceError);
    });
  });


  describe('#nin', () => {
    it('should set operator to Operator.nin', () => {
      const clause = Clause.target('/foo').nin();
      assert.strictEqual(clause.operator.type, 'nin');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').nin().nlike();
      }, ReferenceError);
    });

    it('should enable array()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').nin().array([42, 'bar']);
      }, ReferenceError);
    });
  });


  describe('#between', () => {
    it('should set operator to Operator.between', () => {
      const clause = Clause.target('/foo').between();
      assert.strictEqual(clause.operator.type, 'between');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().nlike();
      }, ReferenceError);
    });

    it('should enable range()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').between().range(1, 42);
      }, ReferenceError);
    });
  });


  describe('#nbetween', () => {
    it('should set operator to Operator.nbetween', () => {
      const clause = Clause.target('/foo').nbetween();
      assert.strictEqual(clause.operator.type, 'nbetween');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').nbetween().nlike();
      }, ReferenceError);
    });

    it('should enable range()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').nbetween().range(1, 42);
      }, ReferenceError);
    });
  });


  describe('#like', () => {
    it('should set operator to Operator.like', () => {
      const clause = Clause.target('/foo').like();
      assert.strictEqual(clause.operator.type, 'like');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().nlike();
      }, ReferenceError);
    });

    it('should enable pattern()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').like().pattern('%bar_');
      }, ReferenceError);
    });
  });


  describe('#nlike', () => {
    it('should set operator to Operator.nlike', () => {
      const clause = Clause.target('/foo').nlike();
      assert.strictEqual(clause.operator.type, 'nlike');
    });

    it('should disable eq()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().eq();
      }, ReferenceError);
    });

    it('should disable neq()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().neq();
      }, ReferenceError);
    });

    it('should disable gt()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().gt();
      }, ReferenceError);
    });

    it('should disable gte()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().gte();
      }, ReferenceError);
    });

    it('should disable lt()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().lt();
      }, ReferenceError);
    });

    it('should disable lte()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().lte();
      }, ReferenceError);
    });

    it('should disable in()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().in();
      }, ReferenceError);
    });

    it('should disable nin()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().nin();
      }, ReferenceError);
    });

    it('should disable between()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().between();
      }, ReferenceError);
    });

    it('should disable nbetween()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().nbetween();
      }, ReferenceError);
    });

    it('should disable like()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().like();
      }, ReferenceError);
    });

    it('should disable nlike()', () => {
      assert.throws(() => {
        Clause.target('/foo').nlike().nlike();
      }, ReferenceError);
    });

    it('should enable pattern()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').nlike().pattern('%bar_');
      }, ReferenceError);
    });
  });


  describe('#literal', () => {
    it('should throw if value not string, number, Boolean, or null', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().literal({});
      }, TypeError);
    });

    it('should accept string for value', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().literal('foo');
      }, TypeError);
    });

    it('should accept number for value', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().literal(42);
      }, TypeError);
    });

    it('should accept Boolean for value', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().literal(true);
      }, TypeError);
    });

    it('should accept null for value', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().literal(null);
      }, TypeError);
    });

    it('should set object to value', () => {
      const clause = Clause.target('/foo').eq().literal(42);
      assert.strictEqual(clause.object, 42);
    });

    it('should disable target()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().literal(42).target('/bar');
      }, ReferenceError);
    });

    it('should disable literal()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().literal(42).literal('nope');
      }, ReferenceError);
    });

    it('should enable match()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().literal(42).match({ foo: 42 });
      }, ReferenceError);
    });

    it('should enable toString()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().literal(42).toString();
      }, ReferenceError);
    });
  });


  describe('#target', () => {
    it('should throw if pointer not string or Target', () => {
      assert.throws(() => {
        Clause.target('/foo'.eq().target(42));
      }, TypeError);
    });

    it('should set object to parsed JSON pointer', () => {
      const clause = Clause.target('/foo').eq().target('/bar/baz');
      assert.deepEqual(clause.object.path, ['bar', 'baz']);
    });

    it('should set object to provided Target', () => {
      const target = Target.jsonPointer('/bar/baz');
      const clause = Clause.target('/foo').eq().target(target);
      assert.strictEqual(clause.object, target);
    });

    it('should disable target()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().target('/bar').target('/baz');
      }, ReferenceError);
    });

    it('should disable literal()', () => {
      assert.throws(() => {
        Clause.target('/foo').eq().target('/bar').literal('nope');
      }, ReferenceError);
    });

    it('should enable match()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().target('/bar').match({ foo: 42, bar: 42 });
      }, ReferenceError);
    });

    it('should enable toString()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').eq().target('/bar').toString();
      }, ReferenceError);
    });
  });


  describe('#array', () => {
    it('should throw if value not array', () => {
      assert.throws(() => {
        Clause.target('/foo').in().array({});
      }, TypeError);
    });

    it('should set object to array', () => {
      const array = [null, 'foo', 3.14, false, 'bar'];
      const clause = Clause.target('/foo').in().array(array);
      assert.strictEqual(clause.object, array);
    });

    it('should disable array()', () => {
      assert.throws(() => {
        Clause.target('/foo').in().array([42]).array([24]);
      }, ReferenceError);
    });

    it('should enable match()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').in().array([42]).match({ foo: 42 });
      }, ReferenceError);
    });

    it('should enable toString()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').in().array([42]).toString();
      }, ReferenceError);
    });
  });


  describe('#pattern', () => {
    it('should throw if value not strings', () => {
      assert.throws(() => {
        Clause.target('/foo').like().pattern(42);
      }, TypeError);
    });

    it('should wrap value in Like', () => {
      const clause = Clause.target('/foo').like().pattern('%bar_');
      assert.instanceOf(clause.object, Like);
    });

    it('should set Like value to given string', () => {
      const value = '%bar_';
      const clause = Clause.target('/foo').like().pattern(value);
      assert.strictEqual(clause.object.value, value);
    });

    it('should set Like value to given Like instance', () => {
      const value = new Like('%bar_');
      const clause = Clause.target('/foo').like().pattern(value);
      assert.strictEqual(clause.object, value);
    });

    it('should disable pattern()', () => {
      assert.throws(() => {
        Clause.target('/foo').like().pattern('%bar_').pattern('%bar_');
      }, ReferenceError);
    });

    it('should enable match()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').like().pattern('%bar_').match({ foo: 'bar!' });
      }, ReferenceError);
    });

    it('should enable toString()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').nlike().pattern('%bar_').toString();
      }, ReferenceError);
    });
  });


  describe('#range', () => {
    it('should throw if lower not string, number, or null', () => {
      assert.throws(() => {
        Clause.target('/foo').between().range(false, 42);
      }, TypeError);
    });

    it('should throw if upper not string, number, or null', () => {
      assert.throws(() => {
        Clause.target('/foo').nmbetween().range(null, {});
      }, TypeError);
    });

    it('should set object instance of Range', () => {
      const clause = Clause.target('/foo').between().range(-42, 42);
      assert.instanceOf(clause.object, Range);
    });

    it('should set lower to lower on Range', () => {
      const clause = Clause.target('/foo').between().range(-42, 42);
      assert.strictEqual(clause.object.lower, -42);
    });

    it('should set upper to upper on Range', () => {
      const clause = Clause.target('/foo').between().range(-42, 42);
      assert.strictEqual(clause.object.upper, 42);
    });

    it('should set lower to upper if lower greater than upper', () => {
      const clause = Clause.target('/foo').between().range(42, -42);
      assert.strictEqual(clause.object.lower, -42);
    });

    it('should upper to lower if upper less than lower', () => {
      const clause = Clause.target('/foo').between().range(42, -42);
      assert.strictEqual(clause.object.upper, 42);
    });

    it('should disable range()', () => {
      assert.throws(() => {
        Clause.target('/foo').between().range(0, 42).range(0, 42);
      }, ReferenceError);
    });

    it('should enable match()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').between().range(0, 42).match({ foo: 1 });
      }, ReferenceError);
    });

    it('should enable toString()', () => {
      assert.doesNotThrow(() => {
        Clause.target('/foo').between().range(0, 42).toString();
      }, ReferenceError);
    });
  });


  describe('#match', () => {
    it('should be true on eq match from target to target', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .target('/bar')
        .match({ foo: 42, bar: 42 });

      assert.isTrue(result);
    });

    it('should be true on eq match from literal to target', () => {
      const result = Clause
        .literal(42)
        .eq()
        .target('/bar')
        .match({ bar: 42 });

      assert.isTrue(result);
    });

    it('should be true on eq match from target to literal', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(42)
        .match({ foo: 42 });

      assert.isTrue(result);
    });

    it('should be true on eq match from literal to literal', () => {
      const result = Clause
        .literal(42)
        .eq()
        .literal(42)
        .match();

      assert.isTrue(result);
    });

    it('should be false on eq miss from target to target', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .target('/bar')
        .match({ foo: 42, bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on eq miss from literal to target', () => {
      const result = Clause
        .literal(24)
        .eq()
        .target('/bar')
        .match({ bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on eq miss from target to literal', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(42)
        .match({ foo: 24 });

      assert.isFalse(result);
    });

    it('should be false on eq miss from missing target to literal', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(42)
        .match({ bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on eq miss from missing target src to literal', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(42)
        .match();

      assert.isFalse(result);
    });

    it('should be true on neq match from target to target', () => {
      const result = Clause
        .target('/foo')
        .neq()
        .target('/bar')
        .match({ foo: 42, bar: 24 });

      assert.isTrue(result);
    });

    it('should be true on neq match from literal to target', () => {
      const result = Clause
        .literal(42)
        .neq()
        .target('/bar')
        .match({ bar: 24 });

      assert.isTrue(result);
    });

    it('should be true on neq match from target to literal', () => {
      const result = Clause
        .target('/foo')
        .neq()
        .literal(42)
        .match({ foo: 24 });

      assert.isTrue(result);
    });

    it('should be true on neq match from literal to literal', () => {
      const result = Clause
        .literal(42)
        .neq()
        .literal(24)
        .match();

      assert.isTrue(result);
    });

    it('should be false on neq miss from target to target', () => {
      const result = Clause
        .target('/foo')
        .neq()
        .target('/bar')
        .match({ foo: 42, bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on neq miss from literal to target', () => {
      const result = Clause
        .literal(42)
        .neq()
        .target('/bar')
        .match({ bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on neq miss from target to literal', () => {
      const result = Clause
        .target('/foo')
        .neq()
        .literal(42)
        .match({ foo: 42 });

      assert.isFalse(result);
    });

    it('should be true on neq miss from missing target to literal', () => {
      const result = Clause
        .target('/foo')
        .neq()
        .literal(42)
        .match({ bar: 42 });

      assert.isTrue(result);
    });

    it('should be true on neq miss from missing target src to literal', () => {
      const result = Clause
        .target('/foo')
        .neq()
        .literal(42)
        .match();

      assert.isTrue(result);
    });

    it('should be true on gt match from target to target', () => {
      const result = Clause
        .target('/foo')
        .gt()
        .target('/bar')
        .match({ foo: 42, bar: 24 });

      assert.isTrue(result);
    });

    it('should be true on gt match from literal to target', () => {
      const result = Clause
        .literal(42)
        .gt()
        .target('/bar')
        .match({ bar: 24 });

      assert.isTrue(result);
    });

    it('should be true on gt match from target to literal', () => {
      const result = Clause
        .target('/foo')
        .gt()
        .literal(24)
        .match({ foo: 42 });

      assert.isTrue(result);
    });

    it('should be true on gt match from literal to literal', () => {
      const result = Clause
        .literal(42)
        .gt()
        .literal(24)
        .match();

      assert.isTrue(result);
    });

    it('should be false on gt miss from target to target', () => {
      const result = Clause
        .target('/foo')
        .gt()
        .target('/bar')
        .match({ foo: 24, bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on gt miss from literal to target', () => {
      const result = Clause
        .literal(24)
        .gt()
        .target('/bar')
        .match({ bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on gt miss from target to literal', () => {
      const result = Clause
        .target('/foo')
        .gt()
        .literal(42)
        .match({ foo: 24 });

      assert.isFalse(result);
    });

    it('should be false on gt miss from missing target to literal', () => {
      const result = Clause
        .target('/foo')
        .gt()
        .literal(42)
        .match({ bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on gt miss from missing target src to literal', () => {
      const result = Clause
        .target('/foo')
        .gt()
        .literal(24)
        .match();

      assert.isFalse(result);
    });

    it('should be true on gte match from target to target', () => {
      const result = Clause
        .target('/foo')
        .gte()
        .target('/bar')
        .match({ foo: 42, bar: 24 });

      assert.isTrue(result);
    });

    it('should be true on gte match from literal to target', () => {
      const result = Clause
        .literal(42)
        .gte()
        .target('/bar')
        .match({ bar: 24 });

      assert.isTrue(result);
    });

    it('should be true on gte match from target to literal', () => {
      const result = Clause
        .target('/foo')
        .gte()
        .literal(24)
        .match({ foo: 42 });

      assert.isTrue(result);
    });

    it('should be true on gte match from literal to literal', () => {
      const result = Clause
        .literal(42)
        .gte()
        .literal(24)
        .match();

      assert.isTrue(result);
    });

    it('should be false on gte miss from target to target', () => {
      const result = Clause
        .target('/foo')
        .gte()
        .target('/bar')
        .match({ foo: 24, bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on gte miss from literal to target', () => {
      const result = Clause
        .literal(24)
        .gte()
        .target('/bar')
        .match({ bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on gte miss from target to literal', () => {
      const result = Clause
        .target('/foo')
        .gte()
        .literal(42)
        .match({ foo: 24 });

      assert.isFalse(result);
    });

    it('should be false on gte miss from missing target to literal', () => {
      const result = Clause
        .target('/foo')
        .gte()
        .literal(42)
        .match({ bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on gte miss from missing target src to literal', () => {
      const result = Clause
        .target('/foo')
        .gte()
        .literal(24)
        .match();

      assert.isFalse(result);
    });

    it('should be true on lt match from target to target', () => {
      const result = Clause
        .target('/foo')
        .lt()
        .target('/bar')
        .match({ foo: 24, bar: 42 });

      assert.isTrue(result);
    });

    it('should be true on lt match from literal to target', () => {
      const result = Clause
        .literal(24)
        .lt()
        .target('/bar')
        .match({ bar: 42 });

      assert.isTrue(result);
    });

    it('should be true on lt match from target to literal', () => {
      const result = Clause
        .target('/foo')
        .lt()
        .literal(42)
        .match({ foo: 24 });

      assert.isTrue(result);
    });

    it('should be true on lt match from literal to literal', () => {
      const result = Clause
        .literal(24)
        .lt()
        .literal(42)
        .match();

      assert.isTrue(result);
    });

    it('should be false on lt miss from target to target', () => {
      const result = Clause
        .target('/foo')
        .lt()
        .target('/bar')
        .match({ foo: 42, bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on lt miss from literal to target', () => {
      const result = Clause
        .literal(42)
        .lt()
        .target('/bar')
        .match({ bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on lt miss from target to literal', () => {
      const result = Clause
        .target('/foo')
        .lt()
        .literal(24)
        .match({ foo: 42 });

      assert.isFalse(result);
    });

    it('should be false on lt miss from missing target to literal', () => {
      const result = Clause
        .target('/foo')
        .lt()
        .literal(24)
        .match({ bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on lt miss from missing target src to literal', () => {
      const result = Clause
        .target('/foo')
        .lt()
        .literal(42)
        .match();

      assert.isFalse(result);
    });

    it('should be true on lte match from target to target', () => {
      const result = Clause
        .target('/foo')
        .lte()
        .target('/bar')
        .match({ foo: 24, bar: 42 });

      assert.isTrue(result);
    });

    it('should be true on lte match from literal to target', () => {
      const result = Clause
        .literal(24)
        .lte()
        .target('/bar')
        .match({ bar: 42 });

      assert.isTrue(result);
    });

    it('should be true on lte match from target to literal', () => {
      const result = Clause
        .target('/foo')
        .lte()
        .literal(42)
        .match({ foo: 24 });

      assert.isTrue(result);
    });

    it('should be true on lte match from literal to literal', () => {
      const result = Clause
        .literal(24)
        .lte()
        .literal(42)
        .match();

      assert.isTrue(result);
    });

    it('should be false on lte miss from target to target', () => {
      const result = Clause
        .target('/foo')
        .lte()
        .target('/bar')
        .match({ foo: 42, bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on lte miss from literal to target', () => {
      const result = Clause
        .literal(42)
        .lte()
        .target('/bar')
        .match({ bar: 24 });

      assert.isFalse(result);
    });

    it('should be false on lte miss from target to literal', () => {
      const result = Clause
        .target('/foo')
        .lte()
        .literal(24)
        .match({ foo: 42 });

      assert.isFalse(result);
    });

    it('should be false on lte miss from missing target to literal', () => {
      const result = Clause
        .target('/foo')
        .lte()
        .literal(24)
        .match({ bar: 42 });

      assert.isFalse(result);
    });

    it('should be false on lte miss from missing target src to literal', () => {
      const result = Clause
        .target('/foo')
        .lte()
        .literal(42)
        .match();

      assert.isFalse(result);
    });

    it('should be true on in match from target', () => {
      const result = Clause
        .target('/foo')
        .in()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match({ foo: 3.14 });

      assert.isTrue(result);
    });

    it('should be true on in match from literal', () => {
      const result = Clause
        .literal(null)
        .in()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match();

      assert.isTrue(result);
    });

    it('should be false on in miss from target', () => {
      const result = Clause
        .target('/foo')
        .in()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match({ foo: true });

      assert.isFalse(result);
    });

    it('should be false on in miss from literal', () => {
      const result = Clause
        .literal(1.6)
        .in()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match();

      assert.isFalse(result);
    });

    it('should be false on in miss from target miss', () => {
      const result = Clause
        .target('/foo')
        .in()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match({ bar: 'bar' });

      assert.isFalse(result);
    });

    it('should be false on in miss from target source missing', () => {
      const result = Clause
        .target('/foo')
        .in()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match();

      assert.isFalse(result);
    });

    it('should be true on nin match from target', () => {
      const result = Clause
        .target('/foo')
        .nin()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match({ foo: 'baz' });

      assert.isTrue(result);
    });

    it('should be true on nin match from literal', () => {
      const result = Clause
        .literal('baz')
        .nin()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match();

      assert.isTrue(result);
    });

    it('should be false on nin miss from target', () => {
      const result = Clause
        .target('/foo')
        .nin()
        .array([42, 'foo', false, 3.14, 'bar'])
        .match({ foo: 42 });

      assert.isFalse(result);
    });

    it('should be false on nin miss from literal', () => {
      const result = Clause
        .literal(3.14)
        .nin()
        .array([42, 'foo', false, 3.14, 'bar'])
        .match();

      assert.isFalse(result);
    });

    it('should be true on nin miss from target miss', () => {
      const result = Clause
        .target('/foo')
        .nin()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match({ bar: 'foo' });

      assert.isTrue(result);
    });

    it('should be true on nin miss from target source missing', () => {
      const result = Clause
        .target('/foo')
        .nin()
        .array([null, 'foo', false, 3.14, 'bar'])
        .match();

      assert.isTrue(result);
    });

    it('should be true on between match from target', () => {
      const result = Clause
        .target('/foo')
        .between()
        .range(-42, 42)
        .match({ foo: 0 });

      assert.isTrue(result);
    });

    it('should be true on between match from literal', () => {
      const result = Clause
        .literal(0)
        .between()
        .range(-42, 42)
        .match();

      assert.isTrue(result);
    });

    it('should be false on between miss from target', () => {
      const result = Clause
        .target('/foo')
        .between()
        .range(-42, 42)
        .match({ foo: 56 });

      assert.isFalse(result);
    });

    it('should be false on between miss from literal', () => {
      const result = Clause
        .literal(56)
        .between()
        .range(-42, 42)
        .match();

      assert.isFalse(result);
    });

    it('should be false on between miss from target miss', () => {
      const result = Clause
        .target('/foo')
        .between()
        .range(-42, 42)
        .match({ bar: 0 });

      assert.isFalse(result);
    });

    it('should be false on between miss from target source missing', () => {
      const result = Clause
        .target('/foo')
        .between()
        .range(-42, 42)
        .match();

      assert.isFalse(result);
    });

    it('should be true on nbetween match from target', () => {
      const result = Clause
        .target('/foo')
        .nbetween()
        .range(-42, 42)
        .match({ foo: 56 });

      assert.isTrue(result);
    });

    it('should be true on nbetween match from literal', () => {
      const result = Clause
        .literal(56)
        .nbetween()
        .range(-42, 42)
        .match();

      assert.isTrue(result);
    });

    it('should be false on nbetween miss from target', () => {
      const result = Clause
        .target('/foo')
        .nbetween()
        .range(-42, 42)
        .match({ foo: 0 });

      assert.isFalse(result);
    });

    it('should be false on nbetween miss from literal', () => {
      const result = Clause
        .literal(0)
        .nbetween()
        .range(-42, 42)
        .match();

      assert.isFalse(result);
    });

    it('should be true on nbetween miss from target miss', () => {
      const result = Clause
        .target('/foo')
        .nbetween()
        .range(-42, 42)
        .match({ bar: 56 });

      assert.isTrue(result);
    });

    it('should be true on nbetween miss from target source missing', () => {
      const result = Clause
        .target('/foo')
        .nbetween()
        .range(-42, 42)
        .match();

      assert.isTrue(result);
    });

    it('should be true on like match from target', () => {
      const result = Clause
        .target('/foo')
        .like()
        .pattern('*foo_')
        .match({ foo: 'OMG foo!' });

      assert.isTrue(result);
    });

    it('should be true on like match from literal', () => {
      const result = Clause
        .literal('OMG foo!')
        .like()
        .pattern('*foo_')
        .match();

      assert.isTrue(result);
    });

    it('should be false on like miss from target', () => {
      const result = Clause
        .target('/foo')
        .like()
        .pattern('*foo_')
        .match({ foo: 'nerpers' });

      assert.isFalse(result);
    });

    it('should be false on like miss from literal', () => {
      const result = Clause
        .literal('nerpers')
        .like()
        .pattern('*foo_')
        .match();

      assert.isFalse(result);
    });

    it('should be false on like miss from target miss', () => {
      const result = Clause
        .target('/foo')
        .like()
        .pattern('*foo_')
        .match({ bar: 'OMG foo!' });

      assert.isFalse(result);
    });

    it('should be false on like miss from missing target source', () => {
      const result = Clause
        .target('/foo')
        .like()
        .pattern('*foo_')
        .match();

      assert.isFalse(result);
    });

    it('should be true on nlike match from target', () => {
      const result = Clause
        .target('/foo')
        .nlike()
        .pattern('*foo_')
        .match({ foo: 'nerpers' });

      assert.isTrue(result);
    });

    it('should be true on nlike match from literal', () => {
      const result = Clause
        .literal('nerpers')
        .nlike()
        .pattern('*foo_')
        .match();

      assert.isTrue(result);
    });

    it('should be false on nlike miss from target', () => {
      const result = Clause
        .target('/foo')
        .nlike()
        .pattern('*foo_')
        .match({ foo: 'OMG foo!' });

      assert.isFalse(result);
    });

    it('should be false on nlike miss from literal', () => {
      const result = Clause
        .literal('OMG foo!')
        .nlike()
        .pattern('*foo_')
        .match();

      assert.isFalse(result);
    });

    it('should be true on nlike miss from target miss', () => {
      const result = Clause
        .target('/foo')
        .nlike()
        .pattern('*foo_')
        .match({ bar: 'OMG foo!' });

      assert.isTrue(result);
    });

    it('should be true on nlike miss from missing target source', () => {
      const result = Clause
        .target('/foo')
        .nlike()
        .pattern('*foo_')
        .match();

      assert.isTrue(result);
    });
  });


  describe('#toString', () => {
    it('should stringify target subject and target object', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .target('/bar')
        .toString();

      assert.strictEqual(result, '/foo eq /bar');
    });

    it('should URL encode stringify target subject and target object', () => {
      const result = Clause
        .target('/foo?')
        .eq()
        .target('/bar&')
        .toString(true);

      assert.strictEqual(result, '/foo%3F%20eq%20/bar%26');
    });

    it('should stringify string subject and target object', () => {
      const result = Clause
        .literal('foo')
        .eq()
        .target('/bar')
        .toString();

      assert.strictEqual(result, '"foo" eq /bar');
    });

    it('should URL encode stringify string subject and target object', () => {
      const result = Clause
        .literal('foo?')
        .eq()
        .target('/bar&')
        .toString(true);

      assert.strictEqual(result, '"foo%3F"%20eq%20/bar%26');
    });

    it('should stringify number subject and target object', () => {
      const result = Clause
        .literal(42)
        .eq()
        .target('/bar')
        .toString();

      assert.strictEqual(result, '42 eq /bar');
    });

    it('should URL encode stringify number subject and target object', () => {
      const result = Clause
        .literal(42)
        .eq()
        .target('/bar&')
        .toString(true);

      assert.strictEqual(result, '42%20eq%20/bar%26');
    });

    it('should stringify null subject and target object', () => {
      const result = Clause
        .literal(null)
        .eq()
        .target('/bar')
        .toString();

      assert.strictEqual(result, 'nil eq /bar');
    });

    it('should URL encode stringify null subject and target object', () => {
      const result = Clause
        .literal(null)
        .eq()
        .target('/bar&')
        .toString(true);

      assert.strictEqual(result, 'nil%20eq%20/bar%26');
    });

    it('should stringify Boolean subject and target object', () => {
      const result = Clause
        .literal(true)
        .eq()
        .target('/bar')
        .toString();

      assert.strictEqual(result, 'true eq /bar');
    });

    it('should URL encode stringify Boolean subject and target object', () => {
      const result = Clause
        .literal(true)
        .eq()
        .target('/bar&')
        .toString(true);

      assert.strictEqual(result, 'true%20eq%20/bar%26');
    });

    it('should stringify target subject and string object', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal('bar')
        .toString();

      assert.strictEqual(result, '/foo eq "bar"');
    });

    it('should URL encode stringify target subject and string object', () => {
      const result = Clause
        .target('/foo?')
        .eq()
        .literal('bar&')
        .toString(true);

      assert.strictEqual(result, '/foo%3F%20eq%20"bar%26"');
    });

    it('should stringify target subject and number object', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(42)
        .toString();

      assert.strictEqual(result, '/foo eq 42');
    });

    it('should URL encode stringify target subject and number object', () => {
      const result = Clause
        .target('/foo?')
        .eq()
        .literal(42)
        .toString(true);

      assert.strictEqual(result, '/foo%3F%20eq%2042');
    });

    it('should stringify target subject and null object', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(null)
        .toString();

      assert.strictEqual(result, '/foo eq nil');
    });

    it('should URL encode stringify target subject and null object', () => {
      const result = Clause
        .target('/foo?')
        .eq()
        .literal(null)
        .toString(true);

      assert.strictEqual(result, '/foo%3F%20eq%20nil');
    });

    it('should stringify target subject and Boolean object', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(false)
        .toString();

      assert.strictEqual(result, '/foo eq false');
    });

    it('should URL encode stringify target subject and Boolean object', () => {
      const result = Clause
        .target('/foo?')
        .eq()
        .literal(false)
        .toString(true);

      assert.strictEqual(result, '/foo%3F%20eq%20false');
    });

    it('should stringify string subject and string object', () => {
      const result = Clause
        .literal('foo')
        .eq()
        .literal('bar')
        .toString();

      assert.strictEqual(result, '"foo" eq "bar"');
    });

    it('should URL encode stringify string subject and string object', () => {
      const result = Clause
        .literal('foo?')
        .eq()
        .literal('bar&')
        .toString(true);

      assert.strictEqual(result, '"foo%3F"%20eq%20"bar%26"');
    });

    it('should stringify number subject and number object', () => {
      const result = Clause
        .literal(42)
        .eq()
        .literal(42)
        .toString();

      assert.strictEqual(result, '42 eq 42');
    });

    it('should URL encode stringify number subject and number object', () => {
      const result = Clause
        .literal(42)
        .eq()
        .literal(42)
        .toString(true);

      assert.strictEqual(result, '42%20eq%2042');
    });

    it('should stringify null subject and null object', () => {
      const result = Clause
        .literal(null)
        .eq()
        .literal(null)
        .toString();

      assert.strictEqual(result, 'nil eq nil');
    });

    it('should URL encode stringify null subject and null object', () => {
      const result = Clause
        .literal(null)
        .eq()
        .literal(null)
        .toString(true);

      assert.strictEqual(result, 'nil%20eq%20nil');
    });

    it('should stringify Boolean subject and Boolean object', () => {
      const result = Clause
        .literal(false)
        .eq()
        .literal(true)
        .toString();

      assert.strictEqual(result, 'false eq true');
    });

    it('should URL encode stringify Boolean subject and Boolean object', () => {
      const result = Clause
        .literal(true)
        .eq()
        .literal(false)
        .toString(true);

      assert.strictEqual(result, 'true%20eq%20false');
    });

    it('should stringify target subject with array object', () => {
      const result = Clause
        .target('/foo')
        .in()
        .array([42, 'foo'])
        .toString();

      assert.strictEqual(result, '/foo in [42,"foo"]');
    });

    it('should URL encode stringify target subject with array object', () => {
      const result = Clause
        .target('/foo')
        .nin()
        .array([42, 'foo?'])
        .toString(true);

      assert.strictEqual(result, '/foo%20nin%20[42,"foo%3F"]');
    });

    it('should stringify target subject with pattern object', () => {
      const result = Clause
        .target('/foo')
        .like()
        .pattern('_foo*')
        .toString();

      assert.strictEqual(result, '/foo like "_foo*"');
    });

    it('should URL encode stringify target subject with pattern object', () => {
      const result = Clause
        .target('/foo')
        .nlike()
        .pattern('_?foo*')
        .toString(true);

      assert.strictEqual(result, '/foo%20nlike%20"_%3Ffoo*"');
    });

    it('should stringify target subject with range object', () => {
      const result = Clause
        .target('/foo')
        .between()
        .range(0, 42)
        .toString();

      assert.strictEqual(result, '/foo between 0,42');
    });

    it('should URL encode stringify target subject with range object', () => {
      const result = Clause
        .target('/foo')
        .nbetween()
        .range('a?', 'z&')
        .toString(true);

      assert.strictEqual(result, '/foo%20nbetween%20"a%3F","z%26"');
    });
  });


  describe('#isValid', () => {
    it('should be false after static target()', () => {
      const result = Clause
        .target('/foo')
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after static literal()', () => {
      const result = Clause
        .literal('foo')
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after eq()', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after neq()', () => {
      const result = Clause
        .target('/foo')
        .neq()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after gt()', () => {
      const result = Clause
        .target('/foo')
        .gt()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after gte()', () => {
      const result = Clause
        .target('/foo')
        .gte()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after lt()', () => {
      const result = Clause
        .target('/foo')
        .lt()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after lte()', () => {
      const result = Clause
        .target('/foo')
        .lte()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after in()', () => {
      const result = Clause
        .target('/foo')
        .in()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after nin()', () => {
      const result = Clause
        .target('/foo')
        .nin()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after between()', () => {
      const result = Clause
        .target('/foo')
        .between()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after nbetween()', () => {
      const result = Clause
        .target('/foo')
        .nbetween()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after like()', () => {
      const result = Clause
        .target('/foo')
        .like()
        .isValid();

      assert.isFalse(result);
    });

    it('should be false after nlike()', () => {
      const result = Clause
        .target('/foo')
        .nlike()
        .isValid();

      assert.isFalse(result);
    });

    it('should be true after target()', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .target('/bar')
        .isValid();

      assert.isTrue(result);
    });

    it('should be true after literal()', () => {
      const result = Clause
        .target('/foo')
        .eq()
        .literal(42)
        .isValid();

      assert.isTrue(result);
    });

    it('should be true after array()', () => {
      const result = Clause
        .target('/foo')
        .in()
        .array([42])
        .isValid();

      assert.isTrue(result);
    });

    it('should be true after pattern()', () => {
      const result = Clause
        .target('/foo')
        .like()
        .pattern('_foo*')
        .isValid();

      assert.isTrue(result);
    });

    it('should be true after range()', () => {
      const result = Clause
        .target('/foo')
        .between()
        .range(0, 42)
        .isValid();

      assert.isTrue(result);
    });
  });

});
