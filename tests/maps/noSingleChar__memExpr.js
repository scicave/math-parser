const { node } = require("./utils");

module.exports = [

  {
    math: "point.x",
    parserOptions: { singleCharName: false,  },
    struct: node.mem(["point", "x"]),
  },

  {
    math: "should throw: when options.memExpressionAllowed=false, (point.x)",
    parserOptions: { singleCharName: false, memExpressionAllowed: false },
    error: true, errorType: "syntax"
  },

  {
    math: "1+ point.component_1^2!",
    parserOptions: { singleCharName: false,  },
    struct: node.op("+", [
      1,
      node.op("^", [
        node.mem(["point", "component_1"]),
        node.pOP("!", [2])
      ])
    ])
  },

  {
    math: "1 + point1.  func()",
    parserOptions: { singleCharName: false,  },
    struct: node.op("+", [
      1,
      node.mem(["point1", node.F("func", [])])
    ])
  },

  {
    math: "1 + point1  .\n func(1.2+x, s)",
    parserOptions: { singleCharName: false,  },
    struct: node.op("+", [
      1,
      node.mem(["point1", node.F("func", [
        node.op("+", [1.2, "x"]),
        "s"
      ])])
    ])
  },

  {
    math: "1 + p_1().func(1.2+x)!^2",
    parserOptions: { singleCharName: false, strict: true },
    error: true, // the next one won't throw
    errorType: "syntax"
  },

  {
    math: "1 + p_1().func(1.2+x)!^2",
    parserOptions: { singleCharName: false, functions: ["p_1"] },
    struct: node.op("+", [
      1,
      node.op("^",[
        node.pOP("!",[
          node.mem([
            node.F("p_1", []),
            node.F("func", [
              node.op("+", [1.2, "x"])
            ])
          ])
        ]),
        2
      ])
    ])
  },

];
