const path = require('path');
let pkg = require(path.resolve(process.cwd(), 'package.json'));
let parser = require(path.resolve(process.cwd(), pkg.main));

expect.extend({
  /**
   * @param {parser.Node} node
   * @param {Obj} struct
   */
  toHaveStructure(node, struct) {
    // struct number{1}
    function failed(msg) {
      return { message: () => `${msg}\n\n====================== node ======================\n${JSON.stringify(node, null, 2)}\n\n====================== expected ======================${JSON.stringify(struct, null, 2)}`, pass: false };
    }

    if (!(node instanceof parser.Node)) {
      return failed(`Received value has to be instance of parser.Node`, node);
    }

    if (!(struct instanceof Object)) {
      return failed(`"struct" is type of ${typeof struct}, toHaveStructure checks the match between parser.Node and object.`, node);
    }

    function _check(n, s, nPath, sPath) {

      nPath = (nPath ? nPath + '.' : '') + n.type;
      sPath = (sPath ? sPath + '.' : '') + s.type;

      if (!n.check(s)) {
        let _n = { ...n }, _s = { ...s };
        delete _n.args; delete _s.args;
        _n = JSON.stringify(_n); _s = JSON.stringify(_s);
        return failed(`properties of ${nPath} in node, don't match these of ${sPath} of struct`, node);
      }

      if (s.args && n.args) {
        if (s.args.length !== n.args.length) {
          return failed(`${sPath} in struct and ${nPath} in node args has different lengths`, node);
        }
        for (let i = 0; i < s.args.length; i++) {
          let c = _check(n.args[i], s.args[i], nPath, sPath);
          if (c) return c; // here a problem is found
        }
      } else if (s.args || n.args) {
        if (s.args) {
          return failed(`${sPath} in struct has args but ${nPath} in node doesn't`, node);
        } else {
          return failed(`${nPath} in node has args but ${sPath} in struct doesn't`, node);
        }
      }

    }

    return (
      _check(node, struct) ||
      { message: () => "Parse-tree matches the structure object!", pass: true }
    );
  },
});

function parse(math, options = {}) {
  try {
    return parser.parse(math, options);
  } catch (e) {
    if (e instanceof parser.SyntaxError) {
      console.log("SyntaxError:", e.message);

      let i = e.location.start.line - 1;
      let lines = math.split('\n');

      let log = function () {
        if (i - 2 > -1)
          console.log(lines[i - 2]);
        if (i - 1 > -1)
          console.log(lines[i - 1]);
        console.log();
        console.log(lines[i]);
        console.log((new Array(e.location.start.column - 1)).fill("_").join('') + "^");
        console.log();
        if (i + 1 < lines.length)
          console.log(lines[i + 1]);
        if (i + 2 < lines.length)
          console.log(lines[i + 2]);
      };

      log();

    } else {
      throw e;
    }
  }
}

describe('parse basic arithmetics', () => {

  test("1+2^1.2 / x * -5.236 --2", () => {
    expect(parse('1+2^1.2 / x * -5.236 --2')).toHaveStructure({
      type: 'operator', name: "-",
      "args": [
        {
          type: 'operator', name: '+',
          "args": [
            { value: 1, type: "number" },
            {
              type: 'operator', name: '*',
              "args": [
                {
                  type: 'operator', name: '/',
                  "args": [
                    {
                      type: 'operator', name: '^',
                      "args": [
                        { value: 2, type: "number" },
                        { value: 1.2, type: "number" },
                      ]
                    },
                    { name: "x", type: "id", }
                  ]
                },
                { value: -5.236, type: "number" },
              ]
            }
          ]
        },
        { value: -2, type: "number", }
      ]
    });
  });

});

describe('tests singleCharName=true', () => {

  describe("tests intellicense, automult", () => {

    test('tests: 2xsiny', () => {
      expect(parse('2xsiny')).toHaveStructure({
        "type": "automult",
        "args": [
          {
            type: 'automult',
            args: [
              {
                "value": 2,
                "type": "number",
              }, {
                type: 'id',
                name: 'x'
              },
            ]
          },
          {
            type: 'function',
            callee: {type: 'id', name: 'sin'},
            isBuiltIn: true,
            args: [
              {
                type: 'id',
                name: 'y'
              }
            ]
          }
        ]
      });
    });

    test('tests: sinxcosx', () => {
      expect(parse('sinxcosx')).toHaveStructure({
        "type": "automult",
        "args": [
          {
            type: 'function',
            callee: {type: 'id', name: 'sin'},
            isBuiltIn: true,
            args: [
              { type: 'id', name: 'x' }
            ]
          },
          {
            type: 'function',
            callee: {type: 'id', name: 'cos'},
            isBuiltIn: true,
            args: [
              { type: 'id', name: 'x' }
            ]
          }
        ]
      });
    });

  });

});

describe('tests singleCharName=false', () => {

  let parserOptions = { singleCharName: false };

  describe("tests intellicense, automult", () => {

    test('tests: 2axsiny', () => {
      expect(parse('2axsiny', parserOptions)).toHaveStructure({
        "type": "automult",
        "args": [
          { value: 2, type: 'number', },
          { type: 'id', name: 'axsiny' },
        ]
      });
    });

    test('tests: 2axsin3y', () => {
      expect(parse('2axsin3y', parserOptions)).toHaveStructure({
        type: 'automult',
        args: [
          {
            type: 'automult',
            args: [
              { value: 2, type: 'number', },
              { name: 'ax', type: 'id', },
            ]
          }, {
            type: 'function',
            isBuiltIn: true,
            callee: {type: 'id', name: 'sin'},
            args: [
              {
                type: 'automult',
                args: [
                  { value: 3, type: 'number', },
                  { name: 'y', type: 'id', },
                ]
              }
            ]
          }
        ]
      });
    });

    test('tests: 2 ax   sin3y', () => {
      expect(parse('2 ax   sin3y', parserOptions)).toHaveStructure({
        type: 'automult',
        args: [
          {
            type: 'automult',
            args: [
              { value: 2, type: 'number', },
              { name: 'ax', type: 'id', },
            ]
          },
          {
            type: 'function',
            isBuiltIn: true,
            callee: {type: 'id', name: 'sin'},
            args: [
              {
                type: 'automult',
                args: [
                  { value: 3, type: 'number', },
                  { name: 'y', type: 'id', },
                ]
              }
            ]
          }
        ]
      });
    });

    test('tests: sinxcosx', () => {
      expect(parse('sinxcosx', parserOptions)).toHaveStructure({
        type: 'id', name: 'sinxcosx'
      });
    });

    test('tests: xsin2z', () => {
      expect(parse('xsin2z', parserOptions)).toHaveStructure({
        type: 'automult',
        args: [
          { type: 'id', name: 'x' },
          {
            type: 'function',
            isBuiltIn: true,
            callee: {type: 'id', name: 'sin'},
            args: [
              {
                type: 'automult',
                args: [
                  { type: 'number', value: 2 },
                  { type: 'id', name: 'z' },
                ]
              }
            ]
          }
        ]
      });
    });

    test('tests: sin 2 xa sd cos3x', () => {
      expect(()=>parse('sin 2 xa sd cos3x', parserOptions)).toThrow(parser.SyntaxError);
    });

    test('tests: sin 2 xasdcos3x + 1', () => {
      expect(()=>parse('sin 2 xasdcos3x + 1', parserOptions)).toThrow(parser.SyntaxError);
    });

  });

});

