# v2.0.0-0
Summary of Changes:
- Fix ReferenceError: identifier "name" is not defined.
Summary of Changes (dev):
- Remove .toThrow tests from src/__tests__/parser.test.js

# v1.1.0-0
Summary of Changes:
- Node has check and checkType methods:
  * check: to check for all property except args
  * checkType: to check the type of Node instance, it can be done using check
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
- Do some tests in the parsing proces
- Add some todo comments for next releases
