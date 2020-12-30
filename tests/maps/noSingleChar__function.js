const { node } = require("./utils");

module.exports = [

  {
    title: "function with no arguments, 2longFuncName()!",
    math: "2longFuncName()!",
    parserOptions: { singleCharName: false, functions: ['longFuncName'] },
    struct: ,
  },

  {
    math: "fn(variable_name +2 )(3/2)",
    parserOptions: { singleCharName: false, functions: ['longFuncName'] },
    struct: ,
  },

  {
    title: "should use function id as reference (or variable) when strict=false",
    math: "(2longFuncName + x)",
    parserOptions: { singleCharName: false, functions: ['longFuncName'] },
    struct: ,
  },

  {
    title: "sould throw error when strict=true",
    math: "(2longFuncName + x)",
    parserOptions: { singleCharName: false, strict: true, functions: ['longFuncName'] },
    struct: ,
  },

];
