# math-parser
A mathematical expressions parser. We mean by mathematical that, e.g., arithmetic operations is considered for example if you pass "1+2", the result would by a (add node "+") with two children nodes of type number.

## Install
`npm install @scicave/math-parser`

## Usage

```js
const mathParser = require('@scicave/math-parser'); /*
  { parse: function(math:string [,options: object]),
  Node: constructor,
  SyntaxError: constructor }
*/

console.log(mathParser.parse(' 1 * 5  ^x !'));

```

## Options
### autoMult: boolean

Default: `true`

To perform multiplication in these cases:
1. 2x
2. sinxcosx
3. sinx(5y)
> Notice: sinxcosx when singleCharName is `false` will be variable name

### singleCharName: boolean

Default: `true`

Maths conventionally works with single char named variables and constants, but in programming languages you have freedom, moreover the convention is to use multi-char named identifier.
For example if you want to use "pi" or "phi", etc, you have to set this to `false`.  

### functions: [string]

When autoMult is `true`, some expression like "f(x)" will be considered as multiplication, inorder to parse it as function with `callee` as instence of `mathParser.Node` has `type` of "id" and `name` equals "f".

## Lisence

MIT