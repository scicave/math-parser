const { node } = require("./utils");

module.exports = [

  {
    title: "function with no arguments, 2longFuncName()!",
    math: "2longFuncName()!",
    parserOptions: { singleCharName: false, functions: ['longFuncName'] },
    struct: node.am([2, node.pOP("!", [node.F("longFuncName", [])])]),
  },

  {
    title: "function with multiple arguments",
    math: "-.2longFuncName(1,2, sqrt(1)^(x))!",
    parserOptions: { singleCharName: false, functions: ['longFuncName'] },
    struct: node.am([
      -0.2,
      node.pOP("!", [
        node.F("longFuncName", [1,2,
          node.op("^", [
            node.F('sqrt', [1]),
            "x"
          ])
        ])
      ])]
    ),
  },

  {
    math: "ax sin 3y",
    parserOptions: { singleCharName: false },
    struct: node.am([
      "ax",
      node.BIF("sin", [node.am([3, "y"])])
    ])
  },

  {
    title: "should use function id as reference (or variable) when strict=false",
    math: "(2longFuncName! + x)",
    parserOptions: { singleCharName: false, keepParentheses: true, functions: ['longFuncName'] },
    struct: node.paren([node.op("+", [
      node.am([2, node.pOP("!", ["longFuncName"])]),
      "x"
    ])]),
  },

  {
    title: "sould throw error when strict=true",
    math: "(2longFuncName + x)",
    parserOptions: { singleCharName: false, strict: true, functions: ['longFuncName'] },
    error: true,
    errorType: "syntax",
  },

  {
    math: "fn(variable_name ^ 2 )(3/2)",
    parserOptions: { singleCharName: false, functions: ['fn'] },
    struct: node.am([
      node.F("fn", [
        node.op("^", ["variable_name", 2])
      ]),
      node.op("/", [3,2])
    ]),
  },

];
