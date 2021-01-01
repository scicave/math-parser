const { node } = require("./utils");

module.exports = [

  {
    math: "1+2^1.2 / x ! * -5.236 --2",
    struct: node.op("-", [
      node.op("+", [
        1,
        node.op("*", [
          node.op("/", [
            node.op("^", [2,1.2]),
            node.pOP("!", ["x"]),
          ]),
          -5.236,
        ]),
      ]),
      -2
    ]),
  },

  {
    math: "5^2x!",
    struct: node.am([
      node.op("^", [5,2]),
      node.pOP("!", ["x"])
    ]),
  },

  {
    math: "(1, 3, \n4)",
    struct: node.tuple([1,3,4]),
  },

]
