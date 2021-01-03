class Node {
  constructor(type, args, props) {
    Object.assign(this, props);

    if (Node.types.values.indexOf(type) === -1) {
      throw new Error('invalid type for the node, "' + type + '"');
    }

    this.type = type;
    this.args = args;
  }

  checkType(t) {
    if (Node.types.values.indexOf(t) > -1) {
      return this.type === t;
    } else {
      throw new Error("invalid type, can't check for \"" + t + '"');
    }
  }

  // check every thing except args
  check(props) {
    for (let p in props) {
      if (p === "type") {
        if (!this.checkType(props.type)) return false;
      } else if (p !== "args" && props[p] !== this[p]) return false;
    }
    return true;
  }
}

Node.types = {
  NUMBER: "number",
  ID: "id",
  FUNCTION: "function",
  AUTO_MULT: "automult",
  OPERATOR: "operator",
  POSTFIX_OPERATOR: "postfix operator",
  MEMBER_EXPRESSION: "member expression",
  PARENTHESES: "parentheses",
  INTERVAL: "interval",
  TUPLE: "tuple",
  SET: "set",
};

Node.types.values = Object.values(Node.types);

Node.types.operators = {
  infix: ["^", "*", "/", "+", "-", "&&", "||", "==", ">=", "<=", "<", ">", "="],
  postfix: ["!"],
};

module.exports = Node;
