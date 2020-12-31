// TODO: add option builtInVaraibles to use in case of single char name to parse pi and phi
// TODO: add option varaibles to use in case of single char name to enable exclude some multi-char name from this options
// TODO: p1.func(x), parse as member expression has arg[1] as id, and arg[2] as function,

{

  preParse(input, peg$computeLocation, error);

  options = Object.assign({
    autoMult: true,
    functions: [],
    singleCharName: true,
    memberExpressionAllowed: true,
    strict: false,
    builtInFunctions: [
      "sinh", "cosh", "tanh", "sech",  "csch",  "coth",  
      "arsinh", "arcosh", "artanh", "arsech",  "arcsch", "arcoth",
      "sin", "cos", "tan", "sec",  "csc",  "cot",
      "asin", "acos", "atan", "asec", "acsc",  "acot",
      "arcsin", "arccos", "arctan", "arcsec",  "arccsc",  "arccot", 
      "ln", "log", "exp", "floor", "ceil", "round", "random"
    ]
  }, options); /// override the default options
  
  function createNode(...args){
    let n = new Node(...args);
    n.match = {
      location: location(),
      text: text(),
    }
    return n;
  }
  
}

Expression "expression" = _ expr:Operation11 _ { return expr; }

Operation11 "operation or factor" = 
  head:Operation12 tail:(_ "=" _ Operation12)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation12 "operation or factor" = 
  head:Operation13 tail:(_ "||" _ Operation13)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation13 "operation or factor" = 
  head:Operation14 tail:(_ "&&" _ Operation14)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation14 "operation or factor" = 
  head:Operation15 tail:(_ "==" _ Operation15)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation15 "operation or factor" = 
  head:Operation2 tail:(_ (">" / "<" / ">=" / "<=") _ Operation2)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation2 "operation or factor" =
  head:Operation3 tail:(_ ("+" / "-") _ Operation3)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation3 "operation or factor" =
  head:Operation4 tail:(_ ("*" / "/") _ Operation4)* {
        // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation4 "operation or factor" = /// series of multiplication or one "Factor"
  head:(Exp) tail:(_ ExpBNN)* {
    if(options.autoMult){
        // left to right
      return tail.reduce(function(result, element) {
        return createNode("automult" , [result, element[1]]);
      }, head);
    }
    error('invalid syntax, hint: missing * sign');
  }


Exp "operation or factor" =
  head:Factor tail:(_ "^" _ Factor)* {
    // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

// Exp "B_ase is N_ot N_umber: BNN"
ExpBNN = 
  head:factorWithoutNumber tail:(_ "^" _ Factor)* {
    // left to right
    return tail.reduce(function(result, element) {
      return createNode('operator' , [result, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

Factor
  = factorWithoutNumber / base:Number _ fac:factorial? {
    if (fac) base = createNode('operator', [base], {name: '!', operatorType: 'postfix'});
    return base;
  }

factorWithoutNumber =
  base:(MemberExpression / Functions / BlockParentheses / BlockVBars / NameNME) _ fac:factorial? {
    if (fac) base = createNode('operator', [base], {name: '!', operatorType: 'postfix'});
    return base;
  }

Delimiter
  // there is spaces around expressions already no need for _ rule
  = head:Expression tail:("," Expression)* {
      if (tail.length){
        return createNode('delimiter', [head].concat(tail.map(a => a[1])), {name: ','});
      }
      return head;
    }

Functions "functions" =
  BuiltInFunctions / Function

BuiltInFunctions =
  name:builtInFuncsTitles _ exp:SuperScript? _ args:builtInFuncArgs {
    let func = createNode('function', args, {name, isBuiltIn:true});
    if(!exp) return func;
    else return createNode('operator', [func, exp], {name: '^', operatorType: 'infix'});
  }

// builtInFuncsTitles = 
builtInFuncsTitles =
  &{ return options.singleCharName } n:(
    // CAUTION: we have to use them literally here to enable
    // sinx  =>  node.bunltInFunction("sin", ["x"]);
    "sinh"/ "cosh"/ "tanh"/ "sech"/  "csch"/  "coth"/  
    "arsinh"/ "arcosh"/ "artanh"/ "arsech"/ "arcsch"/ "arcoth"/
    "sin"/ "cos"/ "tan"/ "sec"/ "csc"/  "cot"/
    "asin"/ "acos"/ "atan"/ "asec"/ "acsc"/  "acot"/
    "arcsin"/ "arccos"/ "arctan"/ "arcsec"/  "arccsc"/ "arccot"/ 
    "ln"/ "log"/ "exp"/ "floor"/ "ceil"/ "round"/ "random" / "sum"
  ) { return n; } /
  n:$multiCharName &{ return options.builtInFunctions.indexOf(n) > -1 } { return n; }

builtInFuncArgs = a:(
    (
      head:(Number / !Functions n:Name { return n; })
      tail:(_ (!Functions n:Name { return n; }))* {
        if(options.autoMult){
          // left to right
          return tail.reduce(function(result, element) {
            return createNode("automult" , [result, element[1]]);
          }, head);
        }
        error('invalid syntax, hint: missing * sign');
      }
    ) /
    BlockParentheses /
    BlockVBars /
    Functions
  ) {
    if (a.type === "block" && a.name === "()") return a.args ? a.args : [];
    return [a]; // a is not parenthese
  }

// TODO: 2axsin3y --- singleCharName = true
Function = 
  // no need for FnNameNME
  name:$NameNME _ parentheses:(BlockParentheses / VoidBlockParentheses) &{
    if(!parentheses.args /*: VoidBlockParentheses */ && !options.strict) {
      // it has to be a function, it may or may not be provided in `options.functions`
      return true;
    }
    let functionExists = options.functions.indexOf(name)>-1;
    if (!functionExists && !parentheses.args) error("unexpected empty parenthese after a non-function");
    return functionExists; 
  } { return createNode('function', parentheses.args || [], { name }); }
  

MultiCharFunction =
  // for member expressions
  name:$MultiCharNameNME _ parentheses:(BlockParentheses / VoidBlockParentheses) {
    return createNode('function', [parentheses], { name });
  }

BlockParentheses =
  "(" args:Delimiter /* returns Expression id no delimiter found */ ")" { return createNode('block', [args], {name: '()'}); }

VoidBlockParentheses =
  "(" _ ")" { return createNode('block', null, {name: '()'}); }

BlockVBars =
  "|" expr:Expression "|" { return createNode('block', [expr], {name: '||'}) }

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

Name "name" = MemberExpressionName / NameNME

// not member expression

NameNME = _name {
  let name = text();

  //#region checking if function id is used as variable id
  let er = false;
  er = options.builtInFunctions.indexOf(name) > -1 || options.functions.indexOf(name) > -1;
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
    if(!options.memberExpressionAllowed) error(`member expression syntax is not allowed`);
    let arg1 = chain.reduce(function(result, element) {
      return createNode('member expression' , [result, element[1]]);
    }, head);
    return createNode('member expression' , [arg1, tail]);
  }

MemberExpressionName "member expression end with name" =
  // left to right
  head:memberFirstArg _ "." chain:( _ memberArg _ ".")* _ tail:MultiCharNameNME {
    if(!options.memberExpressionAllowed) error(`member expression syntax is not allowed`);
    let arg1 = chain.reduce(function(result, element) {
      return createNode('member expression' , [result, element[1]]);
    }, head);
    return createNode('member expression' , [arg1, tail]);
  }

MemberExpressionFunction "member expression end with function" =
  // left to right
  head:memberFirstArg _ "." chain:( _ memberArg _ ".")* _ tail:MultiCharFunction {
    if(!options.memberExpressionAllowed) error(`member expression syntax is not allowed`);
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
