# math-parser
A math expressions parser. We mean by mathematical that, e.g., arithmetic operations is considered for example if you pass "1+2", the result would by a (add node "+") with two children nodes of type number.

# Install
`npm install @scicave/math-parser`

# Usage

Require, import:
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

console.log(mathParser.parse('2long_var_name', { singleCharName: false, }));

// xlong_var_name is considered as one var not automult
console.log(mathParser.parse('xlong_var_name', { singleCharName: false, }));

console.log(mathParser.parse('f(x).someProperty.fn(y).result ^ 2  \n!', { functions: ['f'] }));

// strict is false by default so this is true, unlike the previous parsing process
console.log(mathParser.parse('f().someProperty.fn(y).result ^ 2  \n!'));

```

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

Maths conventionally works with single char named variables and constants, but in programming languages you have freedom. Moreover, the convention is to use multi-char named identifier.
For example, if you want to use "pi" or "phi", etc, you have to set this to `false`.  

When a member expression is found, properties and methods are allowed to be multichar, despite of `options.singleCharName`

> TODO: make new options `variables`, with default values "pi" and "phi", ..., use this option to deal with some multi-char variable (or constants, or you can say identifiers) in singleCharName mode

## .strict

Type = `boolean`, default = `false`;

When false:

- `f()`: is parsed as function whether or not it exists in `options.functions`
- `sin + 2`: you can you functions identifiers as references, with no arguments.

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
- `sets` true or false, will return its items in the property `args`, affected with the option `extra.ellipsis`. for example: `{ 1, sqrt(pi), ..., sqrt(pi)^10 }`.
- `tuples `true or false, e.g., `(1, 2, x, ...)`.
- `ellipsis`:
    - `0` or other falsy values: is not allowed
    - `1` or other truthy values: `(1, 2, x, ...)` is allowed.
    - `2`: `(1, 2, ..., x, ...)` is allowed.
    - The same for function's arguments.


## .functions

Type = `Array<string>`, default = `[]`;

When `autoMult` is `true`, some expression like `f(x)` will be considered
as multiplication `f*(x)`, in order to parse it as a function with name = "f",
you can pass `options.functions = ['f']`.
Notice that when `strict = false`, some expression such as `f()`,
an id followed by empty parentheses, will be parsed with type = "function"
whether or not `options.functions` includes "f".

When parsing `a.method(...)`, regardless of options, `method` will be always.
```
      member expression
            /\_
           /   \_
        __/      \________
        id        function
     | name        | name = "method"
     | = "a"       | args = [ ... ]
```

# Unsure about
In these confusing cases, you can handle the parsed expression to transform to what you want.

- `5^2x!`

To be `5^(2x!)` or `(5^2)(x!)` or `(5^2x)!`, ...
The result parser tree is equivalent to `(5^2)(x!)`.


# License

MIT
