class NodeCreator {
  // take a look at the valid Node types at src/Node.js
  constructor() {
    this.ellipsis = { type: "ellipsis" };
  }

  // this feature is removed
  get blank() {
    throw new Error("blankTrems are not valid syntax any more.");
  }

  invalidArgs(fname) {
    throw new Error("Invalid argument passed to: ") + fname;
  }

  // -------------------------------
  //           AST nodes
  // -------------------------------

  BIF(name, args) {
    // builtin function
    if (typeof name !== "string" || !Array.isArray(args))
      console.log(name) && this.invalidArgs("builtin function");
    return { type: "function", name, isBuiltin: true, args };
  }

  F(name, args) {
    // function
    if (typeof name !== "string" || !Array.isArray(args))
      this.invalidArgs("function");
    return { type: "function", name, args };
  }

  op(name, args) {
    // operator
    if (
      typeof name !== "string" ||
      !Array.isArray(args)
    )
      this.invalidArgs("operator");
    return { type: "operator", name, args };
  }

  pOP(name, args) {
    // postfix operator
    if (typeof name !== "string" || !Array.isArray(args))
      this.invalidArgs("postfix operator");
    return { type: "operator", operatorType: "postfix", name, args };
  }

  sqop(name, args) {
    // postfix operator
    if (typeof name !== "string" || !Array.isArray(args))
      this.invalidArgs("sequence operator");
    return { type: "sequence operator", name, args };
  }

  am(args) {
    if (!Array.isArray(args)) this.invalidArgs("automult");
    return { type: "automult", args };
  }

  mem(args) {
    if (!Array.isArray(args)) this.invalidArgs("member expression");
    return { type: "member expression", args };
  }

  paren(args) {
    // frac
    if (!Array.isArray(args) || args.length !== 1)
      this.invalidArgs("parentheses");
    return { type: "parentheses", args };
  }

  abs(args) {
    if (!Array.isArray(args) || args.length !== 1) this.invalidArgs("abs");
    return { type: "abs", args };
  }

  tuple(args) {
    if (!Array.isArray(args)) this.invalidArgs("tuple");
    return { type: "tuple", args };
  }

  set(args) {
    if (!Array.isArray(args)) this.invalidArgs("set");
    return { type: "set", args };
  }

  interval(args, extra = {}) {
    if (!Array.isArray(args)) this.invalidArgs("interval");
    return { type: "interval", args, ...extra };
  }

  matrix(args) {
    if (!Array.isArray(args) || args.find((i) => !Array.isArray(i)))
      this.invalidArgs("matrix");
    return { type: "matrix", args };
  }
}

exports.node = new NodeCreator();

