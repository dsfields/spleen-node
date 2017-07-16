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

    it('should throw if priority item not string', () => {
      assert.throws(() => {
        PrioritizeStrategy.create([42]);
      }, TypeError);
    });

    it('should throw if priority empy string', () => {
      assert.throws(() => {
        PrioritizeStrategy.create(['']);
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
  });

});
