# Change Log

## 1.0

### 1.3.0

__New Features__
* Adding `Like.prototype.toRegex()`.
* Adding `Like.prototype.toRegexString()`.

__Bug Fixes__
* Encountering the escape a character threw a parser error if it preceded a character that is not one of `spleen`'s special characters.  This fix will ensure that the escape character is ignored if it's escaping an un-escapable character.

### 1.2.0

__New Features__
* Adding support to reorder filter statements based on priority via the new method `Filter.prototype.prioritize()`.

* Adding JSDoc documentation.

__Tech Debt__
* Sanitizing some messy and redundant code.

### 1.1.0

__New Features__
* Adding support for the `nil` literal.

### 1.0.0
  * Initial release.