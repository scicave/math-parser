const node = require("./NodeFactory");

module.exports = [

  {
    math: "2axsiny",
    parserOptions: { singleCharName: false },
    struct: node.am([2, "axsiny"]),
  },

  {
    math: "sinxcosx",
    parserOptions: { singleCharName: false },
    struct: "sinxcosx",
  },

];
