const { node } = require("./utils");

module.exports = [
  
  {
    math: "1+pi",
    struct: node.op("+", [1, "pi"]),
  },

  {
    math: "1+xpi",
    struct: node.op("+", [1,
      node.am([node.am(["x", "p"]), "i"]),
    ]),
  },

  {
    math: "1+xpi",
    struct: node.op("+", [1,
      node.am([node.am(["x", "p"]), "i"]),
    ]),
  },

  {
    math: "1+pi()",
    error: true, errorType: "syntax"
  },

];
