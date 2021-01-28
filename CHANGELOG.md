# Unreleased, v6.0.0

## Breaking

- Blank terms are not valid syntax any more.
- Trailing comma are not valid syntax any more.
  I think it is not math, it is more related to programming langs.
  
## Added

- You can use ellipsis as valid `Factor`, e.g., `1 + 2 + ... + 10`
- This expression will throw syntax error, `1 + 2 + (...) + 10`
- `options.operatorSequence` || `options.extra.ellipsis.infixOperators`

# 24 Jan 2021, v5.0.0

## Breaking

- Blank terms are represented as `{ type: "blank" }`.
- Ellipsis are represented as `{ type: "ellpisis" }`.

## Added

- `class Node`
  - `hasChildR`
  - `hasChild`

# 🌟 11 Jan 2021, v4.0

## Breaking

* Update section `Unsure About` in README.md, change the way this ambiguous expression parsed.
* `extra.ellipsis` now accept a boolean value, true, false.
* These expression are valid if allowed in `options.extra.{ellipsis, blankTerms}`:
  * `(..., a)`
  * `(, a)`
  * `(a, )` is tuple depending on extra options.
* Intervals, should have 2 terms as math expression:
  * `(..., a]`: throw syntax error, parsed if `extra.ellipsis ` is `true`
  * `(..., a)`: is a tuple, parsed if `extra.ellipsis ` is `true`
  * `[2, 1, ]`: is a matrix, parsed if `extra.trailingComma` is `true`
  * `(1, 2,)`: is a tuple, parsed if `extra.trailingComma ` is `true`
  * `[, a]`: is a matrix, parsed if `extra.blankTerms` is `true`
  * `(, a)`: is a tuple, parsed if `extra.blankTerms` is `true`
* Remove option `strict`.

## Added
- `options.keepParen`: if you want to parse parenthesis as nodes in the AST, `{ type: "parenthesis" }`.
- `options.extra.matrices`
- `options.builtInIDs`
  - `infinity, pi, phi`: these have specific values or notions in maths.
  - `phix` is considered as automult of single-char ids, if `options.singleCharName=true`, otherwise it is node of type "id" with name "phix".
  - when strict the previous expression will be automult of single-char ids, equivalent to `p*h*i*x`. 

# 3 Jan 2021, v3.0.0

## Breaking

- Node of type "function", when its args is `[{ type: "block", name: "()", ... }]`,  function's args is assigned to parenthesis args. In other words, in this case it will be `Array` not `{ type: "block", ... }`.
- Removing node type `delimeter`:
  - `f(1,3,4)` when parsed as function, it will have args with length 3.
  - `(1,3,4)` will be parsed with `type = "tuple"`.
- Removing node of type `block`, we now have `set, tuple, parentheses, interval`.
- `options.memberExpressionAllowed` is now `options.extra.ellipsis`.

## Added

- Built-in function `sqrt`
- `options.extra`:
  - `memberExpressions`
  - `intervals`: true or false, will return node with properties `{ startInlusive: boolean, endInclusive: boolean }`.
    - `[1,2]`
    - `(-.5, infinity)`
    - `(-pi, 1]`
    - `[2,5)`
  - `sets` true or false, will return its items in the property `args`, affected with the option `extra.ellipsis`.
  - `tuples `true or false, e.g., `(1, 2, x, ...)`.
  - `ellipsis`:
    - `0` or other falsy values: is not allowed
    - `1` or other truthy values: `(1, 2, x, ...)` is allowed.
    - `2`: `(1, 2, ..., x, ...)` is allowed.
    - The same for function's arguments.
  - `trailingComma`: to allow some expressions like `f(1,2,)`
  - `blankTerms`: to allow some expressions like `f(1,,2)`
- Validate built-in functions arguments.
- Pre-validation for input `math`.
  - So `1+(2` is not valid in strict mode `options.strict = true`.
  - `1+2)` is not valid at all.
  - `1+[2)`, is valid, it is interval.
  - `1+ {2)` is not valid.


# 22 Oct 2020, v2.3.0

## Add
  - check for validity of block (including brackets) syntax, e.g., make sure that they are put in the right order and nested correctly, the block has opening and closing characters.

# 31 Aug 2020, v2.2.0
Summary of changes:
- Add version property to the exported package, which is now "2.2.0"
- Add strict to options, see README.md
- Parse "member expression" such as "p.first_component" and "f(x).someThing.another()" wether or not `options.singleCharName == true`.  
- When `options.strict == false`, "f()" is function regardless of `options.functions`.
- When `options.strict == false`, "f + a - sin" is parse with no "Function used as variable" error.
- Allow functions to be invoke by void parentheses such as "f()";
- A more intelligent way to handle 
- Fix operators ^ and ! from the previous release to parse some expression like: "5^2x!" as "(5^2)(x!)".

# v2.1.2
Summary of Changes:
- Fix operators ^ and ! to parse some expression like: "5^2x!".

# v2.1.1
Summary of Changes:
- update the README file

# v2.1.0
Summary of Changes:
- Fix factorial postfix operator "!"
- Enable single char to be a char followed by int num such as "p1, x0, x1, y123"
- Add "member expressions" Node and parse something like " 1+ p1.x"
Summary of Changes (dev):
- Add tests for member expression
- Commenting out some tests for future releases, insha'Allah!
- When a test fails: the logged objects (node and struct) are simplified first to focus on some properties

# v2.0.0
Summary of Changes:
- All the changes after v1.0.0 - the last complete version - are ready
- Update the readme file

# v2.0.0-0
Because that changes after the last complete version are major, making the next version major is the best thing.

Summary of Changes:
- Fix ReferenceError: identifier "name" is not defined.
Summary of Changes (dev):
- Remove .toThrow tests from src/\_\_tests\_\_/parser.test.js

# v1.1.0-0
Summary of Changes:
- Node has check and checkType methods:
  * `check`: to check for all property except args
  * `checkType`: to check the type of Node instance, it can be done using check
- Node has types:
  * number
  * id
  * function
  * block: (), [], {}, ||
  * automult
  * operator:
    - infix: *, /, -, +, ^, &&, ||, ==
    - postfix: !
  * delimiter
- Do some tests in the parsing process
- Add some todo comments for next releases
