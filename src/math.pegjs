/**
 * Pegjs rules of the major significant parts of the exression are __PascalCased__
 * The helper rules are __camelCased__
 */

{
  {
    let defaultBIFprimary = [
      // can be used like "sinx, logx"
      "sin", "cos", "tan", "sec",  "csc",  "cot", "asin", "acos", "atan",
      "asec", "acsc", "acot", "sinh", "cosh", "tanh", "sech", "csch", "coth",
      "ln", "log",
    ];
    
    let defaultBIFsecondary = [
      "exp", "floor", "ceil", "round", "random", "sqrt",
      // hyperbolic function
      "arsinh", "arcosh", "artanh", "arsech", "arcsch", "arcoth",
      "arcsin", "arccos", "arcotan", "arcsec", "arccsc", "arccot",
    ];
    
    let defaultBIDs = ["infinity", "pi", "phi"];
    
    let defaultOptions = {
      autoMult: true,
      singleCharName: true,
      keepParen: false,
      functions: [],
      builtinIDs: defaultBIDs,
      // operatorSequence: true,
      extra: {
        memberExpressions: true,
        intervals: true,
        tuples: true,
        sets: true,
        matrices: true,
        ellipsis: {
          matrices: true,
          tuples: true,
          funcArgs: true,
          sets: true,
          infixOperators: true
        },
      },
      builtinFunctions: {
        primary: defaultBIFprimary,
        secondary: defaultBIFsecondary,
      },
    };  

    options = merge(defaultOptions, options);

    options.operatorSequence = options.operatorSequence ||
      typeof options.extra.ellipsis !== "object"
      // if it is not object, let's return false
      // it will be equivalent to options.operatorSequence || false;
      ? false
      // if it is object, let's look inside for infixOperators
      : options.extra.ellipsis.infixOperators;

    if (options.builtinFunctions.primary[0] === '...')
      // replace the three dots with the default things.
      options.builtinFunctions.primary.splice(0, 1, ...defaultBIFprimary);

    if (options.builtinFunctions.secondary[0] === '...')
      // replace the three dots with the default things.
      options.builtinFunctions.secondary.splice(0, 1, ...defaultBIFsecondary);

    if (options.builtinIDs[0] === '...')
      // replace the three dots with the default things.
      options.builtinIDs.splice(0, 1, ...defaultBIDs);

    // validate options.functions
    if (options.singleCharName)
    options.functions.forEach((f)=>{
      if(f.length !== 1) throw new OptionsError(`can't use multi-char functions when singleCharName = true`);
    });    
  }

  let
    // this will determine whether to continue parsing as BuiltinIDs or not
    factorNameMatched=false, // use for, `xpi` === `x*p*i`, to ignore builtinIDs
    // builtinFunctionName which will be assembled char by char, one after the other.
    // see pushChar function, 👇
    BIFName='', // builtinFunctionName 
    doesCMCE = [] // doesCommaExpressionContainsEllipsis
  ;

  prepareInput(input, peg$computeLocation, error);

  // continue push char after another incase options.singleCharName == true
  // if we assembled a string which is not a function name
  // and not even a begining part of it, stop assemling the name
  // the assembled may be a part of a function name, so
  // we have to check again the in the pegjs `Rule` that
  // BIFName is not a fake one. 
  
  function pushChar(c, mode) {
    let arr;
    if (mode === "BIFPrimary")
      arr = options.builtinFunctions.primary;
    else if (mode === "BIFSecondary")
      (arr = options.builtinFunctions.secondary);
    else throw new Error("unexpecte error, math-parser: inside pushChar");

    let newTitle = BIFName + c, found = false;
    for (let t of arr) {
      if (t.length === newTitle.length && t === newTitle ||
          t.length > newTitle.length && t.slice(0, newTitle.length) === newTitle) {
        found = true; break;
      }
    }

    if (!found)
      return false;
    BIFName = newTitle;
    return true;
  }

  function createNode(...args){
    let n = new Node(...args);
    let ellipsis = options.extra.ellipsis;
    let __doesCMCE = doesCMCE.length && doesCMCE.pop();
    if (n.type === "automult" && !options.autoMult)
      error(`implicit multiplication is not allowed (automult)`);
    if (n.type === "member expression" && !options.extra.memberExpressions)
      error(`tuples syntax is not allowed`);
    if (n.type === "tuple") {
      if (!options.extra.tuples)
        error('tuples syntax is not allowed');
      let ellipsisAllowed = typeof ellipsis === 'object' ? ellipsis.tuples : ellipsis;
      if (__doesCMCE && !ellipsisAllowed)
        error('ellipsis is not allowed to be in tuples');
    }
    if (n.type === "set") {
      if (!options.extra.sets)
        error('sets syntax is not allowed');
      let ellipsisAllowed = typeof ellipsis === 'object' ? ellipsis.sets : ellipsis;
      if (__doesCMCE && !ellipsisAllowed)
        error('ellipsis is not allowed to be in sets');
    }
    if (n.type === "matrix") {
      if (!options.extra.matrices)
        error('matrices syntax is not allowed');
      let ellipsisAllowed = typeof ellipsis === 'object' ? ellipsis.matrices : ellipsis;
      if (__doesCMCE && !ellipsisAllowed)
        error('ellipsis is not allowed to be in matrices');
    }
    if (n.type === "interval") {
      if (!options.extra.intervals)
        error('intervals syntax is not allowed');
      let ellipsisAllowed = typeof ellipsis === 'object' ? ellipsis.intervals : ellipsis;
      if (__doesCMCE && !ellipsisAllowed)
        error('ellipsis is not allowed to be in intervals');
    }
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
      if (node.length === 2 && options.extra.intervals)
        // make sure not have ellpsis
        if (node[0].type !== "ellipsis" &&
            node[1].type !== "ellipsis") {
              return createNode("interval", node, { startInclusive: o==="[", endInclusive: c==="]" });
            }
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
      return createNode("matrix", [[node]]);

    // extra validation, we are now dealing with "()"
    if (o === "[" || c === "]")
      error(`unexpected brackets opening and closing`);

    return options.keepParen
      ? createNode("parentheses", [node])
      : node;

  }

}

Expression "expression" = _ expr:Operation1 _ { return expr; }

Operation1 "equation" = 
  head:Operation2 tail:(_ "=" _ Operation2)* {
    // left to right
    let isOperatorSequence;
    for (let e in tail) {
      if (e.type == "ellipsis") {
        isOperatorSequence = true;
        break;
      }
    }
    // if it is operator sequence
    if (isOperatorSequence) {
      if (tail.length === 1) error("operator sequence is not valid with two terms only");
      if (!options.operatorSequence) error("operators sequence is not allowed");
      // now it is valid
      return createNode("operator sequence", [head].concat(tail));
    }
    // it is not operator sequence
    return tail.reduce(function(lhs, element) {
      return createNode('operator' , [lhs, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

// comparison operators
Operation2 "comparison expression" = 
  head:Operation3 tail:(_ ("!=" / ">=" / "<=" / ">" / "<") _ Operation3)* {
    // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation3 "addition or subtraction" =
  head:Operation4 tail:(_ ("+" / "-") _ Operation4)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation4 "mult or div" =
  head:Operation5 tail:(_ ("*" / "/") _ Operation5)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation5 "exponentail expression" =
  head:AutoMult tail:(_ "^" _ Operation5)* {
    // left to right
    return tail.reduce(function(base, exponent) {
      let exp = exponent[3];
      if (base.type === "automult") {
        base.args[1] = createNode('operator' , [base.args[1], exp], {name: "^", operatorType: 'infix'});
        return base;
      }
      else 
        return createNode('operator' , [base, exp], {name: "^", operatorType: 'infix'});
    }, head);
  }

AutoMult "implicit multiplication" = /// series of multiplication or one "Factor"
  head:Factor tail:(_ FactorNotNumber)* {
    factorNameMatched = false;
    return tail.reduce(function(result, element) {
      return createNode("automult" , [result, element[1]]);
    }, head);
  }

// sequence of automult operator but designed specially for bifPrimaryArgs 
operation5bifpArg "argument for primarybuiltin function" =
  head:(FactorNumber/operation5bifpName)
  tail:(_ n:operation5bifpName { return n })*
  tailtail:(_ "^" _ Operation5)*
  {
    // reset after collecting all the args
    factorNameMatched = false;
    // when singleCharName: sinxyz,,, multiple ids after the first id
    head = tail.reduce(function(result, id) {
      return createNode("automult" , [result, id]);
    }, head);
    return tailtail.reduce(function(base, exponent) {
      let exp = exponent[3];
      if (base.type === "automult") {
        base.args[1] = createNode('operator' , [base.args[1], exp], {name: "^", operatorType: 'infix'});
        return base;
      }
      else 
        return createNode('operator' , [base, exp], {name: "^", operatorType: 'infix'});
    }, head);
  }

operation5bifpName = f:(
  BuiltinIDs /
  !Functions n:Name { return n }
  ) _ fac:factorial? {
    if (fac) f = createNode('operator', [f], {name: '!', operatorType: "postfix"});
    factorNameMatched = f.type === 'id'; // it maybe factorial operator
    return f;
  }

Factor = FactorNumber / FactorNotNumber

FactorNumber =
  n:Number _ fac:factorial? {
    if (fac) n = createNode('operator', [n], {name: '!', operatorType: "postfix"});
    return n;
  }

FactorNotNumber =
  f:(
    // factorNameMatched is used for cases like "xpi"
    // !char to avoid take the first term "pi" of "pix",,, update: no need for it
    BuiltinIDs /* !char */ /
    MemberExpression / Functions / TupleOrExprOrParenOrIntervalOrSetOrMatrix /
    BlockVBars / NameNME
  ) _ fac:factorial? {
    if (fac) f = createNode('operator', [f], {name: '!', operatorType: "postfix"});
    factorNameMatched = f.type === 'id';
    return f;
  }

BlockVBars =
  "|" expr:Expression "|" { return createNode('abs', [expr]) }

// -------------------------------
//          functions
// -------------------------------

Functions "functions" =
  BIFPrimary / Function

BIFPrimary =
  name:bifPrimaryNames _ /* exp:superScript? _ */ args:bifPrimaryArgs {
    let func = createNode('function', args, {name, isBuiltin:true});
    /* if(exp) func.exp = exp; */
    return func;
  }

superScript "superscript" = "^" _ arg:Factor { return arg; }

bifPrimaryNames =
  // reset and continue onlt if options.singleCharName
  &{ BIFName = ''; return options.singleCharName }
  (c:char &{ return pushChar(c, "BIFPrimary") })+
  // it may not be a complete title
  &{ return options.builtinFunctions.primary.indexOf(BIFName) > -1 } {
    return BIFName;
  } /
  // when singleCharName is false
  n:$multiCharName &{ return options.builtinFunctions.primary.indexOf(n) > -1 } { return n }

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
  name:(bifSecondaryName/$nameNME) _
  args:functionParentheses
  &{
    let exists = options.functions.indexOf(name)>-1
    || options.builtinFunctions.secondary.indexOf(name)>-1;
    if (!exists && (!args.length || !options.autoMult))
      error(`can't use "${name}" as a function`);
    return exists;
  }
  {
    let isBuiltin = options.builtinFunctions.secondary.indexOf(name)>-1;
    return createNode('function', args, { name, isBuiltin });
  }

// builtin secondary fnction name
bifSecondaryName =
  // reset and continue onlt if options.singleCharName
  &{ BIFName = ''; return options.singleCharName }
  (c:char &{ return pushChar(c, "BIFSecondary") })+
  // it may not be a complete title
  &{ return options.builtinFunctions.secondary.indexOf(BIFName) > -1 } {
    return BIFName;
  }

// for member expressions
MultiCharFunction =
  name:$MultiCharNameNME _ a:functionParentheses {
    // `a` is eiher array or expr
    return createNode('function', a, { name });
  }

functionParentheses =
  // reset then continue
  &{ doesCMCE.push(false); return true }
  "(" a:commaExpression ")"
  {
    let ellipsis = options.extra.ellipsis;
    let ellipsisAllowed = typeof ellipsis === 'object' ? ellipsis.funcArgs : ellipsis;
    let __doesCMCE = doesCMCE.pop();
    if (__doesCMCE && !ellipsisAllowed)
      error('ellipsis is not allowed to be an arg in a function');
    return Array.isArray(a) ? a : [a];
  }
  /
  // fallback when the previous grammar doesn't match
  &{ doesCMCE.pop(); return true }
  // match void parentheses
  "(" _ ")" { return [] }; 

// -------------------------------
//       brackets expression
// -------------------------------

TupleOrExprOrParenOrIntervalOrSetOrMatrix =
  o:("("/"["/"{")
  // reset then continue
  &{ doesCMCE.push(false); return true }
  arr2dOr1dArrOrExpr:commaSemiColonExpression
  c:(")"/"]"/"}")
  {
    return handleBlock(arr2dOr1dArrOrExpr, o, c);
  }
  // fallback action, pop the last item
  / &{ doesCMCE.pop(); return false } "a"

// -------------------------------
//         general expression
// -------------------------------

commaSemiColonExpression
  // no need for spaces around ";", they already exist
  = head:commaExpression tail:(";" commaExpression)* {
    if (tail.length) {
      head = Array.isArray(head) ? head : [head];
      tail = tail.map(e=>Array.isArray(e[1]) ? e[1] : [e[1]]);
      // tail now is a 2d array
      return [head].concat(tail); // return 2d array
    }
    return head;
  }

// there is spaces around expressions already no need for _ rule
commaExpression =
  head:(Expression/CommaExpressionEllipsis)
  tail:("," a:(Expression/CommaExpressionEllipsis) { return a })*
  {
    if (tail.length){
      tail.unshift(head);
      return tail;
    }
    if (head.type === 'ellipsis')
      error("can't use ellipsis as a stand-alone expression");
    return head;
  }

// put spaces around '...' here, use it directly there
Ellipsis = _ "..." _ { return createNode("ellipsis") }

CommaExpressionEllipsis = e:Ellipsis {
  doesCMCE[doesCMCE.length - 1] = true;
  return e;
}

// -------------------------------
//            numbers
// -------------------------------

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

// -------------------------------
//             IDs
// -------------------------------

BuiltinIDs = &{ return !factorNameMatched } n:$multiCharName &{ return options.builtinIDs.indexOf(n) > -1 } {
  return createNode("id", null, { name: n, isBuiltin: true });
}

Name "name" = MemberExpressionName / NameNME

// not member expression

NameNME = nameNME {
  let name = text();

  //#region checking if function id is used as variable id
  let er = false;
  er = options.builtinFunctions.primary.indexOf(name) > -1
    || options.builtinFunctions.secondary.indexOf(name) > -1
    || options.functions.indexOf(name) > -1;
  if(er){
    error('the function "' + name + '", it used with no arguments! can not use the function a variable!');
  }
  //#endregion

  return createNode('id', null, {name});
}

MultiCharNameNME = multiCharName {
  let name = text();
  return createNode('id', null, {name})
}

nameNME = &{ return !options.singleCharName } multiCharName / char[0-9]*

multiCharName "multi char name"= (char/"_")+[0-9]*

// -------------------------------
//       member expressions
// -------------------------------

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

// -------------------------------
//          primitives
// -------------------------------

char "letter"  = [a-zA-Z]

nl "newline" = "\n" / "\r\n"

sp "space or tab"= [ \t]

s "whitespace" = nl / sp

_ "whitespace"
  = (nl / sp)*

factorial = "!" 
