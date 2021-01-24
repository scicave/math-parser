# math-parser

A math expressions parser. We mean by mathematical that, e.g., arithmetic operations is considered for example if you pass `1+2`, the result will be a node with type `operator` and name `+` with two children nodes of type `number` in its `args` property. Just play with expressions, log the result and see the different situations.

**See also:** [math-latex-parser](https://github.com/scicave/math-latex-parser)

## Install

`npm install @scicave/math-parser`

## Usage

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

// absolute values
console.log(mathParser.parse('||x - y| - |y - z||'));

// multi-char variables
console.log(mathParser.parse('2long_var_name', { singleCharName: false, }));
// xlong_var_name is considered as one var not automult
console.log(mathParser.parse('xlong_var_name', { singleCharName: false, }));

// member expressions and matrices, nonsense expression, but it can be parsed
console.log(mathParser.parse('f(x).someProperty ^ 2 >= [1,2,3; 5,6,7]', { functions: ['f'] }));

// will throw error, member expressions are not allowed
console.log(mathParser.parse('f(x).someProperty.fn(y).result ^ 2  \n!', {
  functions: ['f'],
  extra: { memberExpressions: false }
}));
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

## AST Node

The `parse` function returns a `Node`, which may have array of other `Node`s in its `args`.

### Node.prototype.type

The `Node` type, see the [available type](#nodetypes).

### Node.prototype.isBuiltIn

If the `Node` is either `id` or `function` it maybe a builtin.

See [builtInFunctions](#builtInfunctions), [builtInIDs](#builtinids). 

### Node.prototype.check(props: Object)

This method can check all properties except `args`, it will be ignored.

```js
let node = mathParser.parse("2!");
console.log(node.check({
  type: "operator",
  operatorType: "postfix",
  name: "!"
}));
// true
```

### Node.prototype.checkType(type: string)

You can check for `type` directly here.

```js
let node = mathParser.parse("1");
console.log(node.checkType("member expression"));
// false
```

### Node.prototype.hasChild(props: Object)

This method can check for any of `args` with properties `props`. It doesn't check for`args`, it will be ignored.

```js
let node = mathParser.parse("1+2");
// { type: "operator", args: [...], operatorType: "infix" }
console.log(node.hasChild({ type: "number", value: 1 }));
// true
```

### Node.prototype.hasChildR(props: Object)

The same as `hasChild`, but recursively.

```js
let node = mathParser.parse("sin(1+2)");
// { type: "function", name: "sin", args: [...], isBuiltIn: true }
console.log(node.hasChildR({ type: "number", value: 1 }));
// true
```

### Node.types

Available values for `Node.prototype.type` .

Array of literal strings: `Node.types.values` .

All Valid operators: `Node.types.operators` .

## Options

When invalid options passed, `mathParser.OptionsError` is thrown.

### .autoMult

Type = `boolean`, default: `true`.

To perform multiplication in these cases:
1. `2x`
2. `sinxcosx`
3. `sinx(5y)`
> Notice: `sinxcosx` when `singleCharName` is false will be a variable name

### .singleCharName

Type = `boolean`, default: `true`.

Maths conventionally works with single char named variables and constants, but in programming languages you have freedom. The convention in programming is to use multi-char named identifier. See: [options.builtInIDs](#builtinids).

When a member expression is found, properties and methods are allowed to be multi-char, despite of `options.singleCharName`, see: `options.extra.memberExpressions`.

You can use `a1, a2, ...` as single-char names.

### .extra

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

----------------------

Notes

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

### .functions

Type = `Array<string>`, default = `[]`;

When `autoMult` is `true`, some expression like `f(x)` will be considered
as multiplication `f*(x)`, in order to parse it as a function with name = "f",
you can pass `options.functions = ['f']`.

When `singleCharName == true`, you should pass single-char functions. 

When parsing `a.method(...)`, regardless of `singleCharName`, method names will be always multi-char name.

```
        member expression
              /\
            /    \
        __/        \________
        id          function
   name  |          | name = "method"
   = "a" |          | args = [ ... ]
```

### .builtInIDs

Type = `Array<string>`, default = `["infinity", "pi", "phi"]`;

To use multi-char names when setting [`singleCharName`](#singlecharname) to true, for example:

|Math Expression| Equivalent To | singleCharName |
| ------------- | ------------- | -------------- |
| `1 + pix`  | `1 + p*i*x`|`true`|
| `1 + xpi` | `1 + x*p*i`|`true`|
|`1 + x pi`| `1 + x*pi`|`true`|
|`1 + pi`| `1 + pi`|`true`|
|`1 + pi x` |  `1 + pi*x`|`false`|
|`1 + pix` |  `1 + pix`|`false`|

### .builtInFunctions

Type = `{ primary: Array<string>, secondary: Array<string> }`, default 👇.

- `primary`: can be used like `sinx` and `logx`.
- `secondary`: has to be used with parenthesis, `exp(pi)` and  `arcoth(1.2^2)`. The secondary builtin functions could be passed throw [options.functions](#functions), but let them be here to avoid putting them redundantly in `options.functions`.

Notice, when `singleCharName == true`, all primary and secondary has to be used with parenthesis "(...)", `sinx` is considered as node with type "id" and name "sinx".

```json
////////    primary   ///////
// can be used like "sinx, logx"
"sin", "cos", "tan", "sec",  "csc",  "cot", "asin", "acos", "atan",
"asec", "acsc", "acot", "sinh", "cosh", "tanh", "sech", "csch", "coth",
"ln", "log",

////////   secondary   ///////
"exp", "floor", "ceil", "round", "random", "sqrt",
// hyperbolic function
"arsinh", "arcosh", "artanh", "arsech", "arcsch", "arcoth",
"arcsin", "arccos", "arcotan", "arcsec", "arccsc", "arccot",
```

### .keepParen

Type = `boolean`, default = `false`.

If you want to make grouping parenthesis nodes in the result AST, `{ type: 'parenthesis', ... }`.


## Unsure about

In these confusing cases, you can handle the parsed expression to transform to what you want.

- `5^2x!`

To be `5^(2x!)` or `(5^2)(x!)` or `(5^2x)!`, ...
The current result AST is equivalent to `5^(2(x!))`.


## License

MIT

