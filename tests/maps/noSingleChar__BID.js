const node = require("./NodeFactory");

module.exports = [
  {
    math: "1+pi",
    parserOptions: { singleCharName: false },
    struct: node.op("+", [1, "pi"]),
  },

  {
    title: "should parse: mine as builtInId when passed through options",
    math: "1+mine",
    parserOptions: { singleCharName: false, builtInIDs: ["mine"] },
    struct: node.op("+", [1, "mine"]),
  },

  {
    math: "1+pix",
    parserOptions: { singleCharName: false },
    struct: node.op("+", [1, "pix"]),
  },

  {
    math: "1+xpi",
    parserOptions: { singleCharName: false },
    struct: node.op("+", [1, "xpi"]),
  },

  {
    math: "1+pi()",
    parserOptions: { singleCharName: false },
    error: true,
    errorType: "syntax",
  },
];
