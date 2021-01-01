const { node } = require("./utils");

module.exports = [
  // incase of using methods from object, member expression
  // tests are performed there in the memExpr section
  {
    title: "should parse: f() as function, strict=flase, options.function=[]",
    math: "f()",
    struct: node.F("f", []),
  },

  {
    title: "should throw: error f(), strict=true, options.function=[]",
    math: "f()",
    parserOptions: { strict: true },
    error: true,
    errorType: "syntax",
  },

  {
    math: "f(x)",
    parserOptions: { functions: [ "f" ] },
    struct: node.F("f", ["x"])
  },

  {
    math: "f(1,2,3x)",
    parserOptions: { functions: [ "f" ] },
    struct: node.F("f", [1,2,node.am([3,"x"])])
  },

  {
    math: "axsin3y",
    parserOptions: { functions: [ "f" ] },
    struct: node.am([
      node.am(["a","x"]),
      node.BIF("sin", [node.am([3,"y"])])
    ])
  },

  {
    math: "f(v +2 )(3/2)",
    parserOptions: { functions: [ "f" ] },
    struct: node.am([
      node.F("f", [node.op("+", ["v",2])]),
      node.op("/", [3,2])
    ])
  },

  {
    title: "should parse: function with no arguments, no parserOptions, 2f()!",
    math: "2f()!",
    struct: node.am([
      2,
      node.pOP("!", [node.F("f", [])])
    ])
  },

  {
    title: "function with no arguments, with parserOptions, 2f()!",
    math: "2f()!",
    parserOptions: { functions: ["f"] },
    struct: node.am([
      2,
      node.pOP("!", [node.F("f", [])])
    ])
  },

  {
    math: "2f(cosx,2)!",
    parserOptions: { functions: [ "f" ] },
    struct: node.am([
      2,
      node.pOP("!", [node.F("f", [
        node.BIF("cos", ["x"]),
        2
      ])])
    ])
  },

];
