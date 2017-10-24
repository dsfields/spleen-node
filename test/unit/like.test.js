'use strict';

const assert = require('chai').assert;

const Like = require('../../lib/like');


describe('Like', () => {

  describe('#match', () => {
    it('should return false if value not string', () => {
      const like = new Like('*foo');
      assert.isFalse(like.match(42));
    });

    it('should match n number of any char at start of string', () => {
      const like = new Like('*foo');
      assert.isTrue(like.match('asdf foo'));
    });

    it('should match n number of any char mid string', () => {
      const like = new Like('foo*bar');
      assert.isTrue(like.match('foo adsf bar'));
    });

    it('should match 0 number of any char mid string', () => {
      const like = new Like('foo*bar');
      assert.isTrue(like.match('foobar'));
    });

    it('should match n number of any char at end of string', () => {
      const like = new Like('foo*');
      assert.isTrue(like.match('foo asdf'));
    });

    it('should match 0 number of any char at end of string', () => {
      const like = new Like('foo*');
      assert.isTrue(like.match('foo'));
    });

    it('should match value within a string', () => {
      const like = new Like('*foo*');
      assert.isTrue(like.match('asdf foo ;lkj'));
    });

    it('should match string', () => {
      const like = new Like('*foo*');
      assert.isTrue(like.match('foo'));
    });

    it('should match 1 of any char at start of string', () => {
      const like = new Like('_foo');
      assert.isTrue(like.match('#foo'));
    });

    it('should match 1 of any char mid string', () => {
      const like = new Like('foo_bar');
      assert.isTrue(like.match('foo/bar'));
    });

    it('should match 1 of any char at end of string', () => {
      const like = new Like('foo_');
      assert.isTrue(like.match('foo@'));
    });

    it('should match 1 of any char at start of string and n at end', () => {
      const like = new Like('_foo*');
      assert.isTrue(like.match('!foo bar'));
    });

    it('should match 1 of any char at start of string and 0 at end', () => {
      const like = new Like('_foo*');
      assert.isTrue(like.match('!foo'));
    });

    it('should match n of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      assert.isTrue(like.match('adsf foo^'));
    });

    it('should match 0 of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      assert.isTrue(like.match('foo^'));
    });

    it('should match n of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      assert.isTrue(like.match('asdf foo/bar ;lkj'));
    });

    it('should match 0 of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      assert.isTrue(like.match('foo/bar'));
    });

    it('should !match n number of any char at start of string', () => {
      const like = new Like('*foo');
      assert.isFalse(like.match('fooasdf'));
    });

    it('should !match n number of any char mid string', () => {
      const like = new Like('foo*bar');
      assert.isFalse(like.match('foo adsf ba'));
    });

    it('should !match 0 number of any char mid string', () => {
      const like = new Like('foo*bar');
      assert.isFalse(like.match('bar'));
    });

    it('should !match n number of any char at end of string', () => {
      const like = new Like('foo*');
      assert.isFalse(like.match('asdf foo'));
    });

    it('should !match 0 number of any char at end of string', () => {
      const like = new Like('foo*');
      assert.isFalse(like.match('barfoo'));
    });

    it('should !match value within a string', () => {
      const like = new Like('*foo*');
      assert.isFalse(like.match('asdf fo1o ;lkj'));
    });

    it('should !match string', () => {
      const like = new Like('*foo*');
      assert.isFalse(like.match('bar'));
    });

    it('should !match 1 of any char at start of string', () => {
      const like = new Like('_foo');
      assert.isFalse(like.match('foo'));
    });

    it('should !match 1 of any char mid string', () => {
      const like = new Like('foo_bar');
      assert.isFalse(like.match('foobar'));
    });

    it('should !match 1 of any char at end of string', () => {
      const like = new Like('foo_');
      assert.isFalse(like.match('foo@bar'));
    });

    it('should !match 1 of any char at start of string and n at end', () => {
      const like = new Like('_foo*');
      assert.isFalse(like.match('foo bar'));
    });

    it('should !match 1 of any char at start of string and 0 at end', () => {
      const like = new Like('_foo*');
      assert.isFalse(like.match('foo'));
    });

    it('should !match n of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      assert.isFalse(like.match('adsf foo'));
    });

    it('should !match 0 of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      assert.isFalse(like.match('foo'));
    });

    it('should !match n of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      assert.isFalse(like.match('asdf fodobar ;lkj'));
    });

    it('should !match 0 of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      assert.isFalse(like.match('fodobar'));
    });

    it('should escape * wildcard', () => {
      const like = new Like('foo\\*');
      assert.isTrue(like.match('foo*'));
    });

    it('should escape _ wildcard', () => {
      const like = new Like('\\_foo');
      assert.isTrue(like.match('_foo'));
    });

    it('should match using same RegExp', () => {
      const like = new Like('foo*bar');
      assert.isTrue(like.match('foo / bar'));
      assert.isFalse(like.match('oof / rab'));
    });
  });


  describe('#toRegex', () => {
    it('should match n number of any char at start of string', () => {
      const like = new Like('*foo');
      const result = like.toRegex();
      assert.isTrue(result.test('asdf foo'));
    });

    it('should match n number of any char mid string', () => {
      const like = new Like('foo*bar');
      const result = like.toRegex();
      assert.isTrue(result.test('foo adsf bar'));
    });

    it('should match 0 number of any char mid string', () => {
      const like = new Like('foo*bar');
      const result = like.toRegex();
      assert.isTrue(result.test('foobar'));
    });

    it('should match n number of any char at end of string', () => {
      const like = new Like('foo*');
      const result = like.toRegex();
      assert.isTrue(result.test('foo asdf'));
    });

    it('should match 0 number of any char at end of string', () => {
      const like = new Like('foo*');
      const result = like.toRegex();
      assert.isTrue(result.test('foo'));
    });

    it('should match value within a string', () => {
      const like = new Like('*foo*');
      const result = like.toRegex();
      assert.isTrue(result.test('asdf foo ;lkj'));
    });

    it('should match string', () => {
      const like = new Like('*foo*');
      const result = like.toRegex();
      assert.isTrue(result.test('foo'));
    });

    it('should match 1 of any char at start of string', () => {
      const like = new Like('_foo');
      const result = like.toRegex();
      assert.isTrue(result.test('#foo'));
    });

    it('should match 1 of any char mid string', () => {
      const like = new Like('foo_bar');
      const result = like.toRegex();
      assert.isTrue(result.test('foo/bar'));
    });

    it('should match 1 of any char at end of string', () => {
      const like = new Like('foo_');
      const result = like.toRegex();
      assert.isTrue(result.test('foo@'));
    });

    it('should match 1 of any char at start of string and n at end', () => {
      const like = new Like('_foo*');
      const result = like.toRegex();
      assert.isTrue(result.test('!foo bar'));
    });

    it('should match 1 of any char at start of string and 0 at end', () => {
      const like = new Like('_foo*');
      const result = like.toRegex();
      assert.isTrue(result.test('!foo'));
    });

    it('should match n of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      const result = like.toRegex();
      assert.isTrue(result.test('adsf foo^'));
    });

    it('should match 0 of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      const result = like.toRegex();
      assert.isTrue(result.test('foo^'));
    });

    it('should match n of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      const result = like.toRegex();
      assert.isTrue(result.test('asdf foo/bar ;lkj'));
    });

    it('should match 0 of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      const result = like.toRegex();
      assert.isTrue(result.test('foo/bar'));
    });

    it('should !match n number of any char at start of string', () => {
      const like = new Like('*foo');
      const result = like.toRegex();
      assert.isFalse(result.test('fooasdf'));
    });

    it('should !match n number of any char mid string', () => {
      const like = new Like('foo*bar');
      const result = like.toRegex();
      assert.isFalse(result.test('foo adsf ba'));
    });

    it('should !match 0 number of any char mid string', () => {
      const like = new Like('foo*bar');
      const result = like.toRegex();
      assert.isFalse(result.test('bar'));
    });

    it('should !match n number of any char at end of string', () => {
      const like = new Like('foo*');
      const result = like.toRegex();
      assert.isFalse(result.test('asdf foo'));
    });

    it('should !match 0 number of any char at end of string', () => {
      const like = new Like('foo*');
      const result = like.toRegex();
      assert.isFalse(result.test('barfoo'));
    });

    it('should !match value within a string', () => {
      const like = new Like('*foo*');
      const result = like.toRegex();
      assert.isFalse(result.test('asdf fo1o ;lkj'));
    });

    it('should !match string', () => {
      const like = new Like('*foo*');
      const result = like.toRegex();
      assert.isFalse(result.test('bar'));
    });

    it('should !match 1 of any char at start of string', () => {
      const like = new Like('_foo');
      const result = like.toRegex();
      assert.isFalse(result.test('foo'));
    });

    it('should !match 1 of any char mid string', () => {
      const like = new Like('foo_bar');
      const result = like.toRegex();
      assert.isFalse(result.test('foobar'));
    });

    it('should !match 1 of any char at end of string', () => {
      const like = new Like('foo_');
      const result = like.toRegex();
      assert.isFalse(result.test('foo@bar'));
    });

    it('should !match 1 of any char at start of string and n at end', () => {
      const like = new Like('_foo*');
      const result = like.toRegex();
      assert.isFalse(result.test('foo bar'));
    });

    it('should !match 1 of any char at start of string and 0 at end', () => {
      const like = new Like('_foo*');
      const result = like.toRegex();
      assert.isFalse(result.test('foo'));
    });

    it('should !match n of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      const result = like.toRegex();
      assert.isFalse(result.test('adsf foo'));
    });

    it('should !match 0 of any char at start of string and 1 at end', () => {
      const like = new Like('*foo_');
      const result = like.toRegex();
      assert.isFalse(result.test('foo'));
    });

    it('should !match n of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      const result = like.toRegex();
      assert.isFalse(result.test('asdf fodobar ;lkj'));
    });

    it('should !match 0 of any char at start and end and 1 mid string', () => {
      const like = new Like('*foo_bar*');
      const result = like.toRegex();
      assert.isFalse(result.test('fodobar'));
    });

    it('should escape * wildcard', () => {
      const like = new Like('foo\\*');
      const result = like.toRegex();
      assert.isTrue(result.test('foo*'));
    });

    it('should escape _ wildcard', () => {
      const like = new Like('\\_foo');
      const result = like.toRegex();
      assert.isTrue(result.test('_foo'));
    });

    it('should match using same RegExp', () => {
      const like = new Like('foo*bar');
      const result = like.toRegex();
      assert.isTrue(result.test('foo / bar'));
      assert.isFalse(result.test('oof / rab'));
    });

    it('should return the same result everytime', () => {
      const like = new Like('*hello \\* World\\__');
      const resultA = like.toRegex();
      const resultB = like.toRegex();
      assert.strictEqual(resultA, resultB);
    });
  });


  describe('#toRegexString', () => {
    it('should convert * to .*', () => {
      const like = new Like('test*');
      const result = like.toRegexString();
      assert.strictEqual(result, '^test.*$');
    });

    it('should escape *', () => {
      const like = new Like('test\\*');
      const result = like.toRegexString();
      assert.strictEqual(result, '^test\\*$');
    });

    it('should convert _ to .{1}', () => {
      const like = new Like('_test');
      const result = like.toRegexString();
      assert.strictEqual(result, '^.{1}test$');
    });

    it('should escape _', () => {
      const like = new Like('te\\_st');
      const result = like.toRegexString();
      assert.strictEqual(result, '^te_st$');
    });

    it('should not escape non-special characters', () => {
      const like = new Like('bl\\ah');
      const result = like.toRegexString();
      assert.strictEqual(result, '^bl\\\\ah$');
    });

    it('should escape \\', () => {
      const like = new Like('\\');
      const result = like.toRegexString();
      assert.strictEqual(result, '^\\\\$');
    });

    it('should return the same result every time', () => {
      const like = new Like('*hello \\* World\\__');
      const resultA = like.toRegexString();
      const resultB = like.toRegexString();
      assert.strictEqual(resultA, resultB);
    });
  });


  describe('#toString', () => {
    it('should return value within ""', () => {
      const value = '_&foo*bar*';
      const like = new Like(value);
      assert.strictEqual(like.toString(), `"${value}"`);
    });

    it('should return escaped value within "" when urlEncode=true', () => {
      const value = '_&foo*bar*';
      const like = new Like(value);
      assert.strictEqual(like.toString(true), '"_%26foo*bar*"');
    });
  });

});
