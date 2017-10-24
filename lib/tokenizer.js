'use strict';

const elv = require('elv');

const errors = require('./errors');
const Token = require('./token');


class Tokenizer {

  constructor(value) {
    if (typeof value !== 'string' || value.length === 0)
      throw new TypeError('Argument "value" must be a non-empty string');

    this.cursor = 0;
    this.current = null;
    this.value = value;
  }


  get isStart() { return this.cursor === 0 || this.current === null; }

  get isEnd() {
    return (this.cursor >= this.value.length
      && this.current.type === Token.none);
  }


  error(data) {
    const val = elv.coalesce(
      data,
      this.current,
      { value: 'undefined' }
    ).value.toString();

    const pos = this.cursor - val.length;

    const msg = 'Unexpected token "'
      + val
      + '" at position '
      + pos.toString();

    return new errors.ParserError(msg, pos);
  }


  static _analyze(value) {
    switch (value) {
      case 'true':
        return {
          type: Token.boolean,
          value: true,
        };

      case 'false':
        return {
          type: Token.boolean,
          value: false,
        };

      case 'nil':
        return {
          type: Token.nil,
          value: null,
        };

      case 'and':
        return {
          type: Token.and,
          value,
        };

      case 'or':
        return {
          type: Token.or,
          value,
        };

      case 'eq':
        return {
          type: Token.eq,
          value,
        };

      case 'neq':
        return {
          type: Token.neq,
          value,
        };

      case 'gt':
        return {
          type: Token.gt,
          value,
        };

      case 'gte':
        return {
          type: Token.gte,
          value,
        };

      case 'lt':
        return {
          type: Token.lt,
          value,
        };

      case 'lte':
        return {
          type: Token.lte,
          value,
        };

      case 'in':
        return {
          type: Token.in,
          value,
        };

      case 'nin':
        return {
          type: Token.nin,
          value,
        };

      case 'between':
        return {
          type: Token.between,
          value,
        };

      case 'nbetween':
        return {
          type: Token.nbetween,
          value,
        };

      case 'like':
        return {
          type: Token.like,
          value,
        };

      case 'nlike':
        return {
          type: Token.nlike,
          value,
        };

      default:
        const num = Number(value);

        if (!isNaN(num)) {
          return {
            type: Token.number,
            value: num,
          };
        }

        return {
          type: Token.unknown,
          value,
        };
    }
  }


  _handleTargetPart(type, val) {
    let value = val;
    if (value.length > 0) {
      const num = Number(value);
      if (!isNaN(num)) value = num;
    }

    this.current = {
      type,
      value,
    };
  }


  static _anaylyzeGroupChar(char) {
    switch (char) {
      case '(':
        return Token.openGroup;
      case ')':
        return Token.closeGroup;
      case '[':
        return Token.openArray;
      case ']':
        return Token.closeArray;
      case ',':
        return Token.listDelimiter;
      default:
        return Token.none;
    }
  }


  next() {
    if (this.cursor >= this.value.length) {
      this.current = {
        type: Token.none,
        value: '',
      };
      return false;
    }

    let value = '';
    let type = Token.none;
    let isEscaping = false;
    let isInString = false;

    for (let i = this.cursor; i < this.value.length; i++) {
      const char = this.value[i];

      switch (char) {
        /*
          Escape special characters.
        */
        case '\\':
          if (isEscaping) {
            isEscaping = false;
            value += char;
          } else {
            isEscaping = true;
          }
          this.cursor++;
          break;

        /*
          Handle all white space.  Unless white space is nested inside of double
          quotes, it should indicate the end of a token.  All successive white
          space is ignored.
        */
        case ' ':       // space
        case '\t':      // horizontal tab
        case '\n':      // line feed
        case '\v':      // vertical tab
        case '\f':      // form feed
        case '\r':      // carriage return
        case '\u0085':  // next line
        case '\u00A0':  // no-break space
        case '\u1680':  // ogham space mark
        case '\u2000':  // en quad
        case '\u2001':  // em quad
        case '\u2002':  // en space
        case '\u2003':  // em space
        case '\u2004':  // three-per em space
        case '\u2005':  // four-per em space
        case '\u2006':  // six-per em space
        case '\u2007':  // figure space
        case '\u2008':  // punctuation space
        case '\u2009':  // thin space
        case '\u200A':  // hair space
        case '\u2028':  // line seperator
        case '\u2029':  // paragraph seperator
        case '\u202F':  // narrow no-break space
        case '\u205F':  // medium mathematical space
        case '\u3000':  // ideographic space
        case '\u180E':  // mongolian vowel seperator
        case '\u200B':  // zero width space
        case '\u200C':  // zero width non-joiner
        case '\u200D':  // zero width joiner
        case '\u2060':  // word joiner
        case '\uFEFF':  // zero width non-breaking space
        case '\0':      // null
          this.cursor++;

          if (type === Token.string) {
            value += char;
          } else if (type === Token.target) {
            this._handleTargetPart(type, value);
            return true;
          } else if (type === Token.unknown) {
            this.current = Tokenizer._analyze(value);
            return true;
          }
          break;

        /*
          Indicates the beginning or end of a string literal.
        */
        case '"':
          if (isEscaping) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === Token.string) {
            isInString = false;
            this.current = {
              type,
              value,
            };
            this.cursor++;
            return true;
          } else if (type === Token.none) {
            isInString = true;
            type = Token.string;
            this.cursor++;
          } else {
            throw this.error({ value });
          }
          break;

        /*
          JSON pointer field reference indicator.
        */
        case '/':
          if (isEscaping || type === Token.string) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === Token.none) {
            type = Token.target;
            this.cursor++;
          } else if (type === Token.target) {
            if (value.length === 0) throw this.error({ value });

            const num = Number(value);
            if (!isNaN(num)) value = num;

            this.current = {
              type,
              value,
            };

            return true;
          } else {
            throw this.error({ value });
          }
          break;

        default:
          const groupToken = Tokenizer._anaylyzeGroupChar(char);

          if (groupToken !== Token.none) {
            if (isEscaping || type === Token.string) {
              isEscaping = false;
              value += char;
              this.cursor++;
            } else if (type === Token.target) {
              this._handleTargetPart(type, value);
              return true;
            } else if (type === Token.none) {
              type = groupToken;
              this.current = {
                type,
                value: char,
              };
              this.cursor++;
              return true;
            } else {
              this.current = Tokenizer._analyze(value);
              return true;
            }
            break;
          }

          isEscaping = false;

          if (type === Token.none) type = Token.unknown;
          value += char;
          this.cursor++;
          break;
      }
    }

    if (isInString || isEscaping) throw this.error({ value });

    if (type === Token.target) {
      this._handleTargetPart(type, value);
      return true;
    }

    this.current = Tokenizer._analyze(value);

    return true;
  }

}


module.exports = Tokenizer;
