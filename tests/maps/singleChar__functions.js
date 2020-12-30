const { node } = require("./utils");

module.exports = [
  // incase of using methods from object, member expression
  // tests are performed there in the memExpr section
  {
    title: "strict=flase, options.function=[]: should parse f() as function",
    math: "f()",
    struct: ,
  },

  {
    title: "strict=true, options.function=[]: should throw error f()",
    math: "f()",
    error: true,
    errorType: parser.SyntaxError,
  },

  {
    math: "f(x)",
    parserOptions: { functions: [ "f" ] },

  },

  {
    math: "f(v +2 )(3/2)",
    parserOptions: { functions: [ "f" ] },
  },

  {
    math: "",
    parserOptions: { functions: [ "f" ] },
  },

  {
    title: "function with no arguments, no parserOptions, 2f()!",
    math: "2f()!",
  },

  {
    title: "function with no arguments, with parserOptions, 2f()!",
    math: "2f()!",
    parserOptions: { singleCharName: false, functions: ["f"] },
  },

  {
    math: "2f(x)!",
    parserOptions: { functions: [ "f" ] },
  },

];
