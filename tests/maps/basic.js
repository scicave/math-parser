const { node } = require("./utils");

module.exports = [

  {
    math: "",
    error: true, errorType: "syntax"
  },

  {
    math: "1+2^1.2 / x ! * -5.236 --2",
    struct: node.op("-", [
      node.op("+", [
        1,
        node.op("*", [
          node.op("/", [
            node.op("^", [2,1.2]),
            node.pOP("!", ["x"]),
          ]),
          -5.236,
        ]),
      ]),
      -2
    ]),
  },

  {
    math: "5^2x!",
    struct: node.op("^", [
      5,
      node.am([
        2,
        node.pOP("!", ["x"])
      ])
    ]),
  },

  {
    math: "a >= 2",
    struct: node.op(">=", ["a", 2])
  },

  {
    math: "x == 2",
    struct: node.op("==", ["x", 2])
  },

  {
    math: "x = 2",
    struct: node.op("=", ["x", 2])
  },

  {
    math: "2xysina(2)",
    struct: node.am([
      node.am([
        node.am([
          node.am([2,"x"]),
          "y"
        ]),
        node.BIF("sin", ["a"])
      ]),
      2
    ])
  },

  {
    title: "should parse: \"a\" as function when defined in options.functions",
    math: "2xysina(2)",
    parserOptions: { functions: ["a"] },
    struct: node.am([
      node.am([
        node.am([2,"x"]),
        "y"
      ]),
      node.BIF("sin", [node.F("a", [2])])
    ])
  },

  {
    math: "2x^4y",
    struct: node.am([
      2,
      node.op("^", [
        "x",
        node.am([4, "y"])
      ])
    ])
  },

  {
    math: "2x^4y!",
    struct: node.am([
      2,
      node.op("^", [
        "x",
        node.am([4, node.pOP("!", ["y"])])
      ])
    ])
  },

  {
    math: "2x^4ysinx!",
    struct: node.am([
      2,
      node.op("^", [
        "x",
        node.am([
          node.am([4, "y"]),
          node.BIF("sin", [node.pOP("!", ["x"])])
        ])
      ])
    ])
  },

  {
    math: " 2x^4 ysinx!",
    struct: node.am([
      2,
      node.op("^", [
        "x",
        node.am([
          node.am([4, "y"]),
          node.BIF("sin", [node.pOP("!", ["x"])])
        ])
      ])
    ])
  },

  {
    math: "2x^-45.1y^sinx",
    struct: node.am([
      2,
      node.op("^", [
        "x",
        node.am([
          -45.1,
          node.op("^", [
            "y", node.BIF("sin", ["x"])
          ])
        ])
      ])
    ])
  },

]

