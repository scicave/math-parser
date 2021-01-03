const { node } = require("./utils");

module.exports = [
  
  {
    math: "1+pi",
    struct: node.op("+", [1, "pi"]),
  }

];
