const { node } = require("./utils");

module.exports = [

  {
    math: "p1.x",
    struct: node.mem(["p1", "x"]),
  },

  {
    math: "1+ p1.x^2!",
    struct: node.op("+", [
      1,
      node.op("^", [
        node.mem(["p1", "x"]),
        node.pOP("!", [2])
      ])
    ]),
  },

  {
    math: "p1.s(x).c - 1^2!",
    parserOptions: { functions: ['p1.f'] },
    struct: node.op("-", [

    ]),
  },

  {
    math: "1 + p1.fn()",
    struct: node.op("+", [

    ]),
  },

  {
    math: "1 + p1.fn()!^2",
    parserOptions: { functions: ['n'] },
    struct: node.op("+", [

    ]),
  },

  {
    math: "1 + p1.f(1.2+x)",
    struct: node.op("+", [

    ]),
  },

  {
    title: "Function as method in a member expression",
    math: "1 + p1.f(1.2+x)!^2",
    parserOptions: { functions: ['p1.f'] },
    struct: node.op("+", [

    ]),
  },

];
