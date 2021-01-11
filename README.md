# math-parser
A math expressions parser. We mean by mathematical that, e.g., arithmetic operations is considered for example if you pass "1+2", the result would by a (add node "+") with two children nodes of type number.

**See also:** [math-latex-parser](https://github.com/scicave/math-latex-parser)

# Install
`npm install @scicave/math-parser`

# Usage

Browser

```html
<script src="https://cdn.jsdelivr.net/npm/@scicave/math-parser/lib/bundle.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@scicave/math-parser/lib/bundle.min.js"></script>
```



Require, import
```js
const mathParser = require('@scicave/math-parser'); /*
  {
    parse: function(math:string [,options: object]),
    Node: constructor,
    SyntaxError: constructor
  }
*/
```

Examples: 
```js

console.log(mathParser.parse(' 1.5 * 5  ^x !'));

console.log(mathParser.parse(' 5^2x !'));

console.log(mathParser.parse('2xy'));

// matrix,,, see: options.extra
console.log(mathParser.parse('[1,2; 3, 4]'));

console.log(mathParser.parse('2long_var_name', { singleCharName: false, }));

// xlong_var_name is considered as one var not automult
console.log(mathParser.parse('xlong_var_name', { singleCharName: false, }));

// member expressions and matrices, non-sence expression, but it can be parsed
console.log(mathParser.parse('f(x).someProperty ^ 2 >= [1,2,3; 5,6,7]', { functions: ['f'] }));

// will throw error
console.log(mathParser.parse('f(x).someProperty.fn(y).result ^ 2  \n!', {
  functions: ['f'],
  extra: { memberExpressions: false }
}));

// strict is false by default so this is parsed correctly
// without passing function = ['f'] to options 
console.log(mathParser.parse('f().someProperty.fn(y).result ^ 2  \n!'));

```

## Operators Schema

|Operator|Precedence|Associativity|
|------|------|-------|
|`!`|6|N/A|
|`^`|5|left-to-right|
|`*`|4|left-to-right|
|`/`|4|left-to-right|
|`+`|3|left-to-right|
|`-`|3|left-to-right|
|`!=`|2|left-to-right|
|`==`|2|left-to-right|
|`>=`|2|left-to-right|
|`<=`|2|left-to-right|
|`>`|2|left-to-right|
|`<`|2|left-to-right|
|`=`|1|left-to-right|

# Options

## .autoMult

Type = `boolean`, default: `true`.

To perform multiplication in these cases:
1. `2x`
2. `sinxcosx`
3. `sinx(5y)`
> Notice: `sinxcosx` when singleCharName is `false` will be a variable name

## .singleCharName

Type = `boolean`, default: `true`.

Maths conventionally works with single char named variables and constants, but in programming languages you have freedom. The convention in programming is to use multi-char named identifier. See: [options.builtInIDs](#.builtInIDs).

When a member expression is found, properties and methods are allowed to be multi-char, despite of `options.singleCharName`, see: `options.extra.memberExpressions`.


## .extra

Default: every thing is allowed. 

- `memberExpressions`, for example:
    - `p.x`
    - `point.x`
    - `f(x).someProperty.fn(y).result`: valid syntax in both cases of `singleCharName`.
    - .......... etc, and so on.
- `intervals`: true or false, will return node with properties `{ startInlusive: boolean, endInclusive: boolean }`.
    - `[1,2]`
    - `(-.5, infinity)`
    - `(-pi, 1]`
    - `[2,5)`
- `sets`: e.g., `{ 1, sqrt(pi), ..., sqrt(pi)^10 }`
- `tuples `: e.g., `(1, 2, x, ...)`
- `matrices`: e.g., `[ sinx, 1, 3; cosy, sqrt(3), 0 ]`
- `ellipsis`: to allow the 3-dots "...", e.g., `{ 1, 3, 5, ... }`
- `trailingComma`: to allow some expressions like `f(1,2,)`
- `blankTerms`: to allow some expressions like `f(1,,2)`

### Notes

* These expression are valid if allowed in `options.extra.{ellipsis, blankTerms}`:
  * `(..., a)`
  * `(, a)`
  * `(a, )` is tuple depending on extra options.
* Intervals, should have 2 terms as math expression:
  * `(..., a]`: throw syntax error
  * `(..., a)`: is a tuple, parsed if `extra.ellipsis ` is `true`
  * `[2, 1, ]`: is a matrix, parsed if `extra.trailingComma` is `true`
  * `(1, 2,)`: is a tuple, parsed if `extra.trailingComma ` is `true`
  * `[, a]`: is a matrix, parsed if `extra.blankTerms` is `true`
  * `(, a)`: is a tuple, parsed if `extra.blankTerms` is `true`

## .functions

Type = `Array<string>`, default = `[]`;

When `autoMult` is `true`, some expression like `f(x)` will be considered
as multiplication `f*(x)`, in order to parse it as a function with name = "f",
you can pass `options.functions = ['f']`.
When parsing `a.method(...)`, regardless of `singleCharName`, method names will be always multi-char name.

```
        member expression
             _/\_
           _/    \_
        __/        \________
        id          function
   name  |          | name = "method"
   = "a" |          | args = [ ... ]
```

## .builtInIDs

Type = `Array<string>`, default = `["infinity", "pi", "phi"]`;

To use multi-char names when setting [`singleCharName`](#.singleCharName) to true, for example:

|Math Expression| Equivalent To | singleCharName |
| ------------- | ------------- | -------------- |
| `1 + pix`  | `1 + p*i*x`|`true`|
|`1 + pi`| `1 + pi`|`true`|
|`1 + pix` |  `1 + pix`|`false`|

## .keepParen

Type = `boolean`, default = `false`.

If you want to make grouping parenthesis nodes in the result AST, `{ type: 'parenthesis', ... }`.


# Unsure about

In these confusing cases, you can handle the parsed expression to transform to what you want.

- `5^2x!`

To be `5^(2x!)` or `(5^2)(x!)` or `(5^2x)!`, ...
The current result AST is equivalent to `5^(2(x!))`.


# License

MIT
