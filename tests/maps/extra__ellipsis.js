const node = require("./NodeFactory");

module.exports = [
  {
    title: 'should parse: as tuple not interval when finding ellipsis "..."',
    math: "(..., a)",
    struct: node.tuple([node.ellipsis, "a"]),
  },

  {
    title: 'should parse: as tuple not interval when finding ellipsis "..."',
    math: "(a, ...)",
    struct: node.tuple(["a", node.ellipsis]),
  },

  {
    title: 'should throw: interval, but it isn\'t considered so, because of "..."',
    math: "[a, ...)",
    error: true,
    errorType: "syntax",
  },

  {
    title: 'should throw: interval, but it isn\'t considered so, because of "..."',
    math: "(a, ...]",
    error: true,
    errorType: "syntax",
  },

  {
    title: 'should throw: interval, but it isn\'t considered so, because of "..."',
    math: "]a, ...]",
    error: true,
    errorType: "syntax",
  },

  {
    title: 'should throw: interval, but it isn\'t considered so, because of "..."',
    math: "]a, ...[",
    error: true,
    errorType: "syntax",
  },

  {
    title: 'should throw: interval, but it isn\'t considered so, because of "..."',
    math: "[a, ...[",
    error: true,
    errorType: "syntax",
  },

  {
    title: "should parse: as matrix",
    math: "[a, ...]",
    struct: node.matrix([["a", node.ellipsis]]),
  },

  {
    title: "should parse: as matrix",
    math: "[a, b]",
    parserOptions: { extra: { intervals: false } },
    struct: node.matrix([["a", "b"]]),
  },

  {
    math: "a(1,4,...)",
    struct: node.am(["a", node.tuple([1, 4, node.ellipsis])]),
  },

  {
    math: "{1,4,...}",
    struct: node.set([1, 4, node.ellipsis]),
  },

  {
    math: "[1,4, ...]",
    struct: node.matrix([[1, 4, node.ellipsis]]),
  },

  {
    math: "f(...)",
    error: true,
    errorType: "syntax",
  },

  {
    title: `should parse: as automult of "f" and a tuple`,
    math: "f(..., 2)",
    struct: node.am(["f", node.tuple([node.ellipsis, 2])]),
  },

  {
    title: "should parse: as function with ellipsis as arg",
    math: "f(..., 2)",
    parserOptions: { functions: ["f"] },
    struct: node.F("f", [node.ellipsis, 2]),
  },

  // ************************
  //    sequence operators
  // ************************

  // {
  //   math: "1 + 2 + ... + 10",
  //   struct: node.sqop("+", [1, 2, node.ellipsis, 10]),
  // },
  //
  // {
  //   math: "... + 10",
  //   struct: node.sqop("+", [node.ellipsis, 10]),
  // },
  //
  // {
  //   math: "10 + ...",
  //   struct: node.sqop("+", [10, node.ellipsis]),
  // },
  //
  // {
  //   math: "10 + ... + 10",
  //   struct: node.sqop("+", [10, node.ellipsis, 10]),
  // },
  //
  // {
  //   math: "10 + ... * a + 10",
  //   error: true,
  //   errorType: "syntax",
  // },
  //
  // {
  //   math: "10 + 1 * ... * a + 10",
  //   struct: node.sqop("+", [10, node.sqop("*", [1, node.ellipsis, "a"]), 10]),
  // },
  //
  // {
  //   math: "y + a * ... + 10",
  //   error: true,
  //   errorType: "syntax",
  // },
  //
  // {
  //   math: "y + a * sinx * ... - 10",
  //   struct: node.op("-", [
  //     node.op("+", [
  //       "y",
  //       node.sqop("*", ["a", node.BIF("sin", ["x"]), node.ellipsis]),
  //     ]),
  //     10,
  //   ]),
  // },
];
