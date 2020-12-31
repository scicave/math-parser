const { node } = require("./utils");

module.exports = [

  {
    title: "function with no arguments, 2longFuncName()!",
    math: "2longFuncName()!",
    parserOptions: { singleCharName: false, functions: ['longFuncName'] },
    struct: node.am([2, node.pOP("!", [node.F("longFuncName", [])])]),
  },

  {
    title: "should use function id as reference (or variable) when strict=false",
    math: "(2longFuncName! + x)",
    parserOptions: { singleCharName: false, functions: ['longFuncName'] },
    struct: node.block("()", [node.op("+", [
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
    math: "fn(variable_name &&2 )(3/2)",
    parserOptions: { singleCharName: false, functions: ['fn'] },
    struct: node.am([
      node.F("fn", [
        node.op("&&", ["variable_name", 2])
      ]),
      node.block("()", [node.op("/", [3,2])])
    ]),
  },

];
