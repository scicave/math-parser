const { node } = require("./utils");

module.exports = [
  {
    math: "1+pi",
    struct: node.op("+", [1, "pi"]),
  },

  {
    math: "1+xpi",
    struct: node.op("+", [1, node.am([node.am(["x", "p"]), "i"])]),
  },

  {
    math: "1+pix",
    struct: node.op("+", [1, node.am([node.am(["p", "i"]), "x"])]),
  },

  {
    math: "2pi",
    struct: node.am([2, "pi"]),
  },

  {
    math: "2^2pi",
    struct: node.op("^", [2, node.am([2, "pi"])]),
  },

  {
    math: "2^2pi!",
    struct: node.op("^", [2, node.am([2, node.pOP("!", ["pi"])])]),
  },

  {
    math: "1+pi()",
    error: true,
    errorType: "syntax",
  },
];
