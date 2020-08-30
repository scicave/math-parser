# math-parser
A mathematical expressions parser. We mean by mathematical that, e.g., arithmetic operations is considered for example if you pass "1+2", the result would by a (add node "+") with two children nodes of type number.

## Install
`npm install @scicave/math-parser`

## Usage

Require, import:
```js
const mathParser = require('@scicave/math-parser'); /*
  { parse: function(math:string [,options: object]),
  Node: constructor,
  SyntaxError: constructor }
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
```

## Options

- _autoMult_: boolean

Default: `true`

To perform multiplication in these cases:
1. 2x
2. sinxcosx
3. sinx(5y)
> Notice: sinxcosx when singleCharName is `false` will be variable name

- _singleCharName_: boolean

Default: `true`

Maths conventionally works with single char named variables and constants, but in programming languages you have freedom, moreover the convention is to use multi-char named identifier.
For example if you want to use "pi" or "phi", etc, you have to set this to `false`.  


- _memberExpressionAllowed_: boolean

Default: `true`

For example: `p.x` or `point.x`.


- _functions_: [string]

When autoMult is `true`, some expression like "f(x)" will be considered as multiplication, inorder to parse it as function with `callee` as instence of `mathParser.Node` has `type` of "id" and `name` equals "f".


## Unsure about
In these confusing cases, you can handle the parsed expression to transform to what you want.
- `5^2x!`

To be `5^(2x!)` or `(5^2)(x!)` or `(5^2x)!`, ...

This parser handles it as `5^(2x!)`.

## Lisence

MIT
