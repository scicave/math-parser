module.exports = class NodeFactory {
  // take a look at the valid Node types at src/Node.js
  ellipsis = { type: "ellipsis" };

  // this feature is removed
  static get blank() {
    throw new Error("blankTrems are not valid syntax any more.");
  }

  static #invalidArgs(fname) {
    throw new Error("Invalid argument passed to: ") + fname;
  }

  static BIF(name, args) {
    // builtin function
    if (typeof name !== "string" || !Array.isArray(args))
      console.log(name) && NodeFactory.#invalidArgs("builtin function");
    return { type: "function", name, isBuiltin: true, args };
  }

  static F(name, args) {
    // function
    if (typeof name !== "string" || !Array.isArray(args)) NodeFactory.#invalidArgs("function");
    return { type: "function", name, args };
  }

  static op(name, args) {
    // operator
    if (typeof name !== "string" || !Array.isArray(args)) NodeFactory.#invalidArgs("operator");
    return { type: "operator", name, args };
  }

  static pOP(name, args) {
    // postfix operator
    if (typeof name !== "string" || !Array.isArray(args))
      NodeFactory.#invalidArgs("postfix operator");
    return { type: "operator", operatorType: "postfix", name, args };
  }

  static sqop(name, args) {
    // postfix operator
    if (typeof name !== "string" || !Array.isArray(args))
      NodeFactory.#invalidArgs("sequence operator");
    return { type: "sequence operator", name, args };
  }

  static am(args) {
    if (!Array.isArray(args)) NodeFactory.#invalidArgs("automult");
    return { type: "automult", args };
  }

  static mem(args) {
    if (!Array.isArray(args)) NodeFactory.#invalidArgs("member expression");
    return { type: "member expression", args };
  }

  static paren(args) {
    // frac
    if (!Array.isArray(args) || args.length !== 1) NodeFactory.#invalidArgs("parentheses");
    return { type: "parentheses", args };
  }

  static abs(args) {
    if (!Array.isArray(args) || args.length !== 1) NodeFactory.#invalidArgs("abs");
    return { type: "abs", args };
  }

  static tuple(args) {
    if (!Array.isArray(args)) NodeFactory.#invalidArgs("tuple");
    return { type: "tuple", args };
  }

  static set(args) {
    if (!Array.isArray(args)) NodeFactory.#invalidArgs("set");
    return { type: "set", args };
  }

  static interval(args, extra = {}) {
    if (!Array.isArray(args)) NodeFactory.#invalidArgs("interval");
    return { type: "interval", args, ...extra };
  }

  static matrix(args) {
    if (!Array.isArray(args) || args.find((i) => !Array.isArray(i)))
      NodeFactory.#invalidArgs("matrix");
    return { type: "matrix", args };
  }
}
