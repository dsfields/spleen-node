'use strict';

const assert = require('chai').assert;

const Like = require('../../lib/like');


describe('Like', () => {

  describe('#match', () => {
    it('should return false if value not string', () => {
      const like = new Like(0, '%foo');
      assert.isFalse(like.match(42));
    });

    it('should match n number of any char at start of string', () => {
      const like = new Like(0, '%foo');
      assert.isTrue(like.match('asdf foo'));
    });

    it('should match n number of any char mid string', () => {
      const like = new Like(0, 'foo%bar');
      assert.isTrue(like.match('foo adsf bar'));
    });

    it('should match 0 number of any char mid string', () => {
      const like = new Like(0, 'foo%bar');
      assert.isTrue(like.match('foobar'));
    });

    it('should match n number of any char at end of string', () => {
      const like = new Like(0, 'foo%');
      assert.isTrue(like.match('foo asdf'));
    });

    it('should match 0 number of any char at end of string', () => {
      const like = new Like(0, 'foo%');
      assert.isTrue(like.match('foo'));
    });

    it('should match value within a string', () => {
      const like = new Like(0, '%foo%');
      assert.isTrue(like.match('asdf foo ;lkj'));
    });

    it('should match string', () => {
      const like = new Like(0, '%foo%');
      assert.isTrue(like.match('foo'));
    });

    it('should match 1 of any char at start of string', () => {
      const like = new Like(0, '_foo');
      assert.isTrue(like.match('#foo'));
    });

    it('should match 1 of any char mid string', () => {
      const like = new Like(0, 'foo_bar');
      assert.isTrue(like.match('foo/bar'));
    });

    it('should match 1 of any char at end of string', () => {
      const like = new Like(0, 'foo_');
      assert.isTrue(like.match('foo@'));
    });

    it('should match 1 of any char at start of string and n at end', () => {
      const like = new Like(0, '_foo%');
      assert.isTrue(like.match('!foo bar'));
    });

    it('should match 1 of any char at start of string and 0 at end', () => {
      const like = new Like(0, '_foo%');
      assert.isTrue(like.match('!foo'));
    });

    it('should match n of any char at start of string and 1 at end', () => {
      const like = new Like(0, '%foo_');
      assert.isTrue(like.match('adsf foo^'));
    });

    it('should match 0 of any char at start of string and 1 at end', () => {
      const like = new Like(0, '%foo_');
      assert.isTrue(like.match('foo^'));
    });

    it('should match n of any char at start and end and 1 mid string', () => {
      const like = new Like(0, '%foo_bar%');
      assert.isTrue(like.match('asdf foo/bar ;lkj'));
    });

    it('should match 0 of any char at start and end and 1 mid string', () => {
      const like = new Like(0, '%foo_bar%');
      assert.isTrue(like.match('foo/bar'));
    });

    it('should !match n number of any char at start of string', () => {
      const like = new Like(0, '%foo');
      assert.isFalse(like.match('fooasdf'));
    });

    it('should !match n number of any char mid string', () => {
      const like = new Like(0, 'foo%bar');
      assert.isFalse(like.match('foo adsf ba'));
    });

    it('should !match 0 number of any char mid string', () => {
      const like = new Like(0, 'foo%bar');
      assert.isFalse(like.match('bar'));
    });

    it('should !match n number of any char at end of string', () => {
      const like = new Like(0, 'foo%');
      assert.isFalse(like.match('asdf foo'));
    });

    it('should !match 0 number of any char at end of string', () => {
      const like = new Like(0, 'foo%');
      assert.isFalse(like.match('barfoo'));
    });

    it('should !match value within a string', () => {
      const like = new Like(0, '%foo%');
      assert.isFalse(like.match('asdf fo1o ;lkj'));
    });

    it('should !match string', () => {
      const like = new Like(0, '%foo%');
      assert.isFalse(like.match('bar'));
    });

    it('should !match 1 of any char at start of string', () => {
      const like = new Like(0, '_foo');
      assert.isFalse(like.match('foo'));
    });

    it('should !match 1 of any char mid string', () => {
      const like = new Like(0, 'foo_bar');
      assert.isFalse(like.match('foobar'));
    });

    it('should !match 1 of any char at end of string', () => {
      const like = new Like(0, 'foo_');
      assert.isFalse(like.match('foo@bar'));
    });

    it('should !match 1 of any char at start of string and n at end', () => {
      const like = new Like(0, '_foo%');
      assert.isFalse(like.match('foo bar'));
    });

    it('should !match 1 of any char at start of string and 0 at end', () => {
      const like = new Like(0, '_foo%');
      assert.isFalse(like.match('foo'));
    });

    it('should !match n of any char at start of string and 1 at end', () => {
      const like = new Like(0, '%foo_');
      assert.isFalse(like.match('adsf foo'));
    });

    it('should !match 0 of any char at start of string and 1 at end', () => {
      const like = new Like(0, '%foo_');
      assert.isFalse(like.match('foo'));
    });

    it('should !match n of any char at start and end and 1 mid string', () => {
      const like = new Like(0, '%foo_bar%');
      assert.isFalse(like.match('asdf fodobar ;lkj'));
    });

    it('should !match 0 of any char at start and end and 1 mid string', () => {
      const like = new Like(0, '%foo_bar%');
      assert.isFalse(like.match('fodobar'));
    });

    it('should escape % wildcard', () => {
      const like = new Like(0, '\\%foo');
      assert.isTrue(like.match('%foo'));
    });

    it('should escape _ wildcard', () => {
      const like = new Like(0, '\\_foo');
      assert.isTrue(like.match('_foo'));
    });

    it('should match using same RegExp', () => {
      const like = new Like(0, 'foo%bar');
      assert.isTrue(like.match('foo / bar'));
      assert.isFalse(like.match('oof / rab'));
    });
  });

});
