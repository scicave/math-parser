const { node } = require("./utils");

module.exports = [
  // ************************
  //         tuples
  // ************************

  {
    math: "(1,1,4)",
    struct: node.tuple([1, 1, 4]),
  },

  {
    math: "f(1,1,4)",
    parserOptions: { functions: ["f"] },
    struct: node.F("f", [1, 1, 4]),
  },

  // ************************
  //        matrices
  // ************************

  {
    math: "[1,1,4]",
    struct: node.matrix([[1, 1, 4]]),
  },

  {
    title: "should parse: matrix with multiple rows",
    math: "[1,1,4; ..., 2,sqrt(a)]",
    struct: node.matrix([
      [1, 1, 4],
      [node.ellipsis, 2, node.F("sqrt", ["a"])],
    ]),
  },

  {
    title: "should throw: when column of matrix has different lengths",
    math: "[1,2; 1,2,4]",
    error: true,
    errorType: "syntax",
  },

  // ************************
  //          sets
  // ************************

  {
    math: "{1,1,4}",
    struct: node.set([1, 1, 4]),
  },

  // ************************
  //        intervals
  // ************************

  {
    math: "(t, a)",
    struct: node.interval(["t", "a"]),
  },

  {
    math: "[t, a)",
    struct: node.interval(["t", "a"], {
      startInclusive: true,
      endInclusive: false,
    }),
  },

  {
    math: "(t, a]",
    struct: node.interval(["t", "a"], {
      startInclusive: false,
      endInclusive: true,
    }),
  },

  {
    math: "[t, a]",
    struct: node.interval(["t", "a"], {
      startInclusive: true,
      endInclusive: true,
    }),
  },

  {
    title: "should parse: as matrix when extra.intervals is false",
    math: "[t, a]",
    parserOptions: { extra: { intervals: false } },
    struct: node.matrix([["t", "a"]]),
  },

  {
    title: "should parse: as tuple when extra.intervals is false",
    math: "(t, a)",
    parserOptions: { extra: { intervals: false } },
    struct: node.tuple(["t", "a"]),
  },

  // ************************
  //   blankTerms, ellipsis
  // ************************

  {
    math: "(a,)",
    // struct: node.tuple(["a"])
    error: true,
    errorType: "syntax",
  },

  {
    // title: "should parse: as tuple not interval when 1st term is blank",
    math: "(,a)",
    // struct: node.tuple([node.blank, "a"])
    error: true,
    errorType: "syntax",
  },

  {
    title:
      "should parse: as tuple not interval when trailing comma after 2 terms",
    math: "(a,b,)",
    // struct: node.tuple(["a", "b"])
    error: true,
    errorType: "syntax",
  },

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
    title:
      'should throw: interval, but it isn\'t considered so, because of "..."',
    math: "[a, ...)",
    error: true,
    errorType: "syntax",
  },

  {
    title:
      'should throw: interval, but it isn\'t considered so, because of "..."',
    math: "(a, ...]",
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
    math: "f(1,4,...)",
    struct: node.am(["f", node.tuple([1, 4, node.ellipsis])]),
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
    math: "1 + 2 + ... + 10",
    struct: node.op("+", [
      node.op("+", [node.op("+", [1, 2]), node.ellipsis]),
      10,
    ]),
  },
];
