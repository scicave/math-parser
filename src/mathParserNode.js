
class Node {
  constructor(type, args, props) {

    Object.assign(this, props);

    if (this.types.values.indexOf(type) === -1) {
      throw new Error('invalid type for the node, "' + type + '"');
    }
    
    if (type === this.types.OPERATOR && this.types.operators[props.operatorType].indexOf(props.name) === -1) {
      throw new Error(`invalid ${props.operatorType} operator "${props.name}"`);
    }

    this.type = type;
    this.args = args;

  }

  checkType(t){
    if(this.types.values.indexOf(t) > -1){
      if(this.type === t){
        return true;
      }
    } else {
      throw new Error('invalid type, can\'t check for "' + t + '"');
    }
  }

  check(props){
    for(let p in props){
      if(p === 'type') { if(!this.checkType(props.type)) return false; } 
      else if(p !== "args" && props[p] !== this[p]) return false;
    }
    return true;
  }

}

Node.prototype.types = {
  NUMBER: "number",
  ID: "id",
  FUNCTION: "function",
  BLOCK: 'block',
  AUTO_MULT: "automult",
  OPERATOR:  'operator',
  DELIMITER: 'delimiter',
  MEMBER_EXPRESSION: 'member expression',
};

Node.prototype.types.values = Object.values(Node.prototype.types);

Node.prototype.types.operators = {
  "infix": [
    "*","/","+","-","!",
    "^","&&","||", "=="
  ],
  "postfix": [
    "!"
  ]
};

Node.prototype.types.blocks = [
  "[]", "()", "{}", "[]", "||",
];


module.exports = Node;
