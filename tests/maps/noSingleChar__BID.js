const { node } = require("./utils");

module.exports = [

  {
    math: "1+pi",
    parserOptions: { singleCharName: false },
    struct: node.op("+", [1, "pi"])
  },

  {
    math: "1+xpi",
    parserOptions: { singleCharName: false },
    struct: node.op("+", [1, "xpi"])
  },

  {
    math: "1+pix",
    parserOptions: { singleCharName: false },
    struct: node.op("+", [1, "pix"])
  },

  {
    math: "1+pi()",
    parserOptions: { singleCharName: false },
    error: true, errorType: "syntax"
  },

];

