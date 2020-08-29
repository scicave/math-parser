# v2.1.1
Summary of Changes:
- update the README file

# v2.1.0
Summary of Changes:
- Fix factorial postfix operator "!"
- Enable single char to be a char suffixed by integer such as "p1, x0, x1, y123"
- Add "member expressions" Node and parse something like " 1+ p1.x"
Summary of Changes (dev):
- Add tests for member expression
- Commenting out some tests for future releases, insha'allah!
- When a test fail: the loged objects (node and struct) are simplified first to focus on some properties

# v2.0.0
Summary of Changes:
- All the changes after v1.0.0 - the last complete version - are ready
- Update the readme file

# v2.0.0-0
Becuase that changes after the last complete version are major, making the next version major is the best thing.

Summary of Changes:
- Fix ReferenceError: identifier "name" is not defined.
Summary of Changes (dev):
- Remove .toThrow tests from src/\_\_tests\_\_/parser.test.js

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
