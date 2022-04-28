const node = require("./NodeFactory");

module.exports = [
  {
    math: "2xsiny",
    parserOptions: { autoMult:false },
    error: true, errorType: "syntax"
  },

  {
    math: "2xsiny",
    struct: node.am([node.am([2, "x"]), node.BIF("sin", ["y"])]),
  },

  {
    math: "2axsiny",
    struct: node.am([
      node.am([node.am([2, "a"]), "x"]),
      node.BIF("sin", ["y"]),
    ]),
  },
];

