# spleen

Representing filter expressions across application layers is a pretty common problem.  Say we have a REST endpoint that accepts a filter, which is then deserialized, passed to your domain logic for process, and then passed into you data access layer for querying information.  There are a couple of issues that come out of this scenario.  How is the filter expression formatted when it's passed in via an HTTP request?  How do we pass this expression to our domain logic and data access layers without leaking implementation details?  The `spleen` module seeks to solve these issues.

There are a number of competing methods for solving this issue.  Most notably GraphQL and OData.  However, these tools are not suitable for all use cases.  The `spleen` module is ideally suited for RESTful and intent-based API designs.

__Contents__

  * [Usage](#usage)
  * [Spleen Expressions](#spleen-expressions)
    + [Grammar](#grammar)
    + [Syntax](#syntax)
    + [Examples](#examples)
  * [Building Filters](#building-filters)
  * [API](#api)
    + [Module](#module)
    + [Class: `Filter`](#class-filter)
    + [Class: `Operator`](#class-operator)
    + [Class: `Range`](#class-range)
    + [Class: `Target`](#class-target)
  * [Conversions](#conversions)

## Usage

Add `spleen` to your `package.json` file's `dependencies`:

```sh
$ npm install spleen -S
```

You can then parse `spleen` filter expression strings:

```js
const spleen = require('spleen');
const Filter = spleen.Filter;

const expression = '/foo eq "bar" and /baz gt 42';

const filter = Filter.parse(expression);
```

Or define filter graphs directly (which is more efficient from a runtime perspective):

```js
const spleen = require('spleen');
const Filter = filtering.Filter;
const Operator = filtering.Operator;
const Target = filtering.Target;

const filter = Filter.where(Target.jsonPointer('/foo'), Operator.eq, 'bar')
                     .and(Target.jsonPointer('/baz'), Operator.gt, 42);
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

  * `<group> ... </group>` _(optional)_ A logical grouping of filter clauses.  This is useful when conjunctive normal form clauses are used with the individual evaluation of a series of disjunctive normal form clauses, and visa versa.

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

    + `"%match_pattern%"`: a set of characters and wildcards used for matching string patterns.  Wildcards include:

      - `%`: match zero or more of any character.

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

The conditions field `bar` of field `foo` is not equal to string literal `"baz"` and field `qux` is greater than or equal to 42 must be true, or the field `quux` must start with `"Hello"`.

```
(/foo/bar neq "baz" and /qux gte 42) or /quux like "Hello%"
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
GET api/v1/organizations?filter=/customerId+eq+"123"+and+/name+like+"%25awesome%25"
```

## Building Filters

A filter graph can also be built in code using the `Filter` class' fluent API:

```js
const spleen = require('spleen');
const Filter = spleen.Filter;
const Operator = spleen.Operator;
const Range = spleen.Range;
const Target = spleen.Target;

const filter = Filter.where(
    Target.jsonPointer('/foo'),
    Operator.eq,
    'bar'
  )
  .and(
    Target.jsonPointer('/baz'),
    Operator.between,
    Range.from('a', 'm')
  );

const isNot42 = Filter.where(
    Target.jsonPointer('/qux'),
    Operator.neq,
    42
  )
  .or(
    Target.jsonPointer('/quux'),
    Operator.lt,
    42
  );

filter.andGroup(isNot42);
```

## API

#### Module

The primary interface exposes all of the classes needed to build `spleen` filters.

  * __Properties__

    + `spleen.errors`: gets an object with references to all error types thrown by the module:

      - `ParserError`: an error thrown when a `spleen` expression string cannot be parsed.  This error's `data` property is the numeric index of the invalid token encountered by the parser.

    + `spleen.Filter`: gets a reference to the [`Filter`](#class-filter) class.

    + `spleen.Operator`: gets a reference to the [`Operator`](#class-operator) class.

    + `spleen.Range`: gets a reference to the [`Range`](#class-range) class.

    + `spleen.Target`: gets a reference to the [`Target`](class-target) class.

#### Class: `Filter`

Represents the graph structure of a `spleen` filter.

  * __Properties__

    + `Filter.prototype.params`: gets an array of all unique literal values in the order they are encountered.

    + `Filter.prototype.fields`: gets an array of all field references used in the filter.

    + `Filter.prototype.value`: gets the graph of filter criteria.

  * __Methods__

    + `Filter.group(filter)`: factory method for creating a new filter graph, where the first set of clauses are nested in a group.

      _Parameters_

        - `filter`: _(required)_ an instance of `Filter` to nest in a group.

      This method returns an instance of `Filter`.

    + `Filter.parse(filter)`: parses a `spleen` filter expression in infix notation.

      _Parameters_

        - `filter`: _(required)_ a string value representing a the filter expression.

      This method returns an object with the following keys:

        - `error`: if `success` is `false`, this key is an instance of `ParserError`.

        - `success`: a Boolean value indicating whether or not parsing was successful.

        - `value`: the representative instance of `Filter`.  If `success` is false, this key is `null`.

    + `Filter.where(subject, op, object)`: factory method for creating new filter graphs.

      _Parameters_

        - `subject`: _(required)_ the "subject" portion of a filter clause expression.  This can be an instance of `Target`, string, number, or Boolean.

        - `op`: _(required)_ the comparison operation to perform, which is defined by an instance of `Operator`.

        - `object`: _(required)_ the "object" portion of a filter clause expression.  This can be a variety of values, and may be restricted by which operator is being used in the filter clause.  See the section on [Grammar](#grammar) for more information.

      This method returns an instance of `Filter`.

    + `Filter.prototype.and(subject, op, object)`: _(overload)_ appends a clause to the `Filter` instance using an "and" conjunctive.

      _Parameters_

        - `subject`: _(required)_ the "subject" portion of a filter clause expression.  This can be an instance of `Target`, string, number, or Boolean.

        - `op`: _(required)_ the comparison operation to perform, which is defined by an instance of `Operator`.

        - `object`: _(required)_ the "object" portion of a filter clause expression.  This can be a variety of values, and may be restricted by which operator is being used in the filter clause.  See the section on [Grammar](#grammar) for more information.

      This method returns the `Filter` instance.

    + `Filter.prototype.and(filterGraph)`: _(overload)_ appends a filter graph as using an "and" conjunctive.

      _Parameters_

        - `filterGraph`: _(required)_ an instance of `Filter` to add.

      This method returns the `Filter` instance.

    + `Filter.prototype.andGroup(filterGraph)`: _(overload)_ appends a new group of clauses using an "and" conjunctive, and nests the given `Filter` within this group.

      _Parameters_

        - `filter`: _(required)_ an instance of `Filter` to add.

      This method returns the `Filter` instance.

    + `Filter.prototype.match(value)`: determines whether or not the `Filter` matches a given value.

      _Parameters_

        - `value`: _(required)_ the value to be matched.

      This method returns a Boolean value — `true` if there is a match, and `false` if there is no match.

    + `Filter.prototype.or(subject, op, object)`: _(overload)_ appends a clause to the `Filter` instance using an "or" conjunctive.

      _Parameters_

        - `subject`: _(required)_ the "subject" portion of a filter clause expression.  This can be an instance of `Target`, string, number, or Boolean.

        - `op`: _(required)_ the comparison operation to perform, which is defined by an instance of `Operator`.

        - `object`: _(required)_ the "object" portion of a filter clause expression.  This can be a variety of values, and may be restricted by which operator is being used in the filter clause.  See the section on [Grammar](#grammar) for more information.

      This method returns the `Filter` instance.

    + `Filter.prototype.or(filterGraph)`: _(overload)_ appends a filter graph using an "or" conjunctive.

      _Parameters_

        - `filterGraph`: _(required)_ an instance of `Filter` to add.

      This method returns the `Filter` instance.

    + `Filter.prototype.orGroup(filterGraph)`: _(overload)_ appends a new group of clauses using an "or" conjunctive, and nests the given `Filter` within this group.

      _Parameters_

        - `filterGraph`: _(required)_ an instance of `Filter` to add.

      This method returns the `Filter` instance.

    + `Filter.prototype.toString(urlEncode)`: returns a `spleen` filter expression.

      _Parameters_

        - `urlEncode`: _(optional)_ a Boolean indicating whether or not the string should be URL encode.

      This method returns a string.

#### Class: `Operator`

A comparison operator (verb) in a filter condition.

  * __Properties__

    + `Operator.eq`: gets an instance of `Operator` representing an equal to comparison.

    + `Operator.neq`: gets an instance of `Operator` representing a not equal to comparison.

    + `Operator.gt`: gets an instance of `Operator` representing a greater than comparison.

    + `Operator.gte`: gets an instance of `Operator` representing a greater than or equal to comparison.

    + `Operator.lt`: gets an instance of `Operator` representing an less than comparison.

    + `Operator.lte`: gets an instance of `Operator` representing a less than or equal to comparison.

    + `Operator.between`: gets an instance of `Operator` representing a between comparison.

    + `Operator.nbetween`: gets an instance of `Operator` representing a not between comparison.

    + `Operator.like`: gets an instance of `Operator` representing a string like comparison.

    + `Operator.nlike`: gets an instance of `Operator` representing a not string like comparison.

    + `Operator.in`: gets an instance of `Operator` representing an in array comparison.

    + `Operator.nin`: gets an instance of `Operator` representing a not in array comparison.

  * __Methods__

    + `Operator.parse(term)`: parses a string value it's `Operator` class instance representation.

      _Parameters_

        + `term`: _(required)_ the string to parse.

      This method returns an instance of `Operator`.

#### Class: `Range`

Represents a range of two values.  This is class is used as the "object" in "between" comparisons.

  * __Properties__

    + `Range.prototype.lower`: the lower value in the range.

    + `Range.prototype.upper`: the upper value in the range.

  * __Methods__

    + `Range.from(a, b)`: factory method that takes two values, and creates a `Range` instance.  The method will set the `lower` and `upper` properties accordingly.

      _Parameters_

        - `a`: _(required)_ a string or a number to use in the range.

        - `b` _(required)_ a string or a number to use in the range.

      This method returns an instance of `Range`.

    + `Range.parse(value)`: parses a string representation of a range value into an instance of `Range`.

      _Parameters_

        - `value`: _(required)_ the string to parse.

      This method returns an instance of `Range`.


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

One of the goals of `spleen` is to provide a high-level abstraction of filter expressions.  The idea is to provide a DSL that can be consistently used across application layers without leaking implementation details.  Each layer in the application is then responsible for consuming a `spleen` filter expression in its own way.

In the case of a data access layer, this typically means converting a `Filter` instance into some flavor of SQL.  For now, there is a single plugin available for accomplishing this end: [spleen-n1ql](https://www.npmjs.com/package/spleen-n1ql).
