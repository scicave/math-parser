const node = require('./NodeFactory');

module.exports = [

  {
    math: "1", // any-expression to pass some other checks
    title: "should throw: multi-char aren't allowed when singleCharName",
    parserOptions: { functions: ["asd"] },
    error: true, errorType: "options"
  },

  {
    title: "test the three dots to expand the default builtinFunctions.secondary",
    math: "sqrt(1) + asd(x)",
    parserOptions: { builtinFunctions: { secondary: [ "...", "asd" ] } },
    struct: node.op("+", [
      node.BIF("sqrt", [1]),
      node.BIF("asd", ["x"])
    ])
  },

  {
    title: "test the three dots to expand the default builtinFunctions.primary",
    math: "sinx + asdy",
    parserOptions: { builtinFunctions: { primary: [ "...", "asd" ] } },
    struct: node.op("+", [
      node.BIF("sin", ["x"]),
      node.BIF("asd", ["y"])
    ])
  },

];
