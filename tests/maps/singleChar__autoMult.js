const { node } = require("./utils");

module.exports = [
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
