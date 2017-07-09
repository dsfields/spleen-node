'use strict';

const assert = require('chai').assert;

const PrioritizeStrategy = require('../../lib/prioritize-strategy');


describe('PrioritizeStrategy', () => {

  describe('#create', () => {
    it('should throw if priorities not array', () => {
      assert.throws(() => {
        PrioritizeStrategy.create(42);
      }, TypeError);
    });

    it('should throw if options not object', () => {
      assert.throws(() => {
        PrioritizeStrategy.create(['/foo'], 42);
      }, TypeError);
    });

    it('should throw if options not an object if provided', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([], 42);
      }, TypeError);
    });

    it('should throw if options.precedence not a string', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([], { precedence: 42 });
      }, TypeError);
    });

    it('should throw if options.precedence not "and" or "or"', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([], { precedence: 'nope' });
      }, TypeError);
    });

    it('should not throw if options.precedence "and"', () => {
      assert.doesNotThrow(() => {
        PrioritizeStrategy.create([], { precedence: 'and' });
      }, TypeError);
    });

    it('should not throw if options.precedence "or"', () => {
      assert.doesNotThrow(() => {
        PrioritizeStrategy.create([], { precedence: 'or' });
      }, TypeError);
    });

    it('should throw if options.matchAllLabels not a Boolean', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([], { matchAllLabels: 42 });
      }, TypeError);
    });

    it('should not throw if options.matchAllLabels a Boolean', () => {
      assert.doesNotThrow(() => {
        PrioritizeStrategy.create([], { matchAllLabels: true });
      }, TypeError);
    });

    it('should throw if priority item not string or object', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([42]);
      }, TypeError);
    });

    it('should throw if priority empy string', () => {
      assert.throws(() => {
        PrioritizeStrategy.create(['']);
      }, TypeError);
    });

    it('should throw if priority item null', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([null]);
      }, TypeError);
    });

    it('should throw if priority.target not a string', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([{ target: 42 }]);
      }, TypeError);
    });

    it('should throw if priority.target an empty string', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([{ target: '' }]);
      }, TypeError);
    });

    it('should throw if priority.label not a string', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([{ target: '/foo', label: 42 }]);
      }, TypeError);
    });

    it('should hydrate #order with all targets', () => {
      const priorities = ['/foo', '/bar'];
      const strategy = PrioritizeStrategy.create(priorities);
      assert.isTrue(strategy.order.has(priorities[0]));
      assert.isTrue(strategy.order.has(priorities[1]));
    });

    it('should hydrate #order with all targets with value set to index', () => {
      const priorities = ['/foo', '/bar'];
      const strategy = PrioritizeStrategy.create(priorities);
      assert.strictEqual(strategy.order.get(priorities[0]).order, 0);
      assert.strictEqual(strategy.order.get(priorities[1]).order, 1);
    });

    it('should dedupe priorities', () => {
      const priorities = ['/foo', '/foo'];
      const strategy = PrioritizeStrategy.create(priorities);
      assert.strictEqual(strategy.order.size, 1);
    });

    it('should dedupe priorities from objects', () => {
      const priorities = [{
        target: '/foo',
      },
      {
        target: '/foo',
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      assert.strictEqual(strategy.order.size, 1);
    });

    it('should dedupe label targets', () => {
      const label = 'IX_foo';
      const priorities = [{
        target: '/foo',
        label,
      },
      {
        target: '/foo',
        label,
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      assert.strictEqual(strategy.labels.size, 1);
      assert.strictEqual(strategy.labels.get(label).count, 1);
    });

    it('should hydrate #order with all priorities[].target values', () => {
      const priorities = [{
        target: '/foo',
      },
      {
        target: '/bar',
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      const p0 = priorities[0];
      assert.isTrue(strategy.order.has(p0.target));

      const p1 = priorities[1];
      assert.isTrue(strategy.order.has(p1.target));
    });

    it('should hydrage #order with all target labels', () => {
      const priorities = [{
        target: '/foo',
        label: 'IX_foo',
      },
      {
        target: '/bar',
        label: 'IX_bar',
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      const p0 = priorities[0];
      assert.include(strategy.order.get(p0.target).labels, p0.label);

      const p1 = priorities[1];
      assert.include(strategy.order.get(p1.target).labels, p1.label);
    });

    it('should add entry for each unique label to #labels', () => {
      const priorities = [{
        target: '/foo',
        label: 'IX_foo',
      },
      {
        target: '/bar',
        label: 'IX_bar',
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      assert.isTrue(strategy.labels.has(priorities[0].label));
      assert.isTrue(strategy.labels.has(priorities[1].label));
    });

    it('should add each target to #label[].targets', () => {
      const priorities = [{
        target: '/foo',
        label: 'IX_foo',
      },
      {
        target: '/bar',
        label: 'IX_bar',
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      const p0 = priorities[0];
      assert.isTrue(strategy.labels.get(p0.label).targets.has(p0.target));

      const p1 = priorities[1];
      assert.isTrue(strategy.labels.get(p1.label).targets.has(p1.target));
    });

    it('should add multiple targets to single label', () => {
      const priorities = [{
        target: '/foo',
        label: 'IX_foo_bar',
      },
      {
        target: '/bar',
        label: 'IX_foo_bar',
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      assert.strictEqual(strategy.labels.size, 1);
    });

    it('should set label count to number of targets for each label', () => {
      const label = 'IX_foo_bar';
      const priorities = [{
        target: '/foo',
        label,
      },
      {
        target: '/bar',
        label,
      }];

      const strategy = PrioritizeStrategy.create(priorities);

      assert.strictEqual(strategy.labels.get(label).count, priorities.length);
    });

    it('should set #precedence to or', () => {
      const strategy = PrioritizeStrategy.create(['/foo', '/bar'], {
        precedence: 'or',
      });

      assert.strictEqual(strategy.precedence, 'or');
    });

    it('should default #precedence to and', () => {
      const strategy = PrioritizeStrategy.create(['/foo', '/bar']);
      assert.strictEqual(strategy.precedence, 'and');
    });

    it('should set #matchAllLabels to true', () => {
      const strategy = PrioritizeStrategy.create(['/foo', '/bar'], {
        matchAllLabels: true,
      });

      assert.isTrue(strategy.matchAllLabels);
    });

    it('should default #matchAllLabels to false', () => {
      const strategy = PrioritizeStrategy.create(['/foo', '/bar']);
      assert.isFalse(strategy.matchAllLabels);
    });
  });

});
