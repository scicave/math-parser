module.exports = {
  autoMult: true,
  singleCharName: true,
  keepParen: false,
  functions: [],
  builtinIDs: ["infinity", "pi", "phi"],
  // operatorSequence: true,
  extra: {
    memberExpressions: true,
    intervals: true,
    tuples: true,
    sets: true,
    matrices: true,
    ellipsis: {
      matrices: true,
      tuples: true,
      funcArgs: true,
      sets: true,
      infixOperators: true
    },
  },
  builtinFunctions: {
    primary: [
      // can be used like "sinx, logx"
      "sin", "cos", "tan", "sec",  "csc",  "cot", "asin", "acos", "atan",
      "asec", "acsc", "acot", "sinh", "cosh", "tanh", "sech", "csch", "coth",
      "ln", "log",
    ],
    secondary: [
      "exp", "floor", "ceil", "round", "random", "sqrt",
      // hyperbolic function
      "arsinh", "arcosh", "artanh", "arsech", "arcsch", "arcoth",
      "arcsin", "arccos", "arcotan", "arcsec", "arccsc", "arccot",
    ],
  },
};

