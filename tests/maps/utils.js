class NodeCreator {
  // take a look at the valid Node types at src/Node.js
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options = {}) {
    // the same exsits inside the parser `src/tex.pegjs`
    this.options = Object.assign(
      {
        autoMult: true,
        functions: [],
        singleCharName: true,
        memberExpressionAllowed: true,
        strict: false,
        // prettier-ignore
        builtInFunctions: [
          "sinh", "cosh", "tanh", "sech",  "csch",  "coth",  
          "arsinh", "arcosh", "artanh", "arsech",  "arcsch", "arcoth",
          "sin", "cos", "tan", "sec",  "csc",  "cot",
          "asin", "acos", "atan", "asec", "acsc",  "acot",
          "arcsin", "arccos", "arctan", "arcsec",  "arccsc",  "arccot", 
          "ln", "log", "exp", "floor", "ceil", "round", "random"
        ],
        // prettier-ignore
        infixOperators: [
          "^","*","/","+","-",
          "&&","||", "==", ">=",
          "<=", "<", ">", "="
        ],
        postfixOperators: ["!"],
      },
      options
    ); /// override the default options
  }

  invalidArgs(fname) {
    throw new Error("Invalid argument passed to: ") + fname;
  }

  BIF(name, args) {
    // builtin function
    if (
      typeof name !== "string" ||
      !Array.isArray(args) ||
      this.options.builtInFunctions.indexOf(name) === -1
    )
      this.invalidArgs("builtin function");
    return { type: "function", name, isBuiltIn: true, args };
  }

  F(name, args) {
    // function
    if (typeof name !== "string" || !Array.isArray(args))
      this.invalidArgs("function");
    return { type: "function", name, args };
  }

  block(name, args) {
    // frac
    if (typeof name !== "string" || !Array.isArray(args))
      this.invalidArgs("block");
    return { type: "block", name, args };
  }

  op(name, args) {
    // operator
    if (
      typeof name !== "string" ||
      this.options[`infixOperators`].indexOf(name) === -1 ||
      !Array.isArray(args)
    )
      this.invalidArgs("operator");
    return { type: "operator", name, args };
  }

  pOP(name, args) {
    // postfix operator
    if (
      typeof name !== "string" ||
      this.options[`postfixOperators`].indexOf(name) === -1 ||
      !Array.isArray(args)
    )
      this.invalidArgs("postfix operator");
    return { type: "operator", name, args, operatorType: "postfix" };
  }

  am(args) {
    if (!Array.isArray(args)) this.invalidArgs("automult");
    return { type: "automult", args };
  }

  mem(args) {
    if (!Array.isArray(args)) this.invalidArgs("member expression");
    return { type: "member expression", args };
  }

  tuple(args) {
    if (!Array.isArray(args)) this.invalidArgs("tuple");
    return { type: "tuple", args };
  }

}

exports.node = new NodeCreator();