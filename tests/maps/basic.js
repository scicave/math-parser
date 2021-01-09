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
    math: "2x^4y",
    struct: node.am([
      node.am([
        2,
        node.op("^", ["x", 4])
      ]),
      "y"
    ])
  },

  {
    math: "2x^4y!",
    struct: node.am([
      node.am([
        2,
        node.op("^", ["x", 4])
      ]),
      node.pOP("!", ["y"])
    ])
  },

]

