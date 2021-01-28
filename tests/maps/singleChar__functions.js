const { node } = require("./utils");

module.exports = [
  {
    title: "should throw: error f(), options.function=[]",
    math: "f()",
    error: true,
    errorType: "syntax",
  },

  {
    math: "f(x)",
    parserOptions: { functions: ["f"] },
    struct: node.F("f", ["x"]),
  },

  {
    math: "sin2",
    // error: true, errorType: "syntax"
    struct: node.BIF("sin", [2]),
  },

  {
    math: "sin2!",
    // error: true, errorType: "syntax"
    struct: node.BIF("sin", [node.pOP("!", [2])]),
  },

  {
    math: "sinpi",
    struct: node.BIF("sin", ["pi"]),
  },

  {
    math: "sinpi!",
    struct: node.BIF("sin", [node.pOP("!", ["pi"])]),
  },

  {
    math: "asdx",
    parserOptions: { builtinFunctions: { primary: ["asd"] } },
    struct: node.BIF("asd", ["x"]),
  },

  {
    title:
      "should parse: as automult when not found in builtinFunction or functions",
    math: "sin(2)",
    parserOptions: { builtinFunctions: { primary: [], secondary: [] } },
    struct: node.am([node.am([node.am(["s", "i"]), "n"]), 2]),
  },

  {
    math: "f(1,2,3x)",
    parserOptions: { functions: ["f"] },
    struct: node.F("f", [1, 2, node.am([3, "x"])]),
  },

  {
    math: "axsin3y",
    parserOptions: { functions: ["f"] },
    struct: node.am([
      node.am(["a", "x"]),
      node.BIF("sin", [node.am([3, "y"])]),
    ]),
  },

  {
    math: "f(v +2 )(3/2)",
    parserOptions: { functions: ["f"] },
    struct: node.am([
      node.F("f", [node.op("+", ["v", 2])]),
      node.op("/", [3, 2]),
    ]),
  },

  {
    math: "2f()!",
    parserOptions: { functions: ["f"] },
    struct: node.am([2, node.pOP("!", [node.F("f", [])])]),
  },

  {
    math: "2f(cosx,2)!",
    parserOptions: { functions: ["f"] },
    struct: node.am([
      2,
      node.pOP("!", [node.F("f", [node.BIF("cos", ["x"]), 2])]),
    ]),
  },
];
