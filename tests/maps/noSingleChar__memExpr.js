const { node } = require("./utils");

module.exports = [

  {
    math: "point.x",
    parserOptions: { singleCharName: false,  },
  },

  {
    math: "1+ point.component_1^2!",
    parserOptions: { singleCharName: false,  },
  },

  {
    math: "1 + point1.  func()",
    parserOptions: { singleCharName: false,  },
  },

  {
    math: "1 + point1  .\\n func(1.2+x)",
    parserOptions: { singleCharName: false,  },
  },

  {
    math: "1 + p_1.func(1.2+x)!^2",
    parserOptions: { singleCharName: false,  },
  },

  {
    math: "1 + p.func(1.2+x)^2!",
    parserOptions: { singleCharName: false },
    struct: ,
  },

];
