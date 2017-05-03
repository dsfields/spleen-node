'use strict';

const assert = require('chai').assert;

const errors = require('../../lib/errors');
const Tokenizer = require('../../lib/tokenizer');
const Token = require('../../lib/token');


describe('Tokenizer', () => {

  describe('#constructor', () => {
    it('should throw if value not string', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer(42);
        assert.isNotOk(tokenizer);
      }, TypeError);
    });

    it('should throw if value empty string', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('');
        assert.isNotOk(tokenizer);
      }, TypeError);
    });
  });


  describe('#isStart', () => {
    it('should be true if the tokenizer has not been advanced', () => {
      const tokenizer = new Tokenizer('/foo eq /bar');
      assert.isTrue(tokenizer.isStart);
    });

    it('should be false if tokenizer has been advanced', () => {
      const tokenizer = new Tokenizer('/foo eq /bar');
      tokenizer.next();
      assert.isFalse(tokenizer.isStart);
    });

    it('should be false if tokenizer has been advanced on 1 char value', () => {
      const tokenizer = new Tokenizer('0');
      tokenizer.next();
      assert.isFalse(tokenizer.isStart);
    });
  });


  describe('#isEnd', () => {
    it('should return true if cursor at or past length', () => {
      const tokenizer = new Tokenizer('eq');
      tokenizer.next();
      tokenizer.next();
      assert.isTrue(tokenizer.isEnd);
    });

    it('should return false if cursor before length', () => {
      const tokenizer = new Tokenizer('asdf');
      assert.isFalse(tokenizer.isEnd);
    });
  });


  describe('#next', () => {
    it('should ignore \\ when escaping', () => {
      const tokenizer = new Tokenizer('\\\\asdf');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, '\\asdf');
    });

    it('should return false if at end', () => {
      const tokenizer = new Tokenizer('123');
      tokenizer.next();
      const result = tokenizer.next();
      assert.isFalse(result);
    });

    it('should return true if more to parse', () => {
      const tokenizer = new Tokenizer('123');
      const result = tokenizer.next();
      assert.isTrue(result);
    });

    it('should set token to string literal on ""', () => {
      const tokenizer = new Tokenizer('"asdf"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
    });

    it('should set value to string when encountering string literal', () => {
      const tokenizer = new Tokenizer('"asdf"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should error if string literal not terminated', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('"asdf');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should ignore " when escaping', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('\\"asdf"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should ignore " when escaping in string', () => {
      const tokenizer = new Tokenizer('"as\\"df"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
      assert.strictEqual(tokenizer.current.value, 'as"df');
    });

    it('should ignore " when escaping string terminator', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('"asdf\\"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should include white space in string literals', () => {
      const tokenizer = new Tokenizer('"as df"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.value, 'as df');
    });

    it('should terminate token when encountering white space', () => {
      const tokenizer = new Tokenizer('eq and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should ignore extra white space', () => {
      const tokenizer = new Tokenizer('eq  \t\n\r\vand');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should open target token when encountering /', () => {
      const tokenizer = new Tokenizer('/foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
    });

    it('should set target token to proceding value', () => {
      const tokenizer = new Tokenizer('/foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should include / in string literals', () => {
      const tokenizer = new Tokenizer('"/foo"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
      assert.strictEqual(tokenizer.current.value, '/foo');
    });

    it('should ignore / when escaping', () => {
      const tokenizer = new Tokenizer('\\/eq');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, '/eq');
    });

    it('should error if / encountered with non-string or non-target', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('eq/');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should ignore ( if escaping', () => {
      const tokenizer = new Tokenizer('\\(eq');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, '(eq');
    });

    it('should include ( in string literals', () => {
      const tokenizer = new Tokenizer('"as(df"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
      assert.strictEqual(tokenizer.current.value, 'as(df');
    });

    it('should terminate token on (', () => {
      const tokenizer = new Tokenizer('eq(');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should set token to open group on (', () => {
      const tokenizer = new Tokenizer('(');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.openGroup);
    });

    it('should ingore ) when escaping', () => {
      const tokenizer = new Tokenizer('\\)eq');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, ')eq');
    });

    it('should include ) when nested in string literal', () => {
      const tokenizer = new Tokenizer('"as)df"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
      assert.strictEqual(tokenizer.current.value, 'as)df');
    });

    it('should set token to close group on ) if not in token', () => {
      const tokenizer = new Tokenizer(')and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.closeGroup);
    });

    it('should terminate token on )', () => {
      const tokenizer = new Tokenizer('eq)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should ignore , if escaping', () => {
      const tokenizer = new Tokenizer('\\,eq');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, ',eq');
    });

    it('should included , nested in string linteral', () => {
      const tokenizer = new Tokenizer('"as,df"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
      assert.strictEqual(tokenizer.current.value, 'as,df');
    });

    it('should set token to list delimiter on ,', () => {
      const tokenizer = new Tokenizer(',');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.listDelimiter);
    });

    it('should terminate token on ,', () => {
      const tokenizer = new Tokenizer('eq,');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should ignore [ when escaping', () => {
      const tokenizer = new Tokenizer('\\[eq');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, '[eq');
    });

    it('should include [ when nested in string literal', () => {
      const tokenizer = new Tokenizer('"as[df"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
      assert.strictEqual(tokenizer.current.value, 'as[df');
    });

    it('should set token to open array on [', () => {
      const tokenizer = new Tokenizer('[123');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.openArray);
    });

    it('should terminate token on [', () => {
      const tokenizer = new Tokenizer('eq[123');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should ignore ] if escaping', () => {
      const tokenizer = new Tokenizer('\\[123');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, '[123');
    });

    it('should include ] when nested in string literal', () => {
      const tokenizer = new Tokenizer('"as]df"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.string);
      assert.strictEqual(tokenizer.current.value, 'as]df');
    });

    it('should set token to close array on ]', () => {
      const tokenizer = new Tokenizer(']');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.closeArray);
    });

    it('should terminate token on ]', () => {
      const tokenizer = new Tokenizer('true] and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse Boolean token on true', () => {
      const tokenizer = new Tokenizer('true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true terminated by white space', () => {
      const tokenizer = new Tokenizer('true and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should set error parsing true terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('true"asdf"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse true terminated by (', () => {
      const tokenizer = new Tokenizer('true(asdf');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true terminated by )', () => {
      const tokenizer = new Tokenizer('true) and ');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true terminated by ,', () => {
      const tokenizer = new Tokenizer('true,123]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true terminated by [', () => {
      const tokenizer = new Tokenizer('true[123');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true terminated by ]', () => {
      const tokenizer = new Tokenizer('true] and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true preceded by white space', () => {
      const tokenizer = new Tokenizer(' \u0085\u2004true] and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true preceded by (', () => {
      const tokenizer = new Tokenizer('(true');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true preceded by )', () => {
      const tokenizer = new Tokenizer(')true');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true preceded by ,', () => {
      const tokenizer = new Tokenizer(',true');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true preceded by [', () => {
      const tokenizer = new Tokenizer('[true');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse true preceded by ]', () => {
      const tokenizer = new Tokenizer(']true');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq true\u200D ');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should set error parsing downstream true terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq true" "');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream true terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq true( 123');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq true) and 123');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo in [true,12]) and 123');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq true[');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo in [12,true] and');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo eq true');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq "test"true');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq "test"(true ');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true preceded by )', () => {
      const tokenizer = new Tokenizer('/foo eq "test")true ');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo in [123,true]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true preceded by [', () => {
      const tokenizer = new Tokenizer('/foo in [true,123]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse downstream true preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo in [123]true');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, true);
    });

    it('should parse Boolean token on false', () => {
      const tokenizer = new Tokenizer('false');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false terminated by white space', () => {
      const tokenizer = new Tokenizer('false and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should set error parsing false terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('false"asdf"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse false terminated by (', () => {
      const tokenizer = new Tokenizer('false(asdf');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false terminated by )', () => {
      const tokenizer = new Tokenizer('false) and ');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false terminated by ,', () => {
      const tokenizer = new Tokenizer('false,123]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false terminated by [', () => {
      const tokenizer = new Tokenizer('false[123');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false terminated by ]', () => {
      const tokenizer = new Tokenizer('false] and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false preceded by white space', () => {
      const tokenizer = new Tokenizer(' \u0085\u2004false] and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false preceded by (', () => {
      const tokenizer = new Tokenizer('(false');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false preceded by )', () => {
      const tokenizer = new Tokenizer(')false');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false preceded by ,', () => {
      const tokenizer = new Tokenizer(',false');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false preceded by [', () => {
      const tokenizer = new Tokenizer('[false');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse false preceded by ]', () => {
      const tokenizer = new Tokenizer(']false');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq false\u200D ');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should set error parsing downstream false terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq false" "');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream false terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq false( 123');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq false) and 123');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo in [false,12]) and 123');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq false[');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo in [12,false] and');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq "test"false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq "test"(false ');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false preceded by )', () => {
      const tokenizer = new Tokenizer('/foo eq "test")false ');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo in [123,false]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false preceded by [', () => {
      const tokenizer = new Tokenizer('/foo in [false,123]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse downstream false preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo in [123]false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.boolean);
      assert.strictEqual(tokenizer.current.value, false);
    });

    it('should parse and token', () => {
      const tokenizer = new Tokenizer('and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and terminated by white space', () => {
      const tokenizer = new Tokenizer('and /blah');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should set error when parsing and terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('and"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing and terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('and/test');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse and terminated by (', () => {
      const tokenizer = new Tokenizer('and(/test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and terminated by )', () => {
      const tokenizer = new Tokenizer('and) /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and terminated by ,', () => {
      const tokenizer = new Tokenizer('and) /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and terminated by [', () => {
      const tokenizer = new Tokenizer('and[ /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and terminated by ]', () => {
      const tokenizer = new Tokenizer('and] /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and preceded by white space', () => {
      const tokenizer = new Tokenizer(' \u205Fand /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and preceded by (', () => {
      const tokenizer = new Tokenizer('(and /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and preceded by )', () => {
      const tokenizer = new Tokenizer(')and /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and preceded by ,', () => {
      const tokenizer = new Tokenizer(',and /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and preceded by [', () => {
      const tokenizer = new Tokenizer('[and /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse and preceded by ]', () => {
      const tokenizer = new Tokenizer(']and /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 123 and\u2005/bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should set error when parsing and terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 123 and""');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream and terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 123 and/bar eq false"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream and terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq 123 and(/bar eq false)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq 123 and)/bar eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 123 and, /bar eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq 123 and[1,2] eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 123 and]eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq "123"and]eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq 123 (and eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and preceded by )', () => {
      const tokenizer = new Tokenizer('/foo eq 123 )and eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 123 ,and eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and preceded by [', () => {
      const tokenizer = new Tokenizer('/foo eq 123 [and eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse downstream and preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 123 ]and eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.and);
    });

    it('should parse or token', () => {
      const tokenizer = new Tokenizer('or');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or terminated by white space', () => {
      const tokenizer = new Tokenizer('or /blah');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should set error when parsing or terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('or"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing or terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('or/test');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse or terminated by (', () => {
      const tokenizer = new Tokenizer('or(/test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or terminated by )', () => {
      const tokenizer = new Tokenizer('or) /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or terminated by ,', () => {
      const tokenizer = new Tokenizer('or) /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or terminated by [', () => {
      const tokenizer = new Tokenizer('or[ /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or terminated by ]', () => {
      const tokenizer = new Tokenizer('or] /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or preceded by white space', () => {
      const tokenizer = new Tokenizer(' \u205For /test');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or preceded by (', () => {
      const tokenizer = new Tokenizer('(or /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or preceded by )', () => {
      const tokenizer = new Tokenizer(')or /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or preceded by ,', () => {
      const tokenizer = new Tokenizer(',or /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or preceded by [', () => {
      const tokenizer = new Tokenizer('[or /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse or preceded by ]', () => {
      const tokenizer = new Tokenizer(']or /test');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 123 or\u2005/bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should set error when parsing or terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 123 or""');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream or terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 123 or/bar eq false"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream or terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq 123 or(/bar eq false)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq 123 or)/bar eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 123 or, /bar eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq 123 or[1,2] eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 123 or]eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq "123"or]eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq 123 (or eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or preceded by )', () => {
      const tokenizer = new Tokenizer('/foo eq 123 )or eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 123 ,or eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or preceded by [', () => {
      const tokenizer = new Tokenizer('/foo eq 123 [or eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse downstream or preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 123 ]or eq /bar');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.or);
    });

    it('should parse eq token', () => {
      const tokenizer = new Tokenizer('eq');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq terminated by white space', () => {
      const tokenizer = new Tokenizer('eq\uFEFF42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should set error parsing eq terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('eq"42"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parseing eq terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('eq/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse eq terminated by (', () => {
      const tokenizer = new Tokenizer('eq(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq terminated by )', () => {
      const tokenizer = new Tokenizer('eq) and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq terminated by ,', () => {
      const tokenizer = new Tokenizer('eq,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq terminated by [', () => {
      const tokenizer = new Tokenizer('eq[42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq terminated by ]', () => {
      const tokenizer = new Tokenizer('eq]42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq preceded by white space', () => {
      const tokenizer = new Tokenizer('\u3000\u200Aeq 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq preceded by "', () => {
      const tokenizer = new Tokenizer('"test"eq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq preceded by (', () => {
      const tokenizer = new Tokenizer('(eq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq preceded by )', () => {
      const tokenizer = new Tokenizer(')eq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq preceded by ,', () => {
      const tokenizer = new Tokenizer(',eq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq preceded by [', () => {
      const tokenizer = new Tokenizer('[eq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse eq preceded by ]', () => {
      const tokenizer = new Tokenizer(']eq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar eq\u202842 or /baz  eq  24');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should set error parsing downstream eq terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar eq"test" or /baz eq false');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream eq terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar eq/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream eq terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/bar eq(42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/bar eq)42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar eq,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/bar eq[42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar eq]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar eq]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq preceded by "', () => {
      const tokenizer = new Tokenizer('"test"eq /foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq preceded by (', () => {
      const tokenizer = new Tokenizer('/foo/bar eq 42 or (eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq preceded by )', () => {
      const tokenizer = new Tokenizer('/foo/bar eq 42 or )eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar eq 42 or ,eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq preceded by [', () => {
      const tokenizer = new Tokenizer('/foo/bar eq 42 or [eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse downstream eq preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar eq 42 or ]eq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.eq);
    });

    it('should parse neq token', () => {
      const tokenizer = new Tokenizer('neq');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq terminated by white space', () => {
      const tokenizer = new Tokenizer('neq\uFEFF42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should set error parsing neq terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('neq"42"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parseing neq terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('neq/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse neq terminated by (', () => {
      const tokenizer = new Tokenizer('neq(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq terminated by )', () => {
      const tokenizer = new Tokenizer('neq) and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq terminated by ,', () => {
      const tokenizer = new Tokenizer('neq,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq terminated by [', () => {
      const tokenizer = new Tokenizer('neq[42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq terminated by ]', () => {
      const tokenizer = new Tokenizer('neq]42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq preceded by white space', () => {
      const tokenizer = new Tokenizer('\u3000\u200Aneq 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq preceded by "', () => {
      const tokenizer = new Tokenizer('"test"neq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq preceded by (', () => {
      const tokenizer = new Tokenizer('(neq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq preceded by )', () => {
      const tokenizer = new Tokenizer(')neq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq preceded by ,', () => {
      const tokenizer = new Tokenizer(',neq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq preceded by [', () => {
      const tokenizer = new Tokenizer('[neq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse neq preceded by ]', () => {
      const tokenizer = new Tokenizer(']neq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar neq\u202842 or /baz  neq  24');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should set error parsing downstream neq terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar neq"test" or /baz neq false');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream neq terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar neq/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream neq terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/bar neq(42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/bar neq)42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar neq,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/bar neq[42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar neq]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar neq]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq preceded by "', () => {
      const tokenizer = new Tokenizer('"test"neq /foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq preceded by (', () => {
      const tokenizer = new Tokenizer('/foo/bar neq 42 or (neq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq preceded by )', () => {
      const tokenizer = new Tokenizer('/foo/bar neq 42 or )neq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar neq 42 or ,neq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq preceded by [', () => {
      const tokenizer = new Tokenizer('/foo/bar neq 42 or [neq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse downstream neq preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar neq 42 or ]neq false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.neq);
    });

    it('should parse gt token', () => {
      const tokenizer = new Tokenizer('gt');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt terminated by white space', () => {
      const tokenizer = new Tokenizer('gt\uFEFF42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should set error parsing gt terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('gt"42"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parseing gt terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('gt/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse gt terminated by (', () => {
      const tokenizer = new Tokenizer('gt(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt terminated by )', () => {
      const tokenizer = new Tokenizer('gt) and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt terminated by ,', () => {
      const tokenizer = new Tokenizer('gt,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt terminated by [', () => {
      const tokenizer = new Tokenizer('gt[42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt terminated by ]', () => {
      const tokenizer = new Tokenizer('gt]42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt preceded by white space', () => {
      const tokenizer = new Tokenizer('\u3000\u200Agt 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt preceded by "', () => {
      const tokenizer = new Tokenizer('"test"gt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt preceded by (', () => {
      const tokenizer = new Tokenizer('(gt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt preceded by )', () => {
      const tokenizer = new Tokenizer(')gt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt preceded by ,', () => {
      const tokenizer = new Tokenizer(',gt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt preceded by [', () => {
      const tokenizer = new Tokenizer('[gt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gt preceded by ]', () => {
      const tokenizer = new Tokenizer(']gt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar gt\u202842 or /baz  gt  24');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should set error parsing downstream gt terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar gt"test" or /baz gt false');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream gt terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar gt/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream gt terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/bar gt(42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/bar gt)42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar gt,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/bar gt[42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar gt]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar gt]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt preceded by "', () => {
      const tokenizer = new Tokenizer('"test"gt /foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt preceded by (', () => {
      const tokenizer = new Tokenizer('/foo/bar gt 42 or (gt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt preceded by )', () => {
      const tokenizer = new Tokenizer('/foo/bar gt 42 or )gt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar gt 42 or ,gt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt preceded by [', () => {
      const tokenizer = new Tokenizer('/foo/bar gt 42 or [gt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse downstream gt preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar gt 42 or ]gt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gt);
    });

    it('should parse gte token', () => {
      const tokenizer = new Tokenizer('gte');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte terminated by white space', () => {
      const tokenizer = new Tokenizer('gte\uFEFF42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should set error parsing gte terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('gte"42"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parseing gte terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('gte/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse gte terminated by (', () => {
      const tokenizer = new Tokenizer('gte(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte terminated by )', () => {
      const tokenizer = new Tokenizer('gte) and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte terminated by ,', () => {
      const tokenizer = new Tokenizer('gte,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte terminated by [', () => {
      const tokenizer = new Tokenizer('gte[42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte terminated by ]', () => {
      const tokenizer = new Tokenizer('gte]42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte preceded by white space', () => {
      const tokenizer = new Tokenizer('\u3000\u200Agte 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte preceded by "', () => {
      const tokenizer = new Tokenizer('"test"gte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte preceded by (', () => {
      const tokenizer = new Tokenizer('(gte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte preceded by )', () => {
      const tokenizer = new Tokenizer(')gte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte preceded by ,', () => {
      const tokenizer = new Tokenizer(',gte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte preceded by [', () => {
      const tokenizer = new Tokenizer('[gte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse gte preceded by ]', () => {
      const tokenizer = new Tokenizer(']gte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar gte\u202842 or /baz  gte  24');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should set error parsing downstream gte terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar gte"test" or /baz gte false');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream gte terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar gte/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream gte terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/bar gte(42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/bar gte)42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar gte,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/bar gte[42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar gte]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar gte]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte preceded by "', () => {
      const tokenizer = new Tokenizer('"test"gte /foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte preceded by (', () => {
      const tokenizer = new Tokenizer('/foo/bar gte 42 or (gte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte preceded by )', () => {
      const tokenizer = new Tokenizer('/foo/bar gte 42 or )gte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar gte 42 or ,gte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte preceded by [', () => {
      const tokenizer = new Tokenizer('/foo/bar gte 42 or [gte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse downstream gte preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar gte 42 or ]gte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.gte);
    });

    it('should parse lt token', () => {
      const tokenizer = new Tokenizer('lt');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt terminated by white space', () => {
      const tokenizer = new Tokenizer('lt\uFEFF42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should set error parsing lt terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('lt"42"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parseing lt terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('lt/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse lt terminated by (', () => {
      const tokenizer = new Tokenizer('lt(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt terminated by )', () => {
      const tokenizer = new Tokenizer('lt) and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt terminated by ,', () => {
      const tokenizer = new Tokenizer('lt,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt terminated by [', () => {
      const tokenizer = new Tokenizer('lt[42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt terminated by ]', () => {
      const tokenizer = new Tokenizer('lt]42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt preceded by white space', () => {
      const tokenizer = new Tokenizer('\u3000\u200Alt 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt preceded by "', () => {
      const tokenizer = new Tokenizer('"test"lt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt preceded by (', () => {
      const tokenizer = new Tokenizer('(lt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt preceded by )', () => {
      const tokenizer = new Tokenizer(')lt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt preceded by ,', () => {
      const tokenizer = new Tokenizer(',lt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt preceded by [', () => {
      const tokenizer = new Tokenizer('[lt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lt preceded by ]', () => {
      const tokenizer = new Tokenizer(']lt 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar lt\u202842 or /baz  lt  24');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should set error parsing downstream lt terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar lt"test" or /baz lt false');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream lt terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar lt/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream lt terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/bar lt(42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/bar lt)42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar lt,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/bar lt[42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar lt]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar lt]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt preceded by "', () => {
      const tokenizer = new Tokenizer('"test"lt /foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt preceded by (', () => {
      const tokenizer = new Tokenizer('/foo/bar lt 42 or (lt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt preceded by )', () => {
      const tokenizer = new Tokenizer('/foo/bar lt 42 or )lt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar lt 42 or ,lt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt preceded by [', () => {
      const tokenizer = new Tokenizer('/foo/bar lt 42 or [lt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse downstream lt preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar lt 42 or ]lt false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lt);
    });

    it('should parse lte token', () => {
      const tokenizer = new Tokenizer('lte');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte terminated by white space', () => {
      const tokenizer = new Tokenizer('lte\uFEFF42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should set error parsing lte terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('lte"42"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parseing lte terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('lte/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse lte terminated by (', () => {
      const tokenizer = new Tokenizer('lte(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte terminated by )', () => {
      const tokenizer = new Tokenizer('lte) and');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte terminated by ,', () => {
      const tokenizer = new Tokenizer('lte,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte terminated by [', () => {
      const tokenizer = new Tokenizer('lte[42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte terminated by ]', () => {
      const tokenizer = new Tokenizer('lte]42,24]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte preceded by white space', () => {
      const tokenizer = new Tokenizer('\u3000\u200Alte 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte preceded by "', () => {
      const tokenizer = new Tokenizer('"test"lte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte preceded by (', () => {
      const tokenizer = new Tokenizer('(lte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte preceded by )', () => {
      const tokenizer = new Tokenizer(')lte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte preceded by ,', () => {
      const tokenizer = new Tokenizer(',lte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte preceded by [', () => {
      const tokenizer = new Tokenizer('[lte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse lte preceded by ]', () => {
      const tokenizer = new Tokenizer(']lte 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar lte\u202842 or /baz  lte  24');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should set error parsing downstream lte terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar lte"test" or /baz lte false');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream lte terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/bar lte/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream lte terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/bar lte(42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/bar lte)42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar lte,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/bar lte[42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar lte]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar lte]42,24]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte preceded by "', () => {
      const tokenizer = new Tokenizer('"test"lte /foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte preceded by (', () => {
      const tokenizer = new Tokenizer('/foo/bar lte 42 or (lte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte preceded by )', () => {
      const tokenizer = new Tokenizer('/foo/bar lte 42 or )lte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar lte 42 or ,lte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte preceded by [', () => {
      const tokenizer = new Tokenizer('/foo/bar lte 42 or [lte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse downstream lte preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar lte 42 or ]lte false');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.lte);
    });

    it('should parse in token', () => {
      const tokenizer = new Tokenizer('in');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in terminated by white space', () => {
      const tokenizer = new Tokenizer('in\u2008 ');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should set error parsing in terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('in"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing in terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('in/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse in terminated by (', () => {
      const tokenizer = new Tokenizer('in(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in terminated by )', () => {
      const tokenizer = new Tokenizer('in)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in terminated by ,', () => {
      const tokenizer = new Tokenizer('in,true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in terminated by [', () => {
      const tokenizer = new Tokenizer('in[42,"foo"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in terminated by ]', () => {
      const tokenizer = new Tokenizer('in]42,"foo"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in preceded by white space', () => {
      const tokenizer = new Tokenizer('\u200Cin [42,"foo"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in preceded by "', () => {
      const tokenizer = new Tokenizer('"foo"in [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in preceded by (', () => {
      const tokenizer = new Tokenizer('(in [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in preceded by )', () => {
      const tokenizer = new Tokenizer(')in [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in preceded by ,', () => {
      const tokenizer = new Tokenizer(',in [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in preceded by [', () => {
      const tokenizer = new Tokenizer('[in [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse in preceded by ]', () => {
      const tokenizer = new Tokenizer(']in [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar in\f[1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should set error parsing downstream in terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar in"test"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream in terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar in/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream in terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar in(1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar in)1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar in,1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar in[1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar in]1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar\u2060in [1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and "test"in ["test",2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and (in [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in preceded by )', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and )in [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and ,in [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in preceded by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and [in [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse downstream in preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and ]in [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.in);
    });

    it('should parse nin token', () => {
      const tokenizer = new Tokenizer('nin');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin terminated by white space', () => {
      const tokenizer = new Tokenizer('nin\u2008 ');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should set error parsning nin terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('nin"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsning nin terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('nin/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse nin terminated by (', () => {
      const tokenizer = new Tokenizer('nin(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin terminated by )', () => {
      const tokenizer = new Tokenizer('nin)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin terminated by ,', () => {
      const tokenizer = new Tokenizer('nin,true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin terminated by [', () => {
      const tokenizer = new Tokenizer('nin[42,"foo"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin terminated by ]', () => {
      const tokenizer = new Tokenizer('nin]42,"foo"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin preceded by white space', () => {
      const tokenizer = new Tokenizer('\u200Cnin [42,"foo"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin preceded by "', () => {
      const tokenizer = new Tokenizer('"foo"nin [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin preceded by (', () => {
      const tokenizer = new Tokenizer('(nin [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin preceded by )', () => {
      const tokenizer = new Tokenizer(')nin [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin preceded by ,', () => {
      const tokenizer = new Tokenizer(',nin [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin preceded by [', () => {
      const tokenizer = new Tokenizer('[nin [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse nin preceded by ]', () => {
      const tokenizer = new Tokenizer(']nin [42,"foo"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nin\f[1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should set error parsning downstream nin terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar nin"test"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsning downstream nin terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar nin/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream nin terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nin(1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nin)1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nin,1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nin[1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nin]1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar\u2060nin [1,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and "test"nin ["test",2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and (nin [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin preceded by )', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and )nin [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and ,nin [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin preceded by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and [nin [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse downstream nin preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and ]nin [1,2])');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nin);
    });

    it('should parse between token', () => {
      const tokenizer = new Tokenizer('between');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between terminated by white space', () => {
      const tokenizer = new Tokenizer('between\0 24,42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should set error parsing between terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('between"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing between terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('between/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse between terminated by (', () => {
      const tokenizer = new Tokenizer('between(24,42)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between terminated by )', () => {
      const tokenizer = new Tokenizer('between)24,42)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between terminated by ,', () => {
      const tokenizer = new Tokenizer('between,24,42)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between terminated by [', () => {
      const tokenizer = new Tokenizer('between[24,42]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between terminated by ]', () => {
      const tokenizer = new Tokenizer('between]24,42]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between preceded by white space', () => {
      const tokenizer = new Tokenizer('\u200Bbetween 24,42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between preceded by "', () => {
      const tokenizer = new Tokenizer('"test"between 24,42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between preceded by (', () => {
      const tokenizer = new Tokenizer('(between 24,42)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between preceded by )', () => {
      const tokenizer = new Tokenizer(')between 24,42)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between preceded by ,', () => {
      const tokenizer = new Tokenizer(',between 24,42)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between preceded by [', () => {
      const tokenizer = new Tokenizer('[between 24,42]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse between preceded by ]', () => {
      const tokenizer = new Tokenizer(']between 24,42]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar between\u180E24,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should set error parsing downstream between terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar between"a","z"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream between terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar between/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream between terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar between(24,42)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar between)24,42)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar between,24,42)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar between[24,42]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar between]24,42]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar\u202Fbetween 24,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and "e"between "a","z"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar (between 1,9)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between preceded by )', () => {
      const tokenizer = new Tokenizer('(/foo eq 42 and /bar)between 1,9');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar,between 1,9');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between preceded by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar [between 1,9]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse downstream between preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and [3]between 1,9');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.between);
    });

    it('should parse nbetween token', () => {
      const tokenizer = new Tokenizer('nbetween');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween terminated by white space', () => {
      const tokenizer = new Tokenizer('nbetween\0 24,42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should set error parsing nbetween terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('nbetween"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing nbetween terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('nbetween/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse nbetween terminated by (', () => {
      const tokenizer = new Tokenizer('nbetween(24,42)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween terminated by )', () => {
      const tokenizer = new Tokenizer('nbetween)24,42)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween terminated by ,', () => {
      const tokenizer = new Tokenizer('nbetween,24,42)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween terminated by [', () => {
      const tokenizer = new Tokenizer('nbetween[24,42]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween terminated by ]', () => {
      const tokenizer = new Tokenizer('nbetween]24,42]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween preceded by white space', () => {
      const tokenizer = new Tokenizer('\u200Bnbetween 24,42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween preceded by "', () => {
      const tokenizer = new Tokenizer('"test"nbetween 24,42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween preceded by (', () => {
      const tokenizer = new Tokenizer('(nbetween 24,42)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween preceded by )', () => {
      const tokenizer = new Tokenizer(')nbetween 24,42)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween preceded by ,', () => {
      const tokenizer = new Tokenizer(',nbetween 24,42)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween preceded by [', () => {
      const tokenizer = new Tokenizer('[nbetween 24,42]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse nbetween preceded by ]', () => {
      const tokenizer = new Tokenizer(']nbetween 24,42]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween\u180E2,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should set error parsing downstream nbetween terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween"a","z"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream nbetween terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream nbetween terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween(24,42)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween terminated by )', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween)24,42)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween,24,42)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween[24,42]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar nbetween]24,42]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar\u202Fnbetween 2,42');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and "e"nbetween "a","z"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar (nbetween 1,9)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween preceded by )', () => {
      const tokenizer = new Tokenizer('(/foo eq 42 and /bar)nbetween 1,9');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar,nbetween 1,9');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween preceded by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and /bar [nbetween 1,9]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse downstream nbetween preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and [3]nbetween 1,9');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nbetween);
    });

    it('should parse like token', () => {
      const tokenizer = new Tokenizer('like');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like terminated by white space', () => {
      const tokenizer = new Tokenizer('like\u2029"*blah"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should set error parsing like terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('like"*blah"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse like terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('like/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse like terminated by (', () => {
      const tokenizer = new Tokenizer('like("*blah")');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like terminated by )', () => {
      const tokenizer = new Tokenizer('like)"*blah")');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like terminated by ,', () => {
      const tokenizer = new Tokenizer('like,"*blah"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like terminated by [', () => {
      const tokenizer = new Tokenizer('like["*blah"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like terminated by ]', () => {
      const tokenizer = new Tokenizer('like]"*blah"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like preceded by white space', () => {
      const tokenizer = new Tokenizer('\u2009like "*blah"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like preceded by "', () => {
      const tokenizer = new Tokenizer('"foobar"like "*bar"');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like preceded by (', () => {
      const tokenizer = new Tokenizer('(like "*bar")');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like preceded by )', () => {
      const tokenizer = new Tokenizer(')like "*bar")');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like preceded by ,', () => {
      const tokenizer = new Tokenizer(',like "*bar"');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like preceded by [', () => {
      const tokenizer = new Tokenizer('[like "*bar"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse like preceded by ]', () => {
      const tokenizer = new Tokenizer('["foobar"]like "*bar"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar like\u2007"bl_h"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should set error parsing downstream like terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo gt 42 and /bar like"bl_h"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream like terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo gt 42 and /bar like/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream like terminated by (', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar like("b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like terminated by )', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar like)"b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar like,"b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like terminated by [', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar like["b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar like]"b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar\u2006like "b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like preceded by "', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and "bxahasdf"like "b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like preceded by (', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar (like "b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like preceded by )', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar )like "b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar ,like "b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like preceded by [', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar [like "b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse downstream like preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar ]like "b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.like);
    });

    it('should parse nlike token', () => {
      const tokenizer = new Tokenizer('nlike');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike terminated by white space', () => {
      const tokenizer = new Tokenizer('nlike\u2029"*blah"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should set error parsing nlike terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('nlike"*blah"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse nlike terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('nlike/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse nlike terminated by (', () => {
      const tokenizer = new Tokenizer('nlike("*blah")');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike terminated by )', () => {
      const tokenizer = new Tokenizer('nlike)"*blah")');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike terminated by ,', () => {
      const tokenizer = new Tokenizer('nlike,"*blah"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike terminated by [', () => {
      const tokenizer = new Tokenizer('nlike["*blah"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike terminated by ]', () => {
      const tokenizer = new Tokenizer('nlike]"*blah"]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike preceded by white space', () => {
      const tokenizer = new Tokenizer('\u2009nlike "*blah"');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike preceded by "', () => {
      const tokenizer = new Tokenizer('"foobar"nlike "*bar"');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike preceded by (', () => {
      const tokenizer = new Tokenizer('(nlike "*bar")');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike preceded by )', () => {
      const tokenizer = new Tokenizer(')nlike "*bar")');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike preceded by ,', () => {
      const tokenizer = new Tokenizer(',nlike "*bar"');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike preceded by [', () => {
      const tokenizer = new Tokenizer('[nlike "*bar"]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse nlike preceded by ]', () => {
      const tokenizer = new Tokenizer('["foobar"]nlike "*bar"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike\u2007"bl_h"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should set error parsing downstream nlike terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike"bl_h"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream nlike terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike/baz');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream nlike terminated by (', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike("b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike terminated by )', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike)"b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike,"b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike terminated by [', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike["b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar nlike]"b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and /bar\u2006nlike "b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike preceded by "', () => {
      const tokenizer = new Tokenizer('/foo gt 42 and "bxahasdf"nlike "b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike preceded by (', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar (nlike "b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike preceded by )', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar )nlike "b_ah*")');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar ,nlike "b_ah*"');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike preceded by [', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar [nlike "b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse downstream nlike preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo gt 42 or /bar ]nlike "b_ah*"]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.nlike);
    });

    it('should parse number token', () => {
      const tokenizer = new Tokenizer('4204');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 4204);
    });

    it('should parse hex number token', () => {
      const tokenizer = new Tokenizer('0xFE');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 0xFE);
    });

    it('should parse oct number token', () => {
      const tokenizer = new Tokenizer('0o36');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 0o36);
    });

    it('should parse binary number token', () => {
      const tokenizer = new Tokenizer('0b0010010');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 0b0010010);
    });

    it('should parse number terminated by white space', () => {
      const tokenizer = new Tokenizer('42\u2003eq/foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should set error parsing number terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('42"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing number terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('42"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse number terminated by (', () => {
      const tokenizer = new Tokenizer('42(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number terminated by )', () => {
      const tokenizer = new Tokenizer('42)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number terminated by ,', () => {
      const tokenizer = new Tokenizer('42,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number terminated by [', () => {
      const tokenizer = new Tokenizer('42[true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number terminated by ]', () => {
      const tokenizer = new Tokenizer('42]true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number preceded by white space', () => {
      const tokenizer = new Tokenizer('\u2002\u200142 eq /foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number preceded by "', () => {
      const tokenizer = new Tokenizer('"test"42 eq /foo');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number preceded by (', () => {
      const tokenizer = new Tokenizer('(42 eq /foo)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number preceded by )', () => {
      const tokenizer = new Tokenizer(')42 eq /foo)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number preceded by ,', () => {
      const tokenizer = new Tokenizer(',42 eq /foo');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number preceded by [', () => {
      const tokenizer = new Tokenizer('[42 eq /foo]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse number preceded by ]', () => {
      const tokenizer = new Tokenizer(']42 eq /foo]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo neq "test" or /bar in [42\u2000]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should set error parsing downstream number terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo neq "test" or /bar eq 42"test"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing downstream number terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo neq "test" or /bar eq 42"test"');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream number terminated by (', () => {
      const tokenizer = new Tokenizer('/foo neq "test" or /bar eq 42(true)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number terminated by )', () => {
      const tokenizer = new Tokenizer('(/foo neq "test" or /bar eq 42) and');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number terminated by ,', () => {
      const tokenizer = new Tokenizer('(/foo neq "test" or /bar eq 42, and');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number terminated by [', () => {
      const tokenizer = new Tokenizer('(/foo neq "test" or /bar eq 42[ and');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo neq "test" or /bar in [1,3,42]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo neq "test" or /bar eq\u168042 and');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number preceded by "', () => {
      const tokenizer = new Tokenizer('/foo neq "test" or /bar eq "test"42 or');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number preceded by (', () => {
      const tokenizer = new Tokenizer('/foo neq "test" or (42 gt /bar)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number preceded by )', () => {
      const tokenizer = new Tokenizer('/foo neq "test" or )42 gt /bar)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo neq "a" or /bar in [1,42,56]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number preceded by [', () => {
      const tokenizer = new Tokenizer('/foo neq "a" or /bar in [42,1,56]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse downstream number preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo neq "a" or /bar in ]42,1,56]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.number);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse unknown token', () => {
      const tokenizer = new Tokenizer('asdf');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown terminated by white space', () => {
      const tokenizer = new Tokenizer('asdf\u00A0 true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should set error parsing unknown terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('asdf"test"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parse unknown terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('asdf/foo');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse unknown terminated by (', () => {
      const tokenizer = new Tokenizer('asdf(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown terminated by )', () => {
      const tokenizer = new Tokenizer('asdf)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown terminated by ,', () => {
      const tokenizer = new Tokenizer('asdf,true');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown terminated by [', () => {
      const tokenizer = new Tokenizer('asdf[true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown terminated by ]', () => {
      const tokenizer = new Tokenizer('asdf]true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown preceded by white space', () => {
      const tokenizer = new Tokenizer('  \r\tasdf');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown preceded by "', () => {
      const tokenizer = new Tokenizer('"test"asdf');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown preceded by (', () => {
      const tokenizer = new Tokenizer('(asdf)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown preceded by )', () => {
      const tokenizer = new Tokenizer(')asdf)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown preceded by ,', () => {
      const tokenizer = new Tokenizer(',asdf true');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown preceded by [', () => {
      const tokenizer = new Tokenizer('[asdf]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse unknown preceded by ]', () => {
      const tokenizer = new Tokenizer(']asdf]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse downstream unknown terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 and asdf\u2008 neq true');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should set error parsing downstream unknown terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and asdf"test" neq true');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream unknown terminated by /', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo eq 42 and asdf/bar neq true');
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should parse downstream unknown terminated by (', () => {
      const tokenizer = new Tokenizer('/foo eq a22sdf(/bar neq true)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'a22sdf');
    });

    it('should parse downstream unknown terminated by )', () => {
      const tokenizer = new Tokenizer('(/foo eq 42)a22sdf! neq true)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'a22sdf!');
    });

    it('should parse downstream unknown terminated by ,', () => {
      const tokenizer = new Tokenizer('(/foo eq 42 or a22sdf#, neq true)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'a22sdf#');
    });

    it('should parse downstream unknown terminated by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or a22sdf#[/bar neq true]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'a22sdf#');
    });

    it('should parse downstream unknown terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or a22sdf#]/bar neq true]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'a22sdf#');
    });

    it('should parse downstream unknown preceded by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or \uFEFFa2sdf# neq true]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'a2sdf#');
    });

    it('should parse downstream unknown preceded by "', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or /bar gt 2 "test"asdf and');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse downstream unknown preceded by (', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or (asdf gte 32)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse downstream unknown preceded by )', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or )asdf gte 32)');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'asdf');
    });

    it('should parse downstream unknown preceded by ,', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or /bar in [2,as32df]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'as32df');
    });

    it('should parse downstream unknown preceded by [', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or /bar in [as32df,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'as32df');
    });

    it('should parse downstream unknown preceded by ]', () => {
      const tokenizer = new Tokenizer('/foo eq 42 or /bar in ]as32df,2]');
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.unknown);
      assert.strictEqual(tokenizer.current.value, 'as32df');
    });

    it('should parse root target', () => {
      const tokenizer = new Tokenizer('/');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target terminated by white space', () => {
      const tokenizer = new Tokenizer('/ ');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should error on zero-length target next to target indicator', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('//');
        tokenizer.next();
        tokenizer.next();
      });
    });

    it('should parse target', () => {
      const tokenizer = new Tokenizer('/foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target', () => {
      const tokenizer = new Tokenizer('/foo/bar');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse 3 part target', () => {
      const tokenizer = new Tokenizer('/foo/bar/baz');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'baz');
    });

    it('should parse numeric target', () => {
      const tokenizer = new Tokenizer('/2');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse numeric target succeded by string target', () => {
      const tokenizer = new Tokenizer('/42/bar');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 42);
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target succeded by numeric target', () => {
      const tokenizer = new Tokenizer('/42/24');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 42);
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 24);
    });

    it('should parse string target succeded by numeric target', () => {
      const tokenizer = new Tokenizer('/foo/42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 42);
    });

    it('should parse root target preceded by white space', () => {
      const tokenizer = new Tokenizer(' /');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target preceded by white space', () => {
      const tokenizer = new Tokenizer('\n\t /foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target preceded by white space', () => {
      const tokenizer = new Tokenizer(' \r\v/foo/bar');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target preceded by white space', () => {
      const tokenizer = new Tokenizer('  /2');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey', () => {
      const tokenizer = new Tokenizer('/foo/');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target preceded by (', () => {
      const tokenizer = new Tokenizer('(/');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target preceded by (', () => {
      const tokenizer = new Tokenizer('(/foo');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target preceded by (', () => {
      const tokenizer = new Tokenizer('(/foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target preceded by (', () => {
      const tokenizer = new Tokenizer('(/2');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey of numeric', () => {
      const tokenizer = new Tokenizer('/2/');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target preceded by )', () => {
      const tokenizer = new Tokenizer(')/');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target preceded by )', () => {
      const tokenizer = new Tokenizer(')/foo');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target preceded by )', () => {
      const tokenizer = new Tokenizer(')/foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target preceded by )', () => {
      const tokenizer = new Tokenizer(')/2');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse root target preceded by ,', () => {
      const tokenizer = new Tokenizer(',/');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target preceded by ,', () => {
      const tokenizer = new Tokenizer(',/foo');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target preceded by ,', () => {
      const tokenizer = new Tokenizer(',/foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target preceded by ,', () => {
      const tokenizer = new Tokenizer(',/2');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse root target preceded by [', () => {
      const tokenizer = new Tokenizer('[/');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target preceded by [', () => {
      const tokenizer = new Tokenizer('[/foo');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target preceded by [', () => {
      const tokenizer = new Tokenizer('[/foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target preceded by [', () => {
      const tokenizer = new Tokenizer('[/2');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse root target preceded by ]', () => {
      const tokenizer = new Tokenizer(']/');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target preceded by ]', () => {
      const tokenizer = new Tokenizer(']/foo');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target preceded by ]', () => {
      const tokenizer = new Tokenizer(']/foo/bar');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target preceded by ]', () => {
      const tokenizer = new Tokenizer(']/2');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse target terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo eq 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/bar eq 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target terminated by white space', () => {
      const tokenizer = new Tokenizer('/2 eq 42');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey terminated by white space', () => {
      const tokenizer = new Tokenizer('/foo/ eq 42');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target terminated by (', () => {
      const tokenizer = new Tokenizer('/(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target terminated by (', () => {
      const tokenizer = new Tokenizer('/foo(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/bar(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target terminated by (', () => {
      const tokenizer = new Tokenizer('/2(true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey terminated by (', () => {
      const tokenizer = new Tokenizer('/foo/(true)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target terminated by )', () => {
      const tokenizer = new Tokenizer('/)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target terminated by )', () => {
      const tokenizer = new Tokenizer('/foo)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/bar)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target terminated by )', () => {
      const tokenizer = new Tokenizer('/2)true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey terminated by )', () => {
      const tokenizer = new Tokenizer('/foo/)true)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target terminated by ,', () => {
      const tokenizer = new Tokenizer('/,true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo,true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/bar,true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target terminated by ,', () => {
      const tokenizer = new Tokenizer('/2,true)');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey terminated by ,', () => {
      const tokenizer = new Tokenizer('/foo/,true)');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target terminated by [', () => {
      const tokenizer = new Tokenizer('/[true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target terminated by [', () => {
      const tokenizer = new Tokenizer('/foo[true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/bar[true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target terminated by [', () => {
      const tokenizer = new Tokenizer('/2[true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey terminated by [', () => {
      const tokenizer = new Tokenizer('/foo/[true]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse root target terminated by ]', () => {
      const tokenizer = new Tokenizer('/]true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should parse target terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo]true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
    });

    it('should parse 2 part target terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/bar]true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'foo');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 'bar');
    });

    it('should parse numeric target terminated by ]', () => {
      const tokenizer = new Tokenizer('/2]true]');
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, 2);
    });

    it('should parse blank target subkey terminated by ]', () => {
      const tokenizer = new Tokenizer('/foo/]true]');
      tokenizer.next();
      tokenizer.next();
      assert.strictEqual(tokenizer.current.type, Token.target);
      assert.strictEqual(tokenizer.current.value, '');
    });

    it('should set error parsing root target terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/"asdf"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing target terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo"asdf"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing numeric target terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/2"asdf"');
        tokenizer.next();
      }, errors.ParserError);
    });

    it('should set error parsing blank target subkey terminated by "', () => {
      assert.throws(() => {
        const tokenizer = new Tokenizer('/foo/"asdf"');
        tokenizer.next();
        tokenizer.next();
      }, errors.ParserError);
    });
  });

});
