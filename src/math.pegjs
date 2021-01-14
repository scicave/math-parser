// TODO: correct how built in function are dealed
// specially when using to without parenthesis after it

{
  options = Object.assign({
    autoMult: true,
    singleCharName: true,
    keepParen: false,
    functions: [],
    builtInIDs: ["infinity", "pi", "phi"],
  }, options, {
    extra: {
      memberExpressions: true,
      intervals: true,
      tuples: true,
      sets: true,
      ellipsis: 2,
      trailingComma: true,
      blankTerms: true,
      ...(options.extra||{  })
    },
    builtInFunctions: {
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
      ...(options.builtInFunctions||{  })
    },
  });

  // validations
  if (options.singleCharName)
  options.functions.forEach((f)=>{
    if(f.length !== 1) throw new OptionsError(`can't use multi-char functions when singleCharName = true`);
  });
  
  let hasTrailing, factorNameMatched, BIFName;

  preParse(input, peg$computeLocation, error);

  function pushChar(c, mode) {
    if (mode === "BIFPrimary") {
      let newTitle = BIFName + c, found = false;
      for (let t of options.builtInFunctions.primary) {
        if (t.length === newTitle.length && t === newTitle ||
            t.length > newTitle.length && t.slice(0, newTitle.length) === newTitle) {
          found = true; break;
        }
      }
      if (!found) return false;
      BIFName = newTitle;
      return true;
    } else if (mode === "BIFSecondary") {
      let newTitle = BIFName + c, found = false;
      for (let t of options.builtInFunctions.secondary) {
        if (t.length === newTitle.length && t === newTitle ||
            t.length > newTitle.length && t.slice(0, newTitle.length) === newTitle) {
          found = true; break;
        }
      }
      if (!found) return false;
      BIFName = newTitle;
      return true;
    }
  }

  function createNode(...args){
    let n = new Node(...args);
    if(n.type === "member expression" && !options.extra.memberExpressions)
      error(`member expression syntax is not allowed`);
    if(n.type === "tuple" && !options.extra.tuples)
      error(`tuples syntax is not allowed`);
    if(n.type === "set" && !options.extra.sets)
      error(`sets syntax is not allowed`);
    if(n.type === "interval" && !options.extra.sets)
      error(`intervals syntax is not allowed`);
    n.match = {
      location: location(),
      text: text(),
    }
    return n;
  }

  function handleBlock(node, o, c) {

    // node is expr or 1d array or 2d array
    // validation, [), (], {}, [], () are allowed
    if (
      o === '[' && c === "}" ||
      o === '{' && c === "]" ||
      o === '(' && c === "}" ||
      o === '{' && c === ")"
    ) error(`unexpected closing for the block`);

    // set
    if (Array.isArray(node) && Array.isArray(node[0])) {
      if (o === "[" && c === "]") {
        // matrix
        let rows = node.length, cols = node[0].length;
        for (let n of node)
          if (n.length !== cols)
            error("matrix has different column sizes");
        return createNode("matrix", node, { shape: [ rows, cols ] });
      }
      error("unexpected \";\" separetor in a block " + `"${o}${c}"`);
    }

    // now node is 1d array or expr

    // sets
    if (o === "{") { // c is "}"
      // set with one item
      return createNode("set", Array.isArray(node) ? node: [node]);
    }

    // tuple or interval or set
    if (Array.isArray(node)) {
      if (node.length === 2 && options.extra.intervals && !hasTrailing)
        // make sure not have blank terms or "..."
        if (!(node[0] === null || node[1] === null ||
              node[0] === "..." || node[1] === "..."))
          return createNode("interval", node, { startInclusive: o==="[", endInclusive: c==="]" });
      // matrix
      if (o === "[" && c === "]") 
        return createNode("matrix", [node]);
      // all possible expressions for "[]" are consumed here
      if (o === "[" || c === "]") error(`unexpected closing for the block`);
      if (node.length === 2 && !options.extra.tuples)
        return error("neither tuples nor intervals are allowed");
      return createNode("tuple", node);
    }

    // now node is expr

    // it is matrix
    if (o === "[" && c === "]")
      return createNode("Matrix", [[node]]);

    // extra validation, we are now dealing with "()"
    if (o === "[" || c === "]")
      error(`unexpected brackets opening and closing`);

    return options.keepParen
      ? createNode("parentheses", [node])
      : node;

  }

}

Expression "expression" = _ expr:Operation1 _ { return expr; }

Operation1 "operation or factor" = 
  head:Operation2 tail:(_ "=" !"=" _ Operation2)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[4]], {name: "=", operatorType: 'infix'});
    }, head);
  }

Operation2 "operation or factor" = 
  head:Operation3 tail:(_ ("==" / "!=" / ">=" / "<=" / ">" / "<") _ Operation3)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation3 "operation or factor" =
  head:Operation4 tail:(_ ("+" / "-") _ Operation4)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation4 "operation or factor" =
  head:Operation5 tail:(_ ("*" / "/") _ Operation5)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation5 "operation or factor" =
  head:AutoMult tail:(_ "^" _ Operation5)* {
    // left to right
    return tail.reduce(function(base, exponent) {
      let exp = exponent[3];
      if (base.checkType("automult")) {
        base.args[1] = createNode('operator' , [base.args[1], exp], {name: "^", operatorType: 'infix'});
        return base;
      }
      else 
        return createNode('operator' , [base, exp], {name: "^", operatorType: 'infix'});
    }, head);
  }

AutoMult "operation or factor" = /// series of multiplication or one "Factor"
  head:Factor tail:(_ FactorNotNumber)* {
    factorNameMatched = false;
    return tail.reduce(function(result, element) {
      return createNode("automult" , [result, element[1]]);
    }, head);
  }

operation5bifpArg =
  head:(FactorNumber/ operation5bifpName)
  tail:(_ n:operation5bifpName { return n })*
  tailtail:(_ "^" _ Operation5)*
  {
    factorNameMatched = false;
    // when singleCharName: sinxyz,,, multiple ids after the first id
    head = tail.reduce(function(result, id) {
      return createNode("automult" , [result, id]);
    }, head);
    return tailtail.reduce(function(base, exponent) {
      let exp = exponent[3];
      if (base.checkType("automult")) {
        base.args[1] = createNode('operator' , [base.args[1], exp], {name: "^", operatorType: 'infix'});
        return base;
      }
      else 
        return createNode('operator' , [base, exp], {name: "^", operatorType: 'infix'});
    }, head);
  }

operation5bifpName = f:(
    BuiltInIDs /
    !Functions n:Name { return n }
  ) _ fac:factorial? {
    if (fac) f = createNode('postfix operator', [f], {name: '!'});
    factorNameMatched = f.type === 'id';
    return f;
  }

Factor = FactorNumber / FactorNotNumber

FactorNumber =
  n:Number _ fac:factorial? {
    if (fac) n = createNode('postfix operator', [n], {name: '!'});
    return n;
  }

FactorNotNumber =
  f:(
    // factorNameMatched is used for cases like "xpi"
    // !char to avoid take the first term "pi" of "pix",,, update: no need for it
    BuiltInIDs /* !char */ /
    MemberExpression / Functions / TupleOrExprOrParenOrIntervalOrSetOrMatrix /
    BlockVBars / NameNME
  ) _ fac:factorial? {
    if (fac) f = createNode('postfix operator', [f], {name: '!'});
    factorNameMatched = f.type === 'id';
    return f;
  }

Functions "functions" =
  BIFPrimary / Function

BIFPrimary =
  name:bifPrimaryNames _ exp:SuperScript? _ args:bifPrimaryArgs {
    let func = createNode('function', args, {name, isBuiltIn:true});
    if(exp) func.exp = exp;
    return func;
  }

bifPrimaryNames =
  &{ BIFName = ''; return options.singleCharName }
  (c:char &{ return pushChar(c, "BIFPrimary") } { return c })+
  // it may not be a complete title
  &{ return options.builtInFunctions.primary.indexOf(BIFName) > -1 } {
    return BIFName;
  } /
  // singleCharName = false
  n:$multiCharName &{ return options.builtInFunctions.primary.indexOf(n) > -1 } { return n }

bifPrimaryArgs = a:(
    Functions /
    operation5bifpArg /
    functionParentheses /
    BlockVBars
  ) {
    return Array.isArray(a) ? a : [a]; //  array when it is functionParentheses
  }

// from options.functions or a secondary builtin
Function = 
  name:(bifSecondaryName/$NameNME) _ args:(
    a:(functionParenthesesNotVoid &{
      let exists = options.functions.indexOf(name)>-1
      || options.builtInFunctions.secondary.indexOf(name)>-1;
      if (!exists && !options.autoMult)
        error(`"${name}" is not a function, and autoMult is not activated`);
      return exists;
    }) { return a[0] } /
    voidParentheses &{
      let exists = options.functions.indexOf(name)>-1
      || options.builtInFunctions.secondary.indexOf(name)>-1;
      if (!exists)
        error(`"${name}" is not a function, and autoMult is not activated`);
      return true; // in case not strict mode, it is a valid function regardless of `exists`
    } { return [] }
  ) {
    let isBuiltIn = options.builtInFunctions.secondary.indexOf(name)>-1;
    return createNode('function', args, { name, isBuiltIn });
  }

bifSecondaryName =
  &{ BIFName = ''; return options.singleCharName }
  (c:char &{ return pushChar(c, "BIFSecondary") } { return c })+
  // it may not be a complete title
  &{ return options.builtInFunctions.secondary.indexOf(BIFName) > -1 } {
    return BIFName;
  }

// for member expressions
MultiCharFunction =
  name:$MultiCharNameNME _ a:functionParentheses {
    // `a` is eiher array or expr
    return createNode('function', a, { name });
  }

TupleOrExprOrParenOrIntervalOrSetOrMatrix =
  o:("("/"["/"{")
  arr2dOr1dArrOrExpr:commaSemiColonExpression
  c:(")"/"]"/"}")
  {
    return handleBlock(arr2dOr1dArrOrExpr, o, c);
  }

functionParentheses =
  a:("(" b:commaExpression ")" { return b } / voidParentheses { return [] }) {
    return Array.isArray(a) ? a : [a];
  }

functionParenthesesNotVoid =
  "(" a:commaExpression ")" {
    return Array.isArray(a) ? a : [a];
  }

commaSemiColonExpression
  = head:commaExpression tail:(_ ";" _ commaExpression)* {
    if (tail.length) {
      head = Array.isArray(head) ? head : [head];
      tail = tail.map(e=>Array.isArray(e[3]) ? e[3] : [e[3]]);
      // tail now is a 2d array
      return [head].concat(tail); // return 2d array
    }
    return head;
  }

// there is spaces around expressions already no need for _ rule
commaExpression = body:(

    head:Expression
    tail:("," a:(Expression / _ "..." _ { return "..." } / _ { return "__white__space__" }) { return a })*
    {
      return { head, tail };
    }

  / head:(_ "..." _ { return "..." } / _ { return "__white__space__" })
    tail:("," a:(Expression / _ "..." _ { return "..." } / _ { return "__white__space__" }) { return a })+
    {
      return { head, tail };
    }

  ) {
      let { head, tail } = body;
      hasTrailing = false; // reset it
      if (tail.length){
        tail.unshift(head);
        if("__white__space__" === tail[tail.length-1])
          if(options.extra.trailingComma) {
            hasTrailing = true;
            tail.pop();
          }
          else
            error("trailing comma is not allowed")
        if("__white__space__" === tail[tail.length-1])
          error("blank terms are not allowed at the end");
        for (let i=0; i<tail.length-1; i++) {
          if(tail[i] === "..." && !options.extra.ellipsis)
            error("ellipsis is not allow");
          if(tail[i] === "__white__space__") {
            if(!options.extra.blankTerms)
              error("blank terms are't allowed");
            tail[i] = null;
          }
        }
        return tail;
      }
      return head;
    }

// related to functions
voidParentheses =  "(" _ ")" { return [] }; 

BlockVBars =
  "|" expr:Expression "|" { return createNode('abs', [expr]) }

////// main factor, tokens

SuperScript "superscript" = "^" _ arg:Factor { return arg; }

///////// numbers

Number "number"
  = sign:sign? _ $SimpleNumber {
    let value = parseFloat(text());
    return createNode('number', null, {value});
  }

SimpleNumber "number"
  = (num:[0-9][0-9]* frac? / frac) {
    let value = parseFloat(text());
    return createNode('number', null, {value});
  }

frac
  = "." _ [0-9][0-9]*

sign
  = '-' / '+'

//////////////

BuiltInIDs = &{ return !factorNameMatched } n:$multiCharName &{ return options.builtInIDs.indexOf(n) > -1 } {
  return createNode("id", null, { name: n, builtIn: true });
}

Name "name" = MemberExpressionName / NameNME

// not member expression

NameNME = _name {
  let name = text();

  //#region checking if function id is used as variable id
  let er = false;
  er = options.builtInFunctions.primary.indexOf(name) > -1
    || options.builtInFunctions.secondary.indexOf(name) > -1
    || options.functions.indexOf(name) > -1;
  if(er && options.strict){
    error('the function "' + name + '", it used with no arguments! can not use the function a variable!');
  }
  //#endregion

  return createNode('id', null, {name});
}

MultiCharNameNME = multiCharName {
  let name = text();
  return createNode('id', null, {name})
}

_name = &{ return !options.singleCharName } multiCharName / char[0-9]*

multiCharName "multi char name"= (char/"_")+[0-9]*

MemberExpression =
  // left to right
  head:memberFirstArg _ "." chain:( _ memberArg _ ".")* _ tail:memberArg {
    let arg1 = chain.reduce(function(result, element) {
      return createNode('member expression' , [result, element[1]]);
    }, head);
    return createNode('member expression' , [arg1, tail]);
  }

MemberExpressionName "member expression end with name" =
  // left to right
  head:memberFirstArg _ "." chain:( _ memberArg _ ".")* _ tail:MultiCharNameNME {
    let arg1 = chain.reduce(function(result, element) {
      return createNode('member expression' , [result, element[1]]);
    }, head);
    return createNode('member expression' , [arg1, tail]);
  }

MemberExpressionFunction "member expression end with function" =
  // left to right
  head:memberFirstArg _ "." chain:( _ memberArg _ ".")* _ tail:MultiCharFunction {
    let arg1 = chain.reduce(function(result, element) {
      return createNode('member expression' , [result, element[1]]);
    }, head);
    return createNode('member expression' , [arg1, tail]);
  }

// not member expression
// no need for FunctionsNME
memberFirstArg = Function / NameNME
memberArg = MultiCharFunction / MultiCharNameNME 

///// primitives

w "letter or digit" = [a-zA-Z0-9]

char "letter"  = [a-zA-Z]

nl "newline" = "\n" / "\r\n" / "\r" / "\u2028" / "\u2029"

sp "space or tab"= [ \t]

s "whitespace" = nl / sp

_ "whitespace"
  = (nl / sp)*

factorial = "!" 
