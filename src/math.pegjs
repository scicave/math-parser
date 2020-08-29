// TODO: add option builtInVaraibles to use in case of single char name to parse pi and phi
// TODO: add option varaibles to use in case of single char name to enable exclude some multi-char name from this options
// TODO: 1 + p1.func()   ::: anble some functions to be without argumets
// TODO: 1 + p1.func(1)   ::: check if p1.func is function id or varaible in case of automult
// TODO: 1 + p1.func(2)!^2   ::: solve the error

{
  options = Object.assign({
    autoMult: true,
    functions: [],
    singleCharName: true,
    memberExpressionAllowed: true,
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
  head:(Operation5) tail:(_ operation5WithoutNumber)* {
    if(options.autoMult){
        // left to right
      return tail.reduce(function(result, element) {
        return createNode("automult" , [result, element[1]]);
      }, head);
    }
    error('invalid syntax, hint: missing * sign');
  }
  
Operation5 "operation or factor" =
  base:Factor _ exp:SuperScript?{
    if (exp) base = createNode('operator', [base, exp], {name:'^', operatorType: 'infix'});
    return base;
  }

operation5WithoutNumber "operation or factor" =
  base:factorWithoutNumber _ exp:SuperScript?{
    if (exp) base = createNode('operator', [base, exp], {name:'^', operatorType: 'infix'});
    return base;
  }

Factor = base:_factor _ fac:factorial? {
  if (fac) base = createNode('operator', [base], {name: '!', operatorType: 'postfix'});
  return base;
}

_factor
  = factorWithoutNumber / Number

factorWithoutNumber =
  Functions / BlockpParentheses / BlockVBars /
  Name

// simpleFactor =
//   Number/ BlockVBars /* || === abs() */ /
//   Name

Delimiter
  = head:Expression tail:(_ "," _ (Expression))* {
      if (tail.length){
        return createNode('delimiter', [head].concat(tail.map(a => a[3])), {name: ','});
      }
      return head;
    }

Functions "functions" =
  BuiltInFunctions / Function

FunctionsNME = BuiltInFunctions / FunctionNME

BuiltInFunctions =
  callee:builtInFuncsTitles _ exp:SuperScript? _ arg:builtInFuncsArg {
    let func = createNode('function', [arg], {callee, isBuiltIn:true});
    if(!exp) return func;
    else return createNode('operator', [func, exp], {name: '^', operatorType: 'infix'});
  }

// builtInFuncsTitles = 
builtInFuncsTitles =
  &{ return options.singleCharName } ( // the same as options.builtInFunctions
    "sinh"/ "cosh"/ "tanh"/ "sech"/  "csch"/  "coth"/  
    "arsinh"/ "arcosh"/ "artanh"/ "arsech"/ "arcsch"/ "arcoth"/
    "sin"/ "cos"/ "tan"/ "sec"/ "csc"/  "cot"/
    "asin"/ "acos"/ "atan"/ "asec"/ "acsc"/  "acot"/
    "arcsin"/ "arccos"/ "arctan"/ "arcsec"/  "arccsc"/ "arccot"/ 
    "ln"/ "log"/ "exp"/ "floor"/ "ceil"/ "round"/ "random" / "sum"
  ) { return createNode('id', null, { name: text() }); } /
  n:$multiCharName &{ return options.builtInFunctions.indexOf(n) > -1 } { return createNode('id', null, { name: text() });; }

builtInFuncsArg = 
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
  ) /* reset of the factors */ / BlockpParentheses / BlockVBars / Functions

// TODO: 2axsin3y
Function = 
  callee:Name &{ return options.functions.indexOf(callee.name)>-1; } _ parentheses:BlockpParentheses 
  { return createNode('function', parentheses, { callee }); }

// not member expression
FunctionNME =
  callee:NameNME &{ return options.functions.indexOf(callee.name)>-1; } _ parentheses:BlockpParentheses 
  { return createNode('function', parentheses, { callee }); }

BlockpParentheses =
  "(" args:Delimiter /* returns Expression id no delimiter found */ ")" { return createNode('block', [args], {name: '()'}); }

BlockVBars =
  "|" expr:Expression "|" { return createNode('block', [expr], {name: '||'}) }

////// main factor, tokens

SuperScript "superscript"= "^" _ arg:Factor { return arg; }

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

Name "name" = m:MemberExpression {
  if(!options.memberExpressionAllowed) error('member expression is no allowed');
  return m;
 } / NameNME

// not member expression
NameNME = _name {
  let name = text();
  if(options.builtInFunctions.indexOf(name) > -1 || options.functions.indexOf(name) > -1){
    error(`the function "${name}" it used with no arguments! can't use the function a variable!`);
  }
  return createNode('id', null, {name})
}

_name = &{ return !options.singleCharName } multiCharName / char[0-9]*

multiCharName "multi char name"= (char/"_")+[0-9]*

MemberExpression "member expression" =
  head:memberArg _ "." chain:( _ memberArg _ ".")* _ tail:NameNME{
    // left to right
    let arg1 = chain.reduce(function(result, element) {
      return createNode('member expression' , [result, element[1]]);
    }, head);
    return createNode('member expression' , [arg1, tail]);
  }

// not member expression
memberArg = FunctionsNME / NameNME 

///// primitives

w "letter or digit" = [a-zA-Z0-9]

char "letter"  = [a-zA-Z]

nl "newline" = "\n" / "\r\n" / "\r" / "\u2028" / "\u2029"

sp "space or tab"= [ \t]

s "whitespace" = nl / sp

_ "whitespace"
  = (nl / sp)*

factorial = "!" 
