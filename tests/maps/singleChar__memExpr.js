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
    math: "p1.s(x,2).c - 1^2!",
    parserOptions: { functions: ['p1.f'] },
    struct: node.op("-", [
      node.mem([
        node.mem(["p1", node.F("s", ["x",2])]),
        "c"
      ]),
      node.op("^", [1, node.pOP("!", [2])])
    ]),
  },

  {
    math: "1 + p1.fn()",
    struct: node.op("+", [
      1,
      node.mem(["p1", node.F("fn", [])])
    ]),
  },

  {
    math: "1 + p1.f(1.2+x)",
    struct: node.op("+", [
      1,
      node.mem(["p1", node.F("f", [
        node.op("+", [1.2, "x"])
      ])])
    ]),
  },

  {
    math: "1 + p1.fn()!^2",
    parserOptions: { functions: ['n'] },
    struct: node.op("+", [
      1,
      node.op("^", [
        node.pOP("!", [
          node.mem(["p1", node.F("fn", [])])
        ]),
        2
      ])
    ]),
  },

];
