'use strict';

const errors = require('./errors');
const TokenType = require('./token-type');


class Tokenizer {

  constructor(value) {
    this.cursor = 0;
    this.current = null;
    this.value = value;
  }


  get isEnd() { return (this.cursor >= this.value.length); }


  static _analyze(value) {
    switch (value) {
      case 'true':
        return {
          type: TokenType.boolean,
          value: true,
        };

      case 'false':
        return {
          type: TokenType.boolean,
          value: false,
        };

      case 'and':
        return {
          type: TokenType.and,
          value,
        };

      case 'or':
        return {
          type: TokenType.or,
          value,
        };

      case 'eq':
        return {
          type: TokenType.eq,
          value,
        };

      case 'neq':
        return {
          type: TokenType.neq,
          value,
        };

      case 'gt':
        return {
          type: TokenType.gt,
          value,
        };

      case 'gte':
        return {
          type: TokenType.gte,
          value,
        };

      case 'lt':
        return {
          type: TokenType.lt,
          value,
        };

      case 'lte':
        return {
          type: TokenType.lte,
          value,
        };

      case 'in':
        return {
          type: TokenType.in,
          value,
        };

      case 'nin':
        return {
          type: TokenType.nin,
          value,
        };

      case 'between':
        return {
          type: TokenType.between,
          value,
        };

      case 'nbetween':
        return {
          type: TokenType.nbetween,
          value,
        };

      case 'like':
        return {
          type: TokenType.like,
          value,
        };

      case 'nlike':
        return {
          type: TokenType.nlike,
          value,
        };

      default:
        const num = Number(value);

        if (!isNaN(num)) {
          return {
            type: TokenType.number,
            value: num,
          };
        }

        return {
          type: TokenType.unknown,
          value,
        };
    }
  }


  next() {
    if (this.cursor >= this.value.length) return false;

    let value = '';
    let type = TokenType.none;
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

          if (type === TokenType.string) {
            value += char;
          } else if (type === TokenType.target) {
            if (value.length > 0) {
              const num = Number(value);
              if (!isNaN(num)) value = num;
            }

            this.current = {
              type,
              value,
            };

            return true;
          } else if (type === TokenType.unknown) {
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
          } else if (type === TokenType.string) {
            isInString = false;
            this.current = {
              type,
              value,
            };
            this.cursor++;
            return true;
          } else if (type === TokenType.none) {
            isInString = true;
            type = TokenType.string;
            this.cursor++;
          } else {
            throw new errors.ParserError({
              position: this.cursor,
              value: this.value,
            });
          }
          break;

        /*
          JSON pointer field reference indicator.
        */
        case '/':
          if (isEscaping || type === TokenType.string) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === TokenType.none) {
            type = TokenType.target;
            this.cursor++;
          } else if (type === TokenType.target) {
            if (value.length === 0) {
              throw new errors.ParserError({
                position: this.cursor,
                value: this.value,
              });
            }

            const num = Number(value);
            if (!isNaN(num)) value = num;

            this.current = {
              type,
              value,
            };

            return true;
          } else {
            throw new errors.ParserError({
              position: this.cursor,
              value: this.value,
            });
          }
          break;

        /*
          Open a logical grouping.
        */
        case '(':
          if (isEscaping || type === TokenType.string) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === TokenType.target) {
            if (value.length > 0) {
              const num = Number(value);
              if (!isNaN(num)) value = num;
            }

            this.current = {
              type,
              value,
            };

            return true;
          } else if (type === TokenType.none) {
            type = TokenType.openGroup;
            this.current = {
              type,
              value: char,
            };
            this.cursor++;
            return true;
          } else {
            this.current = Tokenizer._analyze(value);
            return false;
          }
          break;

        case ')':
          if (isEscaping || type === TokenType.string) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === TokenType.target) {
            if (value.length > 0) {
              const num = Number(value);
              if (!isNaN(num)) value = num;
            }

            this.current = {
              type,
              value,
            };

            return true;
          } else if (type === TokenType.none) {
            type = TokenType.closeGroup;
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

        case ',':
          if (isEscaping || type === TokenType.string) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === TokenType.target) {
            if (value.length > 0) {
              const num = Number(value);
              if (!isNaN(num)) value = num;
            }

            this.current = {
              type,
              value,
            };

            return true;
          } else if (type === TokenType.none) {
            type = TokenType.listDelimiter;
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

        case '[':
          if (isEscaping || type === TokenType.string) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === TokenType.target) {
            if (value.length > 0) {
              const num = Number(value);
              if (!isNaN(num)) value = num;
            }

            this.current = {
              type,
              value,
            };

            return true;
          } else if (type === TokenType.none) {
            type = TokenType.openArray;
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

        case ']':
          if (isEscaping || type === TokenType.string) {
            isEscaping = false;
            value += char;
            this.cursor++;
          } else if (type === TokenType.target) {
            if (value.length > 0) {
              const num = Number(value);
              if (!isNaN(num)) value = num;
            }

            this.current = {
              type,
              value,
            };

            return true;
          } else if (type === TokenType.none) {
            type = TokenType.closeArray;
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

        default:
          if (type === TokenType.none) type = TokenType.unknown;
          value += char;
          this.cursor++;
          break;
      }
    }

    if (isInString) {
      throw new errors.ParserError({
        position: this.cursor,
        value: this.value,
      });
    }

    if (type === TokenType.target) {
      if (value.length > 0) {
        const num = Number(value);
        if (!isNaN(num)) value = num;
      }

      this.current = {
        type,
        value,
      };

      return true;
    }

    this.current = Tokenizer._analyze(value);

    return true;
  }

}


module.exports = Tokenizer;
