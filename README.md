# spleen

[![Build Status](https://secure.travis-ci.org/dsfields/spleen-node.svg)](https://travis-ci.org/dsfields/spleen-node) [![Coverage Status](https://coveralls.io/repos/github/dsfields/spleen-node/badge.svg?branch=master)](https://coveralls.io/github/dsfields/spleen-node?branch=master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/225e499d664e4a3fa4e1fd7129ebbafd)](https://www.codacy.com/app/dsfields/spleen-node?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dsfields/spleen-node&amp;utm_campaign=Badge_Grade) [![NSP Status](https://nodesecurity.io/orgs/dsfields/projects/23bbc1f8-ce1c-47d3-a01c-5d6198c9f619/badge)](https://nodesecurity.io/orgs/dsfields/projects/23bbc1f8-ce1c-47d3-a01c-5d6198c9f619) [![Known Vulnerabilities](https://snyk.io/test/github/dsfields/spleen-node/badge.svg)](https://snyk.io/test/github/dsfields/spleen-node)

Easily add dynamic filtering to your application.

Say we have a REST endpoint to a collection, and we need to provide a way for users to specify filter criteria when querying this collection.  This is a fairly common problem, and there are a couple of challenges that come out of this scenario.  How is the filter expression formatted when it's passed in via an HTTP request?  How do we pass this expression to our domain logic and data access layers without leaking implementation details?  The `spleen` module seeks to solve these challenges.

__Contents__

  * [Usage](#usage)
  * [Spleen Expressions](#spleen-expressions)
    + [Grammar](#grammar)
    + [Syntax](#syntax)
    + [Examples](#examples)
  * [Building Filters](#building-filters)
  * [API](#api)
    + [Module](#module)
    + [Class: `Clause`](#class-clause)
    + [Class: `Filter`](#class-filter)
    + [Class: `Like`](#class-like)
    + [Class: `Range`](#class-range)
    + [Class: `Target`](#class-target)
  * [Conversions](#conversions)
  * [Motivation](#motivation)

## Usage

Add `spleen` to your `package.json` file's `dependencies`:

```sh
$ npm install spleen -S
```

You can then parse `spleen` filter expression strings:

```js
const spleen = require('spleen');

const expression = '/foo eq "bar" and /baz gt 42';

const filter = spleen.parse(expression);
```

Or define filter graphs directly (which is more efficient from a runtime performance perspective):

```js
const spleen = require('spleen');

const Clause = spleen.Clause;
const Filter = spleen.Filter;

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
      .gt()
      .literal(42)
  );

const src = {
  foo: 'a',
  bar: 'a',
  baz: 100
};

const match = filter.match(src);
console.log(match); // true
```

## Spleen Expressions

A `spleen` filter expression is a string that can be used as input from external sources, such as in URL query strings.

### Grammar

Expression strings use infix notation to maximize read and writability by humans, and follows the form:

```
[<group>]
  <clause>
    <subject:target|literal/>
    <verb:compare|range|array|search/>
    <object:target|literal|range|array|search/>
  </clause>
[</group>]
[<conjunctive/> <clause/>] ...
```

  * `<group> ... </group>` _(optional)_ A logical grouping of filter clauses.

  * `<clause/>`: _(required)_ a statement that describes a filter condition.  Each statement must follow a specific form:

    + `<subject/>`: _(required)_ the thing you are filtering on.  A `<subject>` can be expressed in one of two ways:

      - `<subject:target/>`: a reference to a field on the data you are filtering.

      - `<subject:literal/>`: a static value used in the filter condition.

    + `<verb/>`: _(required)_ the operator you are using to perform the comparison.  Operators can be one of several types:

      - `<verb:compare/>`: a simple comparison between two values.

      - `<verb:range/>`: determines whether or not the `<subject/>` is within a range of values.

      - `<verb:array/>`: determines whether or not the `<subject/>` is in an array.

      - `<verb:search/>`: determines whether or not the `<subject/>` matches a certain search criteria.

    + `<object/>`: _(required)_ the value used to filter data agains the `<subject/>`.  There are several types of `<object/>` values that can be used, however, the type is dependent upon the preceding operator type.

      - `<object:target/>`: a reference to a field.  This `<object/>` type can only be used when the preceding operator is of type `<verb:compare/>` or `<verb:array/>`.

      - `<object:literal/>`: a static value.  This `<object/>` type can only be used when the preceding operator is of type `<verb:compare/>`.

      - `<object:range/>`: two literal values that `<subject/>` can be between (including the two edge values).  This `<object/>` type can only be used when the preceding operator is of type `<verb:range/>`.

      - `<object:array/>`: an array value.  This `<object/>` type can only be used when the preceding operator is of type `<verb:array/>`.

      - `<object:search/>`: a string matching expression used to evaluate whether or not `<subject/>` is a match.

  * `<conjunctive/>`: _(optional)_ a logical joining of multiple filter conditions.

### Syntax

The following is a list of all possible values for the various types of terms used in a `spleen` expression.

  * `<group>`:

    + `(`: opens a group.

  * `</group>`:

    + `)`: terminates a group.

  * `<subject:target/>`:

    + `/json/pointer`: a field reference in [RFC 6901](https://tools.ietf.org/html/rfc6901) format.

  * `<subject:literal/>`:

    + `"..."`: a string literal.  All values are contained with `"` characters (U+0022).

    + `12345.67890`: a number value that can be either an integer or floating point.

    + `true` or `false`: a Boolean value.

    + `nil`: a null literal value.

  * `<verb:compare/>`:

    + `eq`: equal to.

    + `neq`: not equal to.

    + `gt`: greater than.

    + `gte`: greater than or equal to.

    + `lt`: less than.

    + `lte`: less than or equal to.

  * `<verb:range/>`:

    + `between`: is between two other values.

    + `nbetween`: is not between two other values.

  * `<verb:array/>`:

    + `in`: is in array.

    + `nin`: is not in array.

  * `<verb:search/>`:

    + `like`: matches a search string pattern.

    + `nlike`: does not match a search string pattern.

  * `<object:target/>`:

    + `/json/string`: a reference expression in [RFC 6901](https://tools.ietf.org/html/rfc6901) format.

  * `<object:literal/>`:

    + `"..."`: a string literal.  All values are contained with `"` characters (U+0022).

    + `12345.67890`: a number value that can be either an integer or floating point.

    + `true` or `false`: a Boolean value.

  * `<object:range/>`:

    + `{literal},{literal}`: two literal values (string or number) delimited by a comma.

  * `<object:array/>`:

    + `[{literal}]`: an array of literal values (string, number, or Boolean) delimited by a comma.

  * `<object:search/>`:

    + `*match_pattern*"`: a set of characters and wildcards used for matching string patterns.  Wildcards include:

      - `*`: match zero or more of any character.  Most like pattern formats use a `%` for this purpose.  The `spleen` module uses `*` to be more URL-friendly.

      - `_`: match one of any character.

      - `\`: escape a reserved wildcard character.

Terms are generally delimited by a `SPACE` character (U+0020).  The exception being group initiator and terminator characters, which can abut other terms without a delimiter.

### Examples

Subfield `bar` of field `foo` is equal to string literal `"baz"`.

```
/foo/bar eq "baz"
```

Field `bar` of field `foo` is not equal to string literal `"baz"`, and field `qux` is greater than or equal to 42.

```
/foo/bar neq "baz" and /qux gte 42
```

Field `bar` of field `foo` is equal to `nil` (`null`).

```
/foo/bar eq nil
```

The conditions field `bar` of field `foo` is not equal to string literal `"baz"` and field `qux` is greater than or equal to 42 must be true, or the field `quux` must start with `"Hello"`.

```
(/foo/bar neq "baz" and /qux gte 42) or /quux like "Hello*"
```

The value of field `foo` should not be in the array of values `42`, `"bar"`, and `"baz"`.

```
/foo nin [42,"bar","baz"]
```

The value of field `foo` should be in the array value of field `bar`.

```
/foo in /bar
```

The value of field `foo` is greater than or equal to `0` or less than or equal to `42`.

```
/foo between 0,42
```

The primary use case for `spleen` expressions is to accept a filter condition from an external source.  For example, as a query parameter on a request to a REST-based API:

```
GET api/v1/organizations?filter=/customerId+eq+"123"+and+/name+like+"*awesome*"
```

## Building Filters

A filter graph can also be built in code using the `Filter` class' fluent API:

```js
const spleen = require('spleen');
const Filter = spleen.Filter;
const Operator = spleen.Operator;
const Range = spleen.Range;
const Target = spleen.Target;

const filter = Filter
  .where(
    Clause
      .target('/foo')
      .eq()
      .literal('bar')
  )
  .and(
    Clause
      .target('/baz')
      .between()
      .range('a', 'm')
  )
  .andGroup(
    Filter
      .where(
        Clause
          .target('/qux')
          .neq()
          .literal(42)
      )
      .or(
        Clause
          .target('/quux')
          .lt()
          .literal(42)
      )
  );
```

## API

#### Module

The primary interface exposes all of the classes needed to build `spleen` filters.

  * __Properties__

    + `spleen.Clause` gets a reference to the [`Clause`](#class-clause) class.

    + `spleen.errors`: gets an object with references to all error types thrown by the module:

      - `MatchError`: an error thrown when `match()` is called on an invalid `Filter`.  Generally, this should never happen.

      - `ParserError`: an error thrown when a `spleen` expression string cannot be parsed.  This error's `data` property is the numeric index of the invalid token encountered by the parser.

    + `spleen.Filter`: gets a reference to the [`Filter`](#class-filter) class.

    + `spleen.Like`: gets a reference to the [`Like`](#class-like) class.

    + `spleen.parse(value)` parses a string, and converts it into an instance of [`Filter`](#class-filter).
    
      _Parameters_

      - `value`: a string representing a `spleen` expression.

      This method returns an object with the following keys:

      - `error`: if `value` was in invalid `spleen` expression, this key will be an instance of `ParserError` with additional information about why the failure occured.

      - `filter`: if parsing was successful, this key is an instance of `Filter`.

      - `success`: a Boolean value indicating whether or not parsing was successful.

    + `spleen.Range`: gets a reference to the [`Range`](#class-range) class.

    + `spleen.Target`: gets a reference to the [`Target`](class-target) class.

#### Class: `Clause`

Represents a single Boolean expression.  An instance of `Clause` is built using the methods described below, and can only be usable within a `Filter` once they are complete, valid expressions.  Meaning, they must have a subject, verb, and object (as described in "[Grammar](#grammar)").

  * __Properties__

    + `subject`: gets the subject value for the `Clause`.  This will always be either an instance of `Target`, a string, number, or Boolean.

    + `operator`: gets the verb portion of the `Clause`.  This is an operator which is an object with the key `type`.  The `type` property can have a value of `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `between`, `nbetween`, `like`, or `nlike`.

    + `object`: the object portion of the `Clause`.  The possible values for this property are constrained by the value of `operator`.

      - If `operator` is `eq`, `neq`, `gt`, `gte`, `lt`, or `lte`, then `object` can be an instance of `Target`, a string, number, or Boolean.

      - If `operator` is `in` or `nin`, then `object` can be an array of strings, numbers, and Booleans.

      - If `operator` is `between` or `nbetween` then `object` can be an instance of `Range`.

      - If `operator` is `like` or `nlike` then `object` can be an instance of `Like`.

  * __Methods__

    Many of the methods for `Clause` only become available after a certain method has been called.  All instances of `Clause` are constructed using one of its factory methods:

    + `Clause.target(value)`: sets the subject of the `Clause` to an instance of `Target`.

      _Parameters_

      - `value`: _(required)_ a JSON-pointer string.
    
    + `Clause.literal(value)` sets the subject of the `Clause` to a literal.

      _Parameters_

      - `value`: _(required)_ a string, number, or Boolean value.
  
    Once the `subject` of the `Clause` has been set, available methods begin branching.  Calling one method itself unavailable, while also enabling methods in the following fashion:

      + __Comparison__

        - `Clause.prototype.eq()`: sets the operator to `eq` (equal to).

        - `Clause.prototype.neq()`: sets the operator to `neq` (not equal to).

        - `Clause.prototype.gt()`: sets the operator to `gt` (greater than).

        - `Clause.prototype.gte()`: sets the operator to `gt` (greater than or equal to).

        - `Clause.prototype.lt()`: sets the operator to `lt` (less than).

        - `Clause.prototype.lte()`: sets the operator to `lte` (less than or equal to).

        __Children:__

        - `Clause.prototype.target(value)`: ets the object of the `Clause` to an instance of `Target`.

          _Parameters_

            - `value`: _(required)_ a JSON-pointer string.
          
        - `Clause.prototype.literal(value)`: sets the object of the `Clause` to a literal.

          _Parameters_

          - `value`: _(required)_ a string, number, or Boolean value.

      + __Array__

        - `Clause.prototype.in()`: sets the operator to `in` (in array).

        - `Clause.prototype.nin()`: sets the operator to `nin` (not in array).

        __Children:__

          - `Clause.prototype.array(value)`: sets the `object` of the `Clause` to an array.

            _Parameters_

            - `value`: _(required)_ an array of strings, numbers, and Booleans.

      + __Range__

        - `Clause.prototype.between()`: sets the operator to `between` (between two values).

        - `Clause.prototype.nbetween()`: sets the operator to `nbetween` (not between two values).

        __Children:__

          - `Clause.prototype.range(lower, upper)`: a range of values that the value of subject should fall between.

            _Parameters_

            - `lower`: _(required)_ a string or number representing the lower portion of the range expression.

            - `upper`: _(required)_ a string or number representing the upper portion of the range expression.

      + __Search__

        - `Clause.prototype.like()`: sets the operator to `like` (like a string pattern)

        - `Clause.prototype.nlike()`: sets the operator to `nlike` (not like a string pattern)

        __Children:__

          - `Cluase.prototype.pattern(value)`: sets the object to a string matching pattern.  This method wraps `value` in an instance of `Like`.

            _Parameters_

            - `value`: _(required)_ a string value using string matching the wildcards described in "[Syntax](#syntax)."

#### Class: `Filter`

Represents the graph structure of a `spleen` filter.

  * __Properties__

    + `Filter.prototype.fields`: gets an array of all field references used in the filter.

    + `Filter.prototype.statements`: gets an array of all nodes within the filter graph.  Each entry is an object that consists of the keys:

      - `conjunctive`: a string that specifies how a statement is conjoined with the previous statement.  This can be either an empty string, `and`, or `or`.

      - `value`: the value of the statement.  This can be either an instance of `Clause` or `Filter`.  If `value` is an instance of `Filter` then the statement is interpreted as a group.

  * __Methods__

    + `Filter.group(filter)`: factory method for creating a new filter graph, where the first statement is a set of clauses nested in a group.

      _Parameters_

      - `filter`: _(required)_ an instance of `Filter` to nest in a group.

      This method returns an instance of `Filter`.

    + `Filter.where(clause)`: factory method for creating new filter graphs, where the first statement is a clause.

      _Parameters_

      - `clause`: _(required)_ an instance of `Clause` to use as the first statement in the `Filter`.

      This method returns an instance of `Filter`.

    + `Filter.prototype.and(clause | filter)`: appends an instance of `Clause` or the statemetns within a `Filter` to the `Filter`'s list of statements using an "and" conjunctive.

      _Parameters_

      - `clause`: _(required)_ an instance of `Clause`.

      ...or...

      - `filter` _(required)_ an instance of `Filter`.  If this overload is called, all of the statements for the given filter are concatonated onto the end of the `Filter` instance's statements.  All statements appended on are treated as individual statements, and not a single group.  The first statement in the joined filter is conjoined with an "and."

      This method returns the `Filter` instance.

    + `Filter.prototype.andGroup(filter)`: ands an instance of `Filter` as a single statement evaluated as a group.  The statement is joined to the previous statement with an "and."

      _Parameters_

      - `filter`: _(required)_ the instance of `Filter` to add as a group statement.

      This method returns the `Filter` instance.

    + `Filter.prototype.match(value)`: determines whether or not the `Filter` matches a given value.

      _Parameters_

      - `value`: _(required)_ the value to be matched.

      This method returns a Boolean value indicating whether or not there was a match.

    + `Filter.prototype.or(clause | filter)`: appends an instance of `Clause` or the statemetns within a `Filter` to the `Filter`'s list of statements using an "or" conjunctive.

      _Parameters_

      - `clause`: _(required)_ an instance of `Clause`.

      ...or...

      - `filter` _(required)_ an instance of `Filter`.  If this overload is called, all of the statements for the given filter are concatonated onto the end of the `Filter` instance's statements.  All statements appended on are treated as individual statements, and not a single group.  The first statement in the joined filter is conjoined with an "or."

      This method returns the `Filter` instance.

    + `Filter.prototype.orGroup(filter)`: ands an instance of `Filter` as a single statement evaluated as a group.  The statement is joined to the previous statement with an "or."

      _Parameters_

      - `filter`: _(required)_ the instance of `Filter` to add as a group statement.

      This method returns the `Filter` instance.

    + `Filter.prototype.prioritize(priorities [, options] | strategy)`: creates a shallow copy of the `Filter` instance, and reorders all statements to align with a given list of field targets that is ordered by priority.

      Reordered statements cannot always be made to be in perfect prioritization order.  This method will always return a `Filter` instance that is logically the same as the original.  For example...
    
      - Given the expression `/bar eq 2 or /baz eq 3 and /foo eq 1`
      - A priority list of `['/foo', '/bar', '/baz']`
      - And a conjuction precedence of `and` (the default)
      - The result will be `/foo eq 1 and /baz eq 3 or /bar eq 2`

      _Parameters_

      - `priorities`: _(required)_ an array of field targets in RFC 6901 format.  The array should be in priority order, from most important (index 0) to least important (index length--).  Each entry can be a string in RFC 6901 format, or an object with the following keys:

        - `target`: a string in RFC 6901 format.

        - `label`: allows field targets to be labelled and grouped together.  The `prioritize()` method's result will include a list of labels that correlate to field targets used in the `Filter` instance.  A `label` can be used for more than one `target`.
      
      - `options`: _(optional)_ an object with the following keys:

        - `precedence`: _(optional)_ a string that can be either `and` or `or` (case insensitve).  This dictates how an expression should be evaluated, and, consequently, how statements within a `Filter` can be reoranized.

        - `matchAllLabels`: _(optional)_ a Boolean value indicating whether or not all fields should exist in a `Filter` instance to constitute a "match" of a label provided in the list of `priorities`.  The default is `false`.

      ...or...

      - `strategy`: _(required)_ an instance of [`PrioritizeStrategy`](#class-prioritizestrategy).

      This method returns an object with the following fields:

      - `filter`: the new `Filter` instance.

      - `labels`: an array of labels used in the filter.  These come from a `label` value passed in via the `priorities` parameter.  This is especially useful if `label` values are index names.  This gives insight into what database indexes a `Filter` instance may particpate in.  This becomes key information when `spleen` is used with database engines that utilize index hinting.


    + `Filter.prototype.toString(urlEncode)`: returns a `spleen` filter expression.

      _Parameters_

      - `urlEncode`: _(optional)_ a Boolean indicating whether or not the string should be URL encode.

      This method returns a Boolean indicating whether or not that there was a match.

#### Class: `Like`

Represents a "like" string matching expression.  This clause is used as the "object" in "search" comparisons.

  * __Properties__

    + `Like.prototype.value`: gets the string value of the "like" expression.

  * __Methods__

    + `Like.prototype.match(value)`: compares a given string agains the like expression.

      _Parameters_

      - `value`: a string value to match.
    
    This method returns a Boolean.

#### Class: `PrioritizeStrategy`

A cache of computed information used to prioritize statements in a `Filter` instance.

  * __Methods__

    + `PrioritizeStrategy.create(priorities [, options])`: builds a `PrioritizeStrategy`.

      _Parameters_

      - `priorities`: _(required)_ an array of field targets in RFC 6901 format.  The array should be in priority order, from most important (index 0) to least important (index length--).  Each entry can be a string in RFC 6901 format, or an object with the following keys:

          - `target`: a string in RFC 6901 format.

          - `label`: allows field targets to be labelled and grouped together.  The `prioritize()` method's result will include a list of labels that correlate to field targets used in the `Filter` instance.  A `label` can be used for more than one `target`.
        
      - `options`: _(optional)_ an object with the following keys:

        - `precedence`: _(optional)_ a string that can be either `and` or `or` (case insensitve).  This dictates how an expression should be evaluated, and, consequently, how statements within a `Filter` can be reoranized.

        - `matchAllLabels`: _(optional)_ a Boolean value indicating whether or not all fields should exist in a `Filter` instance to constitute a "match" of a label provided in the list of `priorities`.  The default is `false`.

#### Class: `Range`

Represents a range of two values.  This is class is used as the "object" in "range" comparisons.

  * __Properties__

    + `Range.prototype.lower`: the lower value in the range.

    + `Range.prototype.upper`: the upper value in the range.

  * __Methods__

    + `Range.between(value)`: indicates whether or not the value falls within the range defined by `lower` and `upper`.

      _Parameters_

      - `value`: _(required)_ a string or number value to evaluate.

      This method returns a Boolean indicating whether or not that there was a match.

#### Class: `Target`

Represents a reference to a field on an object being filtered.

  * __Properties__

    + `Target.prototype.field`: gets the field being referenced.  This is useful if the target path includes an array index.  Field names are expressed as strings in JSON pointer format.  This differs from the actual target value in cases where a field index is used in the path.  For example, `/foo/0/bar` references field `bar` of index item `0` of field `foo`.  In this case, the value of `field` would be `/foo`.

    + `Target.prototype.path`: gets an in-order array of strings and numbers that represent how to traverse an object and its sub objects to find a value.  A string is a field reference, and a number is an index lookup (for example, in an array).

  * __Methods__

    + `Target.jsonPointer(value)`: parses a JSON pointer value.

      _Parameters_

      - `value`: _(required)_ the JSON pointer to parse.

    This method returns an instance of `Target` representing the JSON pointer.

## Conversions

One of the goals of `spleen` is to provide a high-level abstraction for filter expressions.  The idea is to provide a DSL that can be consistently used across application layers without leaking implementation details.  Each layer in the application is then responsible for consuming a `spleen` filter expression in its own way.

In the case of a data access layer, this typically means converting a `Filter` instance into some flavor of SQL.  For now, there is a single plugin available for accomplishing this end: [spleen-n1ql](https://www.npmjs.com/package/spleen-n1ql) (for now).

## Motivation

Representing dynamic complex filter expressions is a fairly common problem for API developers.  There are a variety of methods commonly used by teams, and they all have their pros and cons...

* Use the query string to pass in filter criteria.<br />
  __Pros:__ Very easy to implement. Universally understood.<br />
  __Cons:__ Query strings have no native way of specifying comparison operators.  Difficult to make APIs idiomatic.

* Expose the underlying query language used by your database.<br />
  __Pros:__ Can provide a lot of power.  Little to no effort to implement.<br />
  __Cons:__ Leaks internal implementation details.  Difficult to secure.

* Build a custom filter dialect and parser.<br />
  __Pros:__ Greater control over the software.<br />
  __Cons:__ Teams often make these tools domain-specific.  Complex and time-consuming to build.  Closed-source solutions do not benefit from a larger community of people and companies testing and contributing to the project.

* Use frameworks for querying languages such as GraphQL and OData.<br />
  __Pros:__ Very robust.  Support for full ad-hoc querying.<br />
  __Cons:__ Represents a broader system design.  May not be practical for use in existing systems built on an intent-based design (like REST).  Built around opinionated frameworks that can be complicated to implement.  Limited ability to optimize ad-hoc queries at runtime, and fully take advantage of database indexes.  Poorly designed user-specified queries can be used as a vector for DoS attacks.

The `spleen` module addresses these challenges wtih the following goals in minds:

* No strong opinions.  The `spleen` module is a library, and does not insist upon any broader design patterns.

* Can be implemented with minimal effort.

* Enables complex filter logic with support for a variety of comparison operators, functions, and conjunctions.

* Provides an abstraction around the issue of dynamically filtering data.

* Domain agnostic.

* Allows API endpoints to utilize a single query parameter for filtering.  This makes your APIs more idiomatic, and your code simpler.

* Ability to prioritize user-defined filter clauses.  This allows implementers to generate efficient, index-aware queries.