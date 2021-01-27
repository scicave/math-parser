const { node } = require('./utils');

module.exports = [

  {
    math: "1", // any-expression to pass some other checks
    title: "should throw: multi-char aren't allowed when singleCharName",
    parserOptions: { functions: ["asd"] },
    error: true, errorType: "options"
  },

];
