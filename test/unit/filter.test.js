'use strict';

const assert = require('chai').assert;

const Clause = require('../../lib/clause');
const Filter = require('../../lib/filter');
const Like = require('../../lib/like');
const parse = require('../../lib').parse;
const PrioritizeStrategy = require('../../lib/prioritize-strategy');
const Range = require('../../lib/range');
const Target = require('../../lib/target');


const targetsEqual = (a, b) => {
  if (!(b instanceof Target) || a.path.length !== b.path.length) return false;

  for (let i = 0; i < a.path.length; i++) {
    if (a.path[i] !== b.path[i]) return false;
  }

  return true;
};


const rangesEqual = (a, b) => {
  return b instanceof Range && a.lower === b.lower && a.upper === b.uper;
};


const likesEqual = (a, b) => {
  return b instanceof Like && a.value === b.value;
};


const termsEqual = (a, b) => {
  if (a instanceof Target) return targetsEqual(a, b);
  if (a instanceof Range) return rangesEqual(a, b);
  if (a instanceof Like) return likesEqual(a, b);
  return a === b;
};


const filtersEqual = (a, b) => {
  if (a.statements.length !== b.statements.length) return false;

  for (let i = 0; i < a.statements.length; i++) {
    const aState = a.statements[i];
    const bState = b.statements[i];

    if (aState.conjunctive !== bState.conjunctive) return false;

    if (aState.value instanceof Filter) {
      if (!(bState.value instanceof Filter)
          || !filtersEqual(aState.value, bState.value)
      )
        return false;

      continue;
    }

    if (aState.value instanceof Clause) {
      if (!(bState.value instanceof Clause)
          || !termsEqual(aState.value.subject, bState.value.subject)
          || aState.value.operator !== bState.value.operator
          || !termsEqual(aState.value.object, bState.value.object)
      ) return false;

      continue;
    }

    return false;
  }

  return true;
};


describe('Filter', () => {

  describe('#where', () => {
    it('should throw if clause not instance of Clause', () => {
      assert.throws(() => {
        Filter.where(42);
      }, TypeError);
    });

    it('should throw if clause not valid', () => {
      assert.throws(() => {
        Filter.where(Clause.target('/foo'));
      }, TypeError);
    });

    it('should append field from subject', () => {
      const target = Target.jsonPointer('/foo');
      const filter = Filter.where(
        Clause
          .target(target)
          .eq()
          .target('/bar')
      );

      assert.strictEqual(filter.fields[0], target.field);
    });

    it('should append field from object', () => {
      const target = Target.jsonPointer('/bar');
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target(target)
        );

      assert.strictEqual(filter.fields[1], target.field);
    });

    it('should add statement', () => {
      const clause = Clause.target('/foo').eq().target('/bar');
      const filter = Filter.where(clause);

      assert.strictEqual(filter.statements[0].value, clause);
    });
  });


  describe('#and', () => {
    it('should throw if not Filter or Clause', () => {
      assert.throws(() => {
        Filter
          .where(
            Clause
              .target('/foo')
              .eq()
              .target('/bar')
          )
          .and(42);
      }, TypeError);
    });

    it('should throw if Clause invalid', () => {
      assert.throws(() => {
        Filter
          .where(
            Clause
              .target('/foo')
              .neq()
              .target('/bar')
          )
          .and(Clause.literal(42));
      }, TypeError);
    });

    it('should append field from subject', () => {
      const target = Target.jsonPointer('/baz');
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(
          Clause
            .target(target)
            .neq()
            .target('/qux')
        );

      assert.strictEqual(filter.fields[2], target.field);
    });

    it('should not append duplication field from subject', () => {
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(
          Clause
            .target('/foo')
            .neq()
            .target('/qux')
        );

      assert.strictEqual(filter.fields.length, 3);
    });

    it('should append field from object', () => {
      const target = Target.jsonPointer('/qux');
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(
          Clause
            .target('/baz')
            .neq()
            .target(target)
        );

      assert.strictEqual(filter.fields[3], target.field);
    });

    it('should not append duplication field from object', () => {
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(
          Clause
            .target('/baz')
            .neq()
            .target('/bar')
        );

      assert.strictEqual(filter.fields.length, 3);
    });

    it('should add statement', () => {
      const clause = Clause
        .target('/baz')
        .neq()
        .target('/qux');

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(clause);

      assert.strictEqual(filter.statements[1].value, clause);
    });

    it('should set statement conjunctive to and', () => {
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(
          Clause
            .target('/baz')
            .neq()
            .target('/qux')
        );

      assert.strictEqual(filter.statements[1].conjunctive, 'and');
    });

    it('should add all statements from Fliter', () => {
      const clause1 = Clause
        .target('/baz')
        .neq()
        .literal(42);

      const clause2 = Clause
        .literal(22)
        .in()
        .array([1, 2, 3]);

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(
          Filter
            .where(clause1)
            .and(clause2)
        );

      assert.strictEqual(filter.statements[1].value, clause1);
      assert.strictEqual(filter.statements[1].conjunctive, 'and');
      assert.strictEqual(filter.statements[2].value, clause2);
      assert.strictEqual(filter.statements[2].conjunctive, 'and');
    });

    it('should add all targets from Filter', () => {
      const target2 = Target.jsonPointer('/baz');
      const target3 = Target.jsonPointer('/qux');

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .and(
          Filter
            .where(
              Clause
                .target(target2)
                .lte()
                .literal(42)
            )
            .and(
              Clause
                .literal(0)
                .gte()
                .target(target3)
            )
        );

      assert.strictEqual(filter.fields[2], target2.field);
      assert.strictEqual(filter.fields[3], target3.field);
    });

    it('should join sub filter group statements', () => {
      const filter1 = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .literal('blorg')
        )
        .and(
          Clause
            .target('/bar')
            .lt()
            .literal(42)
        );

      const filter2 = Filter
        .where(
          Clause
            .target('/baz')
            .gt()
            .literal(3.14)
        )
        .andGroup(filter1);

      const filter3 = Filter
        .where(
          Clause
            .target('/qux')
            .gte()
            .literal(0)
        )
        .and(filter2);

      assert.strictEqual(filter3.statements[2].value, filter1);
    });
  });


  describe('#or', () => {
    it('should throw if not Filter or Clause', () => {
      assert.throws(() => {
        Filter
          .where(
            Clause
              .target('/foo')
              .eq()
              .target('/bar')
          )
          .or(42);
      }, TypeError);
    });

    it('should throw if Clause invalid', () => {
      assert.throws(() => {
        Filter
          .where(
            Clause
              .target('/foo')
              .neq()
              .target('/bar')
          )
          .or(Clause.literal(42));
      }, TypeError);
    });

    it('should append field from subject', () => {
      const target = Target.jsonPointer('/baz');
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(
          Clause
            .target(target)
            .neq()
            .target('/qux')
        );

      assert.strictEqual(filter.fields[2], target.field);
    });

    it('should not append duplication field from subject', () => {
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(
          Clause
            .target('/foo')
            .neq()
            .target('/qux')
        );

      assert.strictEqual(filter.fields.length, 3);
    });

    it('should append field from object', () => {
      const target = Target.jsonPointer('/qux');
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(
          Clause
            .target('/baz')
            .neq()
            .target(target)
        );

      assert.strictEqual(filter.fields[3], target.field);
    });

    it('should not append duplication field from object', () => {
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(
          Clause
            .target('/baz')
            .neq()
            .target('/bar')
        );

      assert.strictEqual(filter.fields.length, 3);
    });

    it('should add statement', () => {
      const clause = Clause
        .target('/baz')
        .neq()
        .target('/qux');

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(clause);

      assert.strictEqual(filter.statements[1].value, clause);
    });

    it('should set statement conjunctive to and', () => {
      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(
          Clause
            .target('/baz')
            .neq()
            .target('/qux')
        );

      assert.strictEqual(filter.statements[1].conjunctive, 'or');
    });

    it('should add all statements from Fliter', () => {
      const clause1 = Clause
        .target('/baz')
        .neq()
        .literal(42);

      const clause2 = Clause
        .literal(22)
        .in()
        .array([1, 2, 3]);

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(
          Filter
            .where(clause1)
            .or(clause2)
        );

      assert.strictEqual(filter.statements[1].value, clause1);
      assert.strictEqual(filter.statements[1].conjunctive, 'or');
      assert.strictEqual(filter.statements[2].value, clause2);
      assert.strictEqual(filter.statements[2].conjunctive, 'or');
    });

    it('should add all targets from Filter', () => {
      const target2 = Target.jsonPointer('/baz');
      const target3 = Target.jsonPointer('/qux');

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .target('/bar')
        )
        .or(
          Filter
            .where(
              Clause
                .target(target2)
                .lte()
                .literal(42)
            )
            .or(
              Clause
                .literal(0)
                .gte()
                .target(target3)
            )
        );

      assert.strictEqual(filter.fields[2], target2.field);
      assert.strictEqual(filter.fields[3], target3.field);
    });

    it('should join sub filter group statements', () => {
      const filter1 = Filter
        .where(
          Clause
            .target('/foo')
            .eq()
            .literal('blorg')
        )
        .or(
          Clause
            .target('/bar')
            .lt()
            .literal(42)
        );

      const filter2 = Filter
        .where(
          Clause
            .target('/baz')
            .gt()
            .literal(3.14)
        )
        .orGroup(filter1);

      const filter3 = Filter
        .where(
          Clause
            .target('/qux')
            .gte()
            .literal(0)
        )
        .or(filter2);

      assert.strictEqual(filter3.statements[2].value, filter1);
    });
  });


  describe('#group', () => {
    it('should throw if not Filter', () => {
      assert.throws(() => {
        Filter.group(
          Clause
            .target('/foo')
            .eq()
            .literal(42)
        );
      });
    });

    it('should return new instance of Filter', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .and(
          Clause
            .target('/bar')
            .eq()
            .literal(3.14)
        );

      const filter = Filter.group(group);

      assert.notStrictEqual(filter, group);
    });

    it('should add Filter to new Fitler as first statement', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .and(
          Clause
            .target('/bar')
            .eq()
            .literal(3.14)
        );

      const filter = Filter.group(group);

      assert.strictEqual(filter.statements[0].value, group);
    });

    it('should append all fields', () => {
      const target0 = Target.jsonPointer('/foo');
      const target1 = Target.jsonPointer('/bar');

      const group = Filter
        .where(
          Clause
            .target(target0)
            .lt()
            .literal(42)
        )
        .and(
          Clause
            .target(target1)
            .eq()
            .literal(3.14)
        );

      const filter = Filter.group(group);

      assert.strictEqual(filter.fields[0], target0.field);
      assert.strictEqual(filter.fields[1], target1.field);
    });

    it('should set root to new Filter instance', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .and(
          Clause
            .target('/bar')
            .eq()
            .literal(3.14)
        );

      const filter = Filter.group(group);

      assert.strictEqual(group.root, filter);
    });
  });


  describe('#andGroup', () => {
    it('should throw if not Filter', () => {
      assert.throws(() => {
        Filter
          .where(
            Clause
              .target('/foo')
              .lt()
              .literal(42)
          )
          .andGroup('nerp');
      });
    });

    it('should append all fields', () => {
      const target1 = Target.jsonPointer('/bar');
      const target2 = Target.jsonPointer('/baz');

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .andGroup(
          Filter.where(
            Clause
              .target(target1)
              .neq()
              .literal(3.14)
          )
          .and(
            Clause
              .target(target2)
              .nin()
              .array(['a', 'b', 'c'])
          )
        );

      assert.strictEqual(filter.fields[1], target1.field);
      assert.strictEqual(filter.fields[2], target2.field);
    });

    it('should set next statement group Filter', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .neq()
            .literal(3.14)
        )
        .and(
          Clause
            .literal('hi')
            .nin()
            .array(['a', 'b', 'c'])
        );

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .andGroup(group);

      assert.strictEqual(filter.statements[1].value, group);
    });

    it('should set root of group to parent Filter', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .neq()
            .literal(3.14)
        )
        .and(
          Clause
            .literal('hi')
            .nin()
            .array(['a', 'b', 'c'])
        );

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .andGroup(group);

      assert.strictEqual(group.root, filter);
    });

    it('should set root to nested Filter group\'s root', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .and(
          Clause
            .target('/bar')
            .eq()
            .literal(3.14)
        );

      const filter = Filter.group(group);

      const nested = Filter
        .where(
          Clause
            .target('/baz')
            .between()
            .range(0, 42)
        )
        .and(
          Clause
            .literal('blorg!')
            .nlike()
            .pattern('blorg_')
        );

      group.andGroup(nested);

      assert.strictEqual(nested.root, filter);
    });
  });


  describe('#orGroup', () => {
    it('should throw if not Filter', () => {
      assert.throws(() => {
        Filter
          .where(
            Clause
              .target('/foo')
              .lt()
              .literal(42)
          )
          .orGroup('nerp');
      });
    });

    it('should append all fields', () => {
      const target1 = Target.jsonPointer('/bar');
      const target2 = Target.jsonPointer('/baz');

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .orGroup(
          Filter.where(
            Clause
              .target(target1)
              .neq()
              .literal(3.14)
          )
          .and(
            Clause
              .target(target2)
              .nin()
              .array(['a', 'b', 'c'])
          )
        );

      assert.strictEqual(filter.fields[1], target1.field);
      assert.strictEqual(filter.fields[2], target2.field);
    });

    it('should set next statement group Filter', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .neq()
            .literal(3.14)
        )
        .and(
          Clause
            .literal('hi')
            .nin()
            .array(['a', 'b', 'c'])
        );

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .orGroup(group);

      assert.strictEqual(filter.statements[1].value, group);
    });

    it('should set root of group to parent Filter', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .neq()
            .literal(3.14)
        )
        .and(
          Clause
            .literal('hi')
            .nin()
            .array(['a', 'b', 'c'])
        );

      const filter = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .orGroup(group);

      assert.strictEqual(group.root, filter);
    });

    it('should set root to nested Filter group\'s root', () => {
      const group = Filter
        .where(
          Clause
            .target('/foo')
            .lt()
            .literal(42)
        )
        .and(
          Clause
            .target('/bar')
            .eq()
            .literal(3.14)
        );

      const filter = Filter.group(group);

      const nested = Filter
        .where(
          Clause
            .target('/baz')
            .between()
            .range(0, 42)
        )
        .and(
          Clause
            .literal('blorg!')
            .nlike()
            .pattern('blorg_')
        );

      group.orGroup(nested);

      assert.strictEqual(nested.root, filter);
    });
  });

  describe('#match', () => {
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
      fred: 'e',
      plugh: 'f',
    };

    const true01 = Clause
      .target('/foo')
      .eq()
      .literal(1);

    const true02 = Clause
      .target('/bar')
      .eq()
      .literal(2);

    const true03 = Clause
      .target('/baz')
      .eq()
      .literal(3);

    const true04 = Clause
      .target('/qux')
      .eq()
      .literal(4);

    const false01 = Clause
      .target('/corge')
      .eq()
      .literal(1);

    const false02 = Clause
      .target('/grault')
      .eq()
      .literal(2);

    const false03 = Clause
      .target('/garply')
      .eq()
      .literal(3);

    const false04 = Clause
      .target('/waldo')
      .eq()
      .literal(4);

    it('should be true on {true}', () => {
      const result = Filter
        .where(true01)
        .match(src);
      assert.isTrue(result);
    });

    it('should be false on {false}', () => {
      const result = Filter
        .where(false01)
        .match(src);
      assert.isFalse(result);
    });

    it('should be true on {true&true}', () => {
      const result = Filter
        .where(true01)
        .and(true02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be false on {true&false}', () => {
      const result = Filter
        .where(true01)
        .and(false01)
        .match(src);
      assert.isFalse(result);
    });

    it('should be false on {false&true}', () => {
      const result = Filter
        .where(false01)
        .and(true01)
        .match(src);
      assert.isFalse(result);
    });

    it('should be true on {true | true}', () => {
      const result = Filter
        .where(true01)
        .or(true02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {true | false}', () => {
      const result = Filter
        .where(true01)
        .or(false01)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {false | true}', () => {
      const result = Filter
        .where(false01)
        .or(true01)
        .match(src);
      assert.isTrue(result);
    });

    it('should be false on {false | false}', () => {
      const result = Filter
        .where(false01)
        .or(false01)
        .match(src);
      assert.isFalse(result);
    });

    it('should be true on {true | true&true}', () => {
      const result = Filter
        .where(true01)
        .or(true02)
        .and(true03)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {true | false&true}', () => {
      const result = Filter
        .where(true01)
        .or(false01)
        .and(true02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {true | true&false}', () => {
      const result = Filter
        .where(true01)
        .or(true02)
        .and(false01)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {true | false&false}', () => {
      const result = Filter
        .where(true01)
        .or(false01)
        .and(false02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {false | true&true}', () => {
      const result = Filter
        .where(false01)
        .or(true01)
        .and(true02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be false on {false | false&true}', () => {
      const result = Filter
        .where(false01)
        .or(false02)
        .and(true01)
        .match(src);
      assert.isFalse(result);
    });

    it('should be false on {false | true&false}', () => {
      const result = Filter
        .where(false01)
        .or(true01)
        .and(false02)
        .match(src);
      assert.isFalse(result);
    });

    it('should be false on {false | false&false}', () => {
      const result = Filter
        .where(false01)
        .or(false02)
        .and(false03)
        .match(src);
      assert.isFalse(result);
    });

    it('should be true on {false | true&false | true}', () => {
      const result = Filter
        .where(false01)
        .or(true01)
        .and(false02)
        .or(true02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {false | true&true | false}', () => {
      const result = Filter
        .where(false01)
        .or(true01)
        .and(true02)
        .or(false02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be false on {false | false&true | false}', () => {
      const result = Filter
        .where(false01)
        .or(false02)
        .and(true01)
        .or(false03)
        .match(src);
      assert.isFalse(result);
    });

    it('should be true on {true&true | false&true | true&false}', () => {
      const result = Filter
        .where(true01)
        .and(true02)
        .or(false01)
        .and(true03)
        .or(true04)
        .and(false02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {false&true | true&true | true&false}', () => {
      const result = Filter
        .where(false01)
        .and(true01)
        .or(true02)
        .and(true03)
        .or(true04)
        .and(false02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {true&false | false&true | true&true}', () => {
      const result = Filter
        .where(true01)
        .and(false01)
        .or(false02)
        .and(true02)
        .or(true03)
        .and(true04)
        .match(src);
      assert.isTrue(result);
    });

    it('should be false on {false&true | true&false | false&false}', () => {
      const result = Filter
        .where(false01)
        .and(true01)
        .or(true02)
        .and(false02)
        .or(false03)
        .and(false04)
        .match(src);
      assert.isFalse(result);
    });

    it('should be false on {false | true&true&false | false}', () => {
      const result = Filter
        .where(false01)
        .or(true01)
        .and(true02)
        .and(false02)
        .or(false03)
        .match(src);
      assert.isFalse(result);
    });

    it('should be true on {false | true&true&true | false}', () => {
      const result = Filter
        .where(false01)
        .or(true01)
        .and(true01)
        .and(true01)
        .or(false02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be false on {(true | false) & false}', () => {
      const result = Filter
        .group(
          Filter
            .where(true01)
            .or(false01)
        )
        .and(false02)
        .match(src);
      assert.isFalse(result);
    });

    it('should be false on {false & (false | true)}', () => {
      const result = Filter
        .where(false01)
        .andGroup(
          Filter
            .where(false02)
            .or(true01)
        )
        .match(src);
      assert.isFalse(result);
    });

    it('should be true on {(true | false) & true}', () => {
      const result = Filter
        .group(
          Filter
            .where(true01)
            .or(false01)
        )
        .and(true02)
        .match(src);
      assert.isTrue(result);
    });

    it('should be true on {true & (false | true)}', () => {
      const result = Filter
        .where(true01)
        .andGroup(
          Filter
            .where(false01)
            .or(true02)
        )
        .match(src);
      assert.isTrue(result);
    });
  });

  describe('#toString', () => {
    const clauseA = Clause
      .target('/foo')
      .gt()
      .literal(42);

    const clauseB = Clause
      .target('/bar')
      .neq()
      .literal('a?');

    const clauseC = Clause
      .target('/baz')
      .eq()
      .literal(true);

    it('should stringify clause', () => {
      const result = Filter
        .where(clauseA)
        .toString();

      assert.strictEqual(result, '/foo gt 42');
    });

    it('should stringify anded clauses', () => {
      const result = Filter
        .where(clauseA)
        .and(clauseB)
        .toString();

      assert.strictEqual(result, '/foo gt 42 and /bar neq "a?"');
    });

    it('should stringify ored clauses', () => {
      const result = Filter
        .where(clauseA)
        .or(clauseB)
        .toString();

      assert.strictEqual(result, '/foo gt 42 or /bar neq "a?"');
    });

    it('should stringify anded groups', () => {
      const result = Filter
        .where(clauseA)
        .andGroup(
          Filter
            .where(clauseB)
            .or(clauseC)
        )
        .toString();

      const a = '/foo gt 42 and (/bar neq "a?" or /baz eq true)';
      assert.strictEqual(result, a);
    });

    it('should stringify ored groups', () => {
      const result = Filter
        .group(
          Filter
            .where(clauseA)
            .and(clauseB)
        )
        .or(clauseC)
        .toString();

      const a = '(/foo gt 42 and /bar neq "a?") or /baz eq true';
      assert.strictEqual(result, a);
    });

    it('should URL encode stringify clause', () => {
      const result = Filter
        .where(clauseA)
        .toString(true);

      assert.strictEqual(result, '/foo%20gt%2042');
    });

    it('should URL encode stringify anded clauses', () => {
      const result = Filter
        .where(clauseA)
        .and(clauseB)
        .toString(true);

      assert.strictEqual(result, '/foo%20gt%2042%20and%20/bar%20neq%20"a%3F"');
    });

    it('should URL encode stringify ored clauses', () => {
      const result = Filter
        .where(clauseA)
        .or(clauseB)
        .toString(true);

      assert.strictEqual(result, '/foo%20gt%2042%20or%20/bar%20neq%20"a%3F"');
    });

    it('should URL encode stringify anded groups', () => {
      const result = Filter
        .where(clauseA)
        .andGroup(
          Filter
            .where(clauseB)
            .or(clauseC)
        )
        .toString(true);

      /* eslint-disable max-len */
      const a = '/foo%20gt%2042%20and%20(/bar%20neq%20"a%3F"%20or%20/baz%20eq%20true)';
      /* eslint-enable max-len */
      assert.strictEqual(result, a);
    });

    it('should URL encode stringify ored groups', () => {
      const result = Filter
        .group(
          Filter
            .where(clauseA)
            .and(clauseB)
        )
        .or(clauseC)
        .toString(true);

      /* eslint-disable max-len */
      const a = '(/foo%20gt%2042%20and%20/bar%20neq%20"a%3F")%20or%20/baz%20eq%20true';
      /* eslint-enable max-len */
      assert.strictEqual(result, a);
    });
  });


  describe('#prioritize', () => {
    it('should throw if priorities not array', () => {
      assert.throws(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize(42);
      }, TypeError);
    });

    it('should throw if options not object', () => {
      assert.throws(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize(['/foo'], 42);
      }, TypeError);
    });

    it('should throw if options not an object if provided', () => {
      assert.throws(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize([], 42);
      }, TypeError);
    });

    it('should throw if options.precedence not a string', () => {
      assert.throws(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize([], { precedence: 42 });
      }, TypeError);
    });

    it('should throw if options.precedence not "and" or "or"', () => {
      assert.throws(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize([], { precedence: 'nope' });
      }, TypeError);
    });

    it('should not throw if options.precedence "and"', () => {
      assert.doesNotThrow(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize([], { precedence: 'and' });
      }, TypeError);
    });

    it('should not throw if options.precedence "or"', () => {
      assert.doesNotThrow(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize([], { precedence: 'or' });
      }, TypeError);
    });

    it('should throw if priority item not string', () => {
      assert.throws(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize([42]);
      }, TypeError);
    });

    it('should throw if priority empy string', () => {
      assert.throws(() => {
        const filter = Filter.where(Clause.literal(42).eq().literal(42));
        filter.prioritize(['']);
      }, TypeError);
    });

    it('should not throw with pre-built PrioritizeStrategy', () => {
      const filter = Filter.where(Clause.literal(42).eq().literal(42));
      const strategy = PrioritizeStrategy.create(['/foo', '/bar']);

      assert.doesNotThrow(() => {
        filter.prioritize(strategy);
      }, TypeError);
    });

    it('should throw if arg 0 PrioritizeStrategy, and arg length > 1', () => {
      const filter = Filter.where(Clause.literal(42).eq().literal(42));
      const strategy = PrioritizeStrategy.create(['/foo', '/bar']);

      assert.throws(() => {
        filter.prioritize(strategy, {});
      }, TypeError);
    });

    /*
      Note: the shorthand used in these test descriptions is a reference to a
      target as it is indexed in a given list of priorities.

      A -1 denotes a target not found in priorities.

      An NA denotes no target.
    */

    const priorities = [
      '/foo',
      '/bar',
      '/baz',
      '/qux',
      '/quux',
      '/quuz',
    ];

    it('sorts anded [1 and 0] to [0 and 1]', () => {
      const filter = parse('/bar eq 1 and /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and 1] to [0 and 1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and 0-2] to [0-2 and 1]', () => {
      const filter = parse('/bar eq 1 and /foo eq /baz').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq /baz and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0-2 and 1] to [0-2 and 1]', () => {
      const filter = parse('/foo eq /baz and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq /baz and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and 2-0] to [2-0 and 1]', () => {
      const filter = parse('/bar eq 1 and /baz eq /foo').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/baz eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [2-0 and 1] to [2-0 and 1]', () => {
      const filter = parse('/baz eq /foo and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/baz eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and -1-0] to [-1-0 and 1]', () => {
      const filter = parse('/bar eq 1 and /corge eq /foo').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/corge eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [-1-0 and 1] to [-1-0 and 1]', () => {
      const filter = parse('/corge eq /foo and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/corge eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 or 0] to [0 or 1]', () => {
      const filter = parse('/bar eq 1 or /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 or 1] to [0 or 1]', () => {
      const filter = parse('/foo eq 0 or /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [-1 and 0 and 1] to [0 and 1 and -1]', () => {
      const filter = parse('/corge eq -1 and /foo eq 0 and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and 1 and -1] to [0 and 1 and -1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and /corge eq -1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [NA and 0 and 1] to [0 and 1 and NA]', () => {
      const filter = parse('1 eq 1 and /foo eq 0 and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and 1 and NA] to [0 and 1 and NA]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and 1 eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 or 2 and 0] to [0 and 2 or 1]', () => {
      const filter = parse('/bar eq 1 or /baz eq 2 and /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /baz eq 2 or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and 2 or 1] to [0 and 2 or 1]', () => {
      const filter = parse('/foo eq 0 and /baz eq 2 or /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /baz eq 2 or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [3 and 1 or 2 and 0] to [0 and 2 or 1 and 3]', () => {
      const filter = parse('/qux eq 3 and /bar eq 1 or /baz eq 2 and /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /baz eq 2 or /bar eq 1 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and 2 or 1 and 3] to [0 and 2 or 1 and 3]', () => {
      const filter = parse('/foo eq 0 and /baz eq 2 or /bar eq 1 and /qux eq 3').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /baz eq 2 or /bar eq 1 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [3 or 1 and 2 or 0] to [0 or 1 and 2 or 3]', () => {
      const filter = parse('/qux eq 3 or /bar eq 1 and /baz eq 2 or /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 and /baz eq 2 or /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 or 1 and 2 or 3] to [0 or 1 and 2 or 3]', () => {
      const filter = parse('/foo eq 0 or /bar eq 1 and /baz eq 2 or /qux eq 3').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 and /baz eq 2 or /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and 3 or -1 and 0] to [0 and -1 or 1 and 3]', () => {
      const filter = parse('/bar eq 1 and /qux eq 3 or /corge eq -1 and /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /corge eq -1 or /bar eq 1 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and -1 or 1 and 3] to [0 and -1 or 1 and 3]', () => {
      const filter = parse('/foo eq 0 and /corge eq -1 or /bar eq 1 and /qux eq 3').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /corge eq -1 or /bar eq 1 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and 3 or NA and 0] to [0 and NA or 1 and 3]', () => {
      const filter = parse('/bar eq 1 and /qux eq 3 or 1 eq 1 and /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and 1 eq 1 or /bar eq 1 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and NA or 1 and 3] to [0 and NA or 1 and 3]', () => {
      const filter = parse('/foo eq 0 and 1 eq 1 or /bar eq 1 and /qux eq 3').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and 1 eq 1 or /bar eq 1 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 or -1 and 3 or 0] to [0 or 1 or 3 and -1]', () => {
      const filter = parse('/bar eq 1 or /corge eq -1 and /qux eq 3 or /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 or /qux eq 3 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 or 1 or 3 and -1] to [0 or 1 or 3 and -1]', () => {
      const filter = parse('/foo eq 0 or /bar eq 1 or /qux eq 3 and /corge eq -1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 or /qux eq 3 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 or NA and 3 or 0] to [0 or 1 or 3 and NA]', () => {
      const filter = parse('/bar eq 1 or 1 eq 1 and /qux eq 3 or /foo eq 0').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 or /qux eq 3 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 or 1 or 3 and NA] to [0 or 1 or 3 and NA]', () => {
      const filter = parse('/foo eq 0 or /bar eq 1 or /qux eq 3 and 1 eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 or /qux eq 3 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and NA and 0 and -1] to [0 and 1 and NA and -1]', () => {
      const filter = parse('/bar eq 1 and 1 eq 1 and /foo eq 0 and /corge eq -1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and 1 and NA and -1] to [0 and 1 and NA and -1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [NA and 1 or 0 and -1] to [0 and -1 or 1 and NA]', () => {
      const filter = parse('1 eq 1 and /bar eq 1 or /foo eq 0 and /corge eq -1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /corge eq -1 or /bar eq 1 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and -1 or 1 and NA] to [0 and -1 or 1 and NA]', () => {
      const filter = parse('/foo eq 0 and /corge eq -1 or /bar eq 1 and 1 eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /corge eq -1 or /bar eq 1 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [NA or 1 and 0 or -1] to [0 and 1 or NA or -1]', () => {
      const filter = parse('1 eq 1 or /bar eq 1 and /foo eq 0 or /corge eq -1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 or 1 eq 1 or /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [0 and 1 or NA or -1] to [0 and 1 or NA or -1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 or 1 eq 1 or /corge eq -1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 or 1 eq 1 or /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and (2 and 0)] to [(0 and 2) and 1]', () => {
      const filter = parse('/bar eq 1 and (/baz eq 2 and /foo eq 0)').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(0 and 2) and 1] to [(0 and 2) and 1]', () => {
      const filter = parse('(/foo eq 0 and /baz eq 2) and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 or (2 or 0)] to [(0 or 2) or 1]', () => {
      const filter = parse('/bar eq 1 or (/baz eq 2 or /foo eq 0)').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(0 or 2) or 1] to [(0 or 2) or 1]', () => {
      const filter = parse('(/foo eq 0 or /baz eq 2) or /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 and (2 or 0)] to [(0 or 2) and 1]', () => {
      const filter = parse('/bar eq 1 and (/baz eq 2 or /foo eq 0)').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(0 or 2) and 1] to [(0 or 2) and 1]', () => {
      const filter = parse('(/foo eq 0 or /baz eq 2) and /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [1 or (2 and 0)] to [(0 and 2) or 1]', () => {
      const filter = parse('/bar eq 1 or (/baz eq 2 and /foo eq 0)').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(0 and 2) or 1] to [(0 and 2) or 1]', () => {
      const filter = parse('(/foo eq 0 and /baz eq 2) or /bar eq 1').value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [5 and (1 or 4) and (3 and 0 or 2)] to [(0 and 3 or 2) and (1 or 4) and 5]', () => {
      const a = '/quuz eq 5 and (/bar eq 1 or /quux eq 4) and (/qux eq 3 and /foo eq 0 or /baz eq 2)';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;
      const b = '(/foo eq 0 and /qux eq 3 or /baz eq 2) and (/bar eq 1 or /quux eq 4) and /quuz eq 5';
      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(0 and 3 or 3) and (1 or 4) and 5] to [(0 and 3 or 3) and (1 or 4) and 5]', () => {
      const a = '(/foo eq 0 and /qux eq 3 or /baz eq 2) and (/bar eq 1 or /quux eq 4) and /quuz eq 5';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [5 and (-1 or 4) and (3 and 0 or NA)] to [(0 and 3 or NA) and (4 or -1) and 5]', () => {
      const a = '/quuz eq 5 and (/corge eq -1 or /quux eq 4) and (/qux eq 3 and /foo eq 0 or 1 eq 1)';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;
      const b = '(/foo eq 0 and /qux eq 3 or 1 eq 1) and (/quux eq 4 or /corge eq -1) and /quuz eq 5';
      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(0 and 3 or NA) and (4 or -1) and 5] to [(0 and 3 or NA) and (4 or -1) and 5]', () => {
      const a = '(/foo eq 0 and /qux eq 3 or 1 eq 1) and (/quux eq 4 or /corge eq -1) and /quuz eq 5';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(3 or 1) or (5 or (NA and 0 or 4) and 2) and -1] '
        + 'to [((0 and NA or 4) and 2 or 5) and -1 or (1 or 3)]', () => {
      const a = `(/qux eq 3 or /bar eq 1)
                 or (/quuz eq 5 or (1 eq 1 and /foo eq 0 or /quux eq 4) and /baz eq 2)
                 and /corge eq -1`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;

      const b = `((/foo eq 0 and 1 eq 1 or /quux eq 4) and /baz eq 2 or /quuz eq 5)
                 and /corge eq -1
                 or (/bar eq 1 or /qux eq 3)`;

      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [((0 and NA or 4) and 2 or 5) and -1 or (1 or 3)] '
        + 'to [((0 and NA or 4) and 2 or 5) and -1 or (1 or 3)]', () => {
      const a = `((/foo eq 0 and 1 eq 1 or /quux eq 4) and /baz eq 2 or /quuz eq 5)
                 and /corge eq -1
                 or (/bar eq 1 or /qux eq 3)`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(3 or -1-1) or (5 or (NA and 0-1 or 4) and 2) and -1] '
        + 'to [((0-1 and NA or 4) and 2 or 5) and -1 or (-1-1 or 3)]', () => {
      const a = `(/qux eq 3 or /corge eq /bar)
                 or (/quuz eq 5 or (1 eq 1 and /foo eq /bar or /quux eq 4) and /baz eq 2)
                 and /corge eq -1`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;

      const b = `((/foo eq /bar and 1 eq 1 or /quux eq 4) and /baz eq 2 or /quuz eq 5)
                 and /corge eq -1
                 or (/corge eq /bar or /qux eq 3)`;

      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts anded [(3 or -1-1) or (5 or (NA and 0-1 or 4) and 2) and -1] '
        + 'to [((0-1 and NA or 4) and 2 or 5) and -1 or (-1-1 or 3)]', () => {
      const a = `((/foo eq /bar and 1 eq 1 or /quux eq 4) and /baz eq 2 or /quuz eq 5)
                 and /corge eq -1
                 or (/corge eq /bar or /qux eq 3)`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and 0] to [0 and 1]', () => {
      const filter = parse('/bar eq 1 and /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1] to [0 and 1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and 0-2] to [0-2 and 1]', () => {
      const filter = parse('/bar eq 1 and /foo eq /baz').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq /baz and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0-2 and 1] to [0-2 and 1]', () => {
      const filter = parse('/foo eq /baz and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq /baz and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and 2-0] to [2-0 and 1]', () => {
      const filter = parse('/bar eq 1 and /baz eq /foo').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/baz eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [2-0 and 1] to [2-0 and 1]', () => {
      const filter = parse('/baz eq /foo and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/baz eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and -1-0] to [-1-0 and 1]', () => {
      const filter = parse('/bar eq 1 and /corge eq /foo').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/corge eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [-1-0 and 1] to [-1-0 and 1]', () => {
      const filter = parse('/corge eq /foo and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/corge eq /foo and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 or 0] to [0 or 1]', () => {
      const filter = parse('/bar eq 1 or /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 or 1] to [0 or 1]', () => {
      const filter = parse('/foo eq 0 or /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [-1 and 0 and 1] to [0 and 1 and -1]', () => {
      const filter = parse('/corge eq -1 and /foo eq 0 and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1 and -1] to [0 and 1 and -1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [NA and 0 and 1] to [0 and 1 and NA]', () => {
      const filter = parse('1 eq 1 and /foo eq 0 and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1 and NA] to [0 and 1 and NA]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and 1 eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 or 2 and 0] to [0 and 1 or 2]', () => {
      const filter = parse('/bar eq 1 or /baz eq 2 and /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 or /baz eq 2').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1 or 2] to [0 and 1 or 2]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 or /baz eq 2').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 or /baz eq 2').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [3 and 1 or 2 and 0] to [0 and 1 or 2 and 3]', () => {
      const filter = parse('/qux eq 3 and /bar eq 1 or /baz eq 2 and /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 or /baz eq 2 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1 or 2 and 3] to [0 and 1 or 2 and 3]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 or /baz eq 2 and /qux eq 3').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 or /baz eq 2 and /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [3 or 1 and 2 or 0] to [0 or 2 and 1 or 3]', () => {
      const filter = parse('/qux eq 3 or /bar eq 1 and /baz eq 2 or /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /baz eq 2 and /bar eq 1 or /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 or 2 and 1 or 3] to [0 or 2 and 1 or 3]', () => {
      const filter = parse('/foo eq 0 or /baz eq 2 and /bar eq 1 or /qux eq 3').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /baz eq 2 and /bar eq 1 or /qux eq 3').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and 3 or -1 and 0] to [0 and 1 and 3 or -1]', () => {
      const filter = parse('/bar eq 1 and /qux eq 3 or /corge eq -1 and /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /qux eq 3 or /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1 and 3 or -1] to [0 and 1 and 3 or -1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and /qux eq 3 or /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /qux eq 3 or /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and 3 or NA and 0] to [0 and 1 and 3 or NA]', () => {
      const filter = parse('/bar eq 1 and /qux eq 3 or 1 eq 1 and /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /qux eq 3 or 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1 and 3 or NA] to [0 and 1 and 3 or NA]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and /qux eq 3 or 1 eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and /qux eq 3 or 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 or -1 and 3 or 0] to [0 or 3 and 1 or -1]', () => {
      const filter = parse('/bar eq 1 or /corge eq -1 and /qux eq 3 or /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /qux eq 3 and /bar eq 1 or /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 or 3 and 1 or -1] to [0 or 3 and 1 or -1]', () => {
      const filter = parse('/foo eq 0 or /qux eq 3 and /bar eq 1 or /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /qux eq 3 and /bar eq 1 or /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 or NA and 3 or 0] to [0 or 3 and 1 or NA]', () => {
      const filter = parse('/bar eq 1 or 1 eq 1 and /qux eq 3 or /foo eq 0').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /qux eq 3 and /bar eq 1 or 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 or 3 and 1 or NA] to [0 or 3 and 1 or NA]', () => {
      const filter = parse('/foo eq 0 or /qux eq 3 and /bar eq 1 or 1 eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /qux eq 3 and /bar eq 1 or 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and NA and 0 and -1] to [0 and 1 and NA and -1]', () => {
      const filter = parse('/bar eq 1 and 1 eq 1 and /foo eq 0 and /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 and 1 and NA and -1] to [0 and 1 and NA and -1]', () => {
      const filter = parse('/foo eq 0 and /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 and /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [NA and 1 or 0 and -1] to [0 or 1 and NA and -1]', () => {
      const filter = parse('1 eq 1 and /bar eq 1 or /foo eq 0 and /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 or 1 and NA and -1] to [0 or 1 and NA and -1]', () => {
      const filter = parse('/foo eq 0 or /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /bar eq 1 and 1 eq 1 and /corge eq -1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [NA or 1 and 0 or -1] to [0 or -1 and 1 or NA]', () => {
      const filter = parse('1 eq 1 or /bar eq 1 and /foo eq 0 or /corge eq -1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /corge eq -1 and /bar eq 1 or 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [0 or -1 and 1 or NA] to [0 or -1 and 1 or NA]', () => {
      const filter = parse('/foo eq 0 or /corge eq -1 and /bar eq 1 or 1 eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('/foo eq 0 or /corge eq -1 and /bar eq 1 or 1 eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and (2 and 0)] to [(0 and 2) and 1]', () => {
      const filter = parse('/bar eq 1 and (/baz eq 2 and /foo eq 0)').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(0 and 2) and 1] to [(0 and 2) and 1]', () => {
      const filter = parse('(/foo eq 0 and /baz eq 2) and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 or (2 or 0)] to [(0 or 2) or 1]', () => {
      const filter = parse('/bar eq 1 or (/baz eq 2 or /foo eq 0)').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(0 or 2) or 1] to [(0 or 2) or 1]', () => {
      const filter = parse('(/foo eq 0 or /baz eq 2) or /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 and (2 or 0)] to [(0 or 2) and 1]', () => {
      const filter = parse('/bar eq 1 and (/baz eq 2 or /foo eq 0)').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(0 or 2) and 1] to [(0 or 2) and 1]', () => {
      const filter = parse('(/foo eq 0 or /baz eq 2) and /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 or /baz eq 2) and /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [1 or (2 and 0)] to [(0 and 2) or 1]', () => {
      const filter = parse('/bar eq 1 or (/baz eq 2 and /foo eq 0)').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(0 and 2) or 1] to [(0 and 2) or 1]', () => {
      const filter = parse('(/foo eq 0 and /baz eq 2) or /bar eq 1').value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse('(/foo eq 0 and /baz eq 2) or /bar eq 1').value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [5 and (1 or 4) and (3 and 0 or 2)] to [(0 or 2 and 3) and (1 or 4) and 5]', () => {
      const a = '/quuz eq 5 and (/bar eq 1 or /quux eq 4) and (/qux eq 3 and /foo eq 0 or /baz eq 2)';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const b = '(/foo eq 0 or /baz eq 2 and /qux eq 3) and (/bar eq 1 or /quux eq 4) and /quuz eq 5';
      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(0 or 2 and 3) and (1 or 4) and 5] to [(0 or 2 and 3) and (1 or 4) and 5]', () => {
      const a = '(/foo eq 0 or /baz eq 2 and /qux eq 3) and (/bar eq 1 or /quux eq 4) and /quuz eq 5';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [5 and (-1 or 4) and (3 and 0 or NA)] to [(0 or NA and 3) and (4 or -1) and 5]', () => {
      const a = '/quuz eq 5 and (/corge eq -1 or /quux eq 4) and (/qux eq 3 and /foo eq 0 or 1 eq 1)';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const b = '(/foo eq 0 or 1 eq 1 and /qux eq 3) and (/quux eq 4 or /corge eq -1) and /quuz eq 5';
      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(0 or NA and 3) and (4 or -1) and 5] to [(0 or NA and 3) and (4 or -1) and 5]', () => {
      const a = '(/foo eq 0 or 1 eq 1 and /qux eq 3) and (/quux eq 4 or /corge eq -1) and /quuz eq 5';
      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(3 or 1) or (5 or (NA and 0 or 4) and 2) and -1] '
        + 'to [((0 or 4 and NA) or 5 and 2) or (1 or 3) and -1]', () => {
      const a = `(/qux eq 3 or /bar eq 1)
                 or (/quuz eq 5 or (1 eq 1 and /foo eq 0 or /quux eq 4) and /baz eq 2)
                 and /corge eq -1`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;

      const b = `((/foo eq 0 or /quux eq 4 and 1 eq 1) or /quuz eq 5 and /baz eq 2)
                 or (/bar eq 1 or /qux eq 3)
                 and /corge eq -1`;

      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [((0 or 4 and NA) or 5 and 2) or (1 or 3) and -1] '
        + 'to [((0 or 4 and NA) or 5 and 2) or (1 or 3) and -1]', () => {
      const a = `((/foo eq 0 or /quux eq 4 and 1 eq 1) or /quuz eq 5 and /baz eq 2)
                 or (/bar eq 1 or /qux eq 3)
                 and /corge eq -1`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [(3 or -1-1) or (5 or (NA and 0-1 or 4) and 2) and -1] '
        + 'to [((0-1 or 4 and NA) or 5 and 2) or (-1-1 or 3) and -1]', () => {
      const a = `(/qux eq 3 or /corge eq /bar)
                 or (/quuz eq 5 or (1 eq 1 and /foo eq /bar or /quux eq 4) and /baz eq 2)
                 and /corge eq -1`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;

      const b = `((/foo eq /bar or /quux eq 4 and 1 eq 1) or /quuz eq 5 and /baz eq 2)
                 or (/corge eq /bar or /qux eq 3)
                 and /corge eq -1`;

      const expected = parse(b).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('sorts ored [((0-1 or 4 and NA) or 5 and 2) or (-1-1 or 3) and -1] '
        + 'to [((0-1 or 4 and NA) or 5 and 2) or (-1-1 or 3) and -1]', () => {
      const a = `((/foo eq /bar or /quux eq 4 and 1 eq 1) or /quuz eq 5 and /baz eq 2)
                 or (/corge eq /bar or /qux eq 3)
                 and /corge eq -1`;

      const filter = parse(a).value;
      const result = filter.prioritize(priorities, { precedence: 'or' }).filter;
      const expected = parse(a).value;
      assert.isTrue(filtersEqual(expected, result));
    });

    it('should set root of nested filters to new filter', () => {
      const filter = parse('/bar eq 1 and (/baz eq 2 or /foo eq 0)').value;
      const result = filter.prioritize(priorities).filter;
      assert.strictEqual(result.statements[0].value.root, result);
    });

    it('should set root of doubly nested filters to new filter', () => {
      const filter = parse('/bar eq 1 and ((/baz eq 2 or /foo eq 0) and 1 eq 1)').value;
      const result = filter.prioritize(priorities).filter;
      assert.strictEqual(
        result.statements[0].value.statements[0].value.root,
        result
      );
    });
  });

});
