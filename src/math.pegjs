// TODO: add match={location, text} automatically into any node
{
  options = Object.assign({
    autoMult: true,
    functions: [],
    singleCharName: true,
    builtInFunctions: [
      "sinh", "cosh", "tanh", "sech",  "csch",  "coth",  
      "arsinh", "arcosh", "artanh", "arsech",  "arcsch", "arcoth",
      "sin", "cos", "tan", "sec",  "csc",  "cot",
      "asin", "acos", "atan", "asec", "acsc",  "acot",
      "arcsin", "arccos", "arctan", "arcsec",  "arccsc",  "arccot", 
      "ln", "log", "exp", "floor", "ceil", "round", "random"
    ]
  }, options); /// override the default options
}

Expression "expression" = Operation11

Operation11 "operation or factor" = 
  head:Operation12 tail:(_ "=" _ Operation12)* _{
    return tail.reduce(function(result, element) {
      return new Node('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation12 "operation or factor" = 
  head:Operation13 tail:(_ "||" _ Operation13)* _{
    return tail.reduce(function(result, element) {
      return new Node('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation13 "operation or factor" = 
  head:Operation14 tail:(_ "&&" _ Operation14)* _{
    return tail.reduce(function(result, element) {
      return new Node('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation14 "operation or factor" = 
  head:Operation15 tail:(_ "==" _ Operation15)* _{
    return tail.reduce(function(result, element) {
      return new Node('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation15 "operation or factor" = 
  head:Operation2 tail:(_ (">" / "<" / ">=" / "<=") _ Operation2)* _{
    return tail.reduce(function(result, element) {
      return new Node('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation2 "operation or factor" =
  head:Operation3 tail:(_ ("+" / "-") _ Operation3)* _{
    return tail.reduce(function(result, element) {
      return new Node('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation3 "operation or factor" =
  head:Operation4 tail:(_ ("*" / "/") _ Operation4)* {
    return tail.reduce(function(result, element) {
      return new Node('operator' , [result, element[3]], {name: element[1], operatorType: 'infix'});
    }, head);
  }

Operation4 "operation or factor" = /// series of multiplication or one "Factor"
  head:(Operation5) tail:(_ operation5WithoutNumber)* {
    if(options.autoMult){
      return tail.reduce(function(result, element) {
        return new Node("automult" , [result, element[1]]);
      }, head);
    }
    error('invalid syntax, hint: missing * sign');
  }
  
Operation5 "operation or factor" =
  base:Factor _ exp:SuperScript? _ fac:factorial? {
    if (exp) base = new Node('operator', [base, exp], {name:'^', operatorType: 'infix'});
    if (fac) base = new Node('postfix operator', [base], {name: '!', operatorType: 'postfix'});
    return base;
  }

operation5WithoutNumber "operation or factor" =
  base:factorWithoutNumber _ exp:SuperScript? _ fac:factorial? {
    if (exp) base = new Node('operator', [base, exp], {name:'^', operatorType: 'infix'});
    if (fac) base = new Node('postfix operator', [base], {name: '!', operatorType: 'postfix'});
    return base;
  }

Factor
  = factorWithoutNumber / Number

factorWithoutNumber =
  Functions / BlockpParentheses / BlockVBars /
  Name

// simpleFactor =
//   Number/ BlockVBars /* || === abs() */ /
//   Name

Delimiter
  = head:Expression tail:(_ "," _ (Expression))* _{
      if (tail.length){
        return new Node('delimiter', [head].concat(tail.map(a => a[3])), {name: ','});
      }
      return head;
    }

Functions "functions" =
  BuiltInFunctions / Function

BuiltInFunctions =
  callee:builtInFuncsTitles _ exp:SuperScript? _ arg:builtInFuncsArg {
    let func = new Node('function', [arg], {callee, isBuiltIn:true});
    if(!exp) return func;
    else return new Node('operator', [func, exp], {name: '^', operatorType: 'infix'});
  }

// builtInFuncsTitles = n:$multi_char_name &{ return options.builtInFunctions.indexOf(n) > -1 } { return text(); }
builtInFuncsTitles = ( // the same as options.builtInFunctions
    "sinh"/ "cosh"/ "tanh"/ "sech"/  "csch"/  "coth"/  
    "arsinh"/ "arcosh"/ "artanh"/ "arsech"/ "arcsch"/ "arcoth"/
    "sin"/ "cos"/ "tan"/ "sec"/ "csc"/  "cot"/
    "asin"/ "acos"/ "atan"/ "asec"/ "acsc"/  "acot"/
    "arcsin"/ "arccos"/ "arctan"/ "arcsec"/  "arccsc"/ "arccot"/ 
    "ln"/ "log"/ "exp"/ "floor"/ "ceil"/ "round"/ "random" / "sum"
  ) {
	  return new Node('id', null, { name: text() });
  }

builtInFuncsArg = 
  (
    head:(Number / !Functions n:Name { return n; })
    tail:(_ (!Functions n:Name { return n; }))* {
      if(options.autoMult){
        return tail.reduce(function(result, element) {
          return new Node("automult" , [result, element[1]]);
        }, head);
      }
      error('invalid syntax, hint: missing * sign');
    }
  ) /* reset of the factors */ / BlockpParentheses / BlockVBars / Functions

// TODO: 2axsin3y
Function = 
  callee:Name &{ return options.functions.indexOf(name)>-1; } _ parentheses:BlockpParentheses 
  { return new Node('function', parentheses, { callee }); }

BlockpParentheses =
  "(" args:Delimiter /* returns Expression id no delimiter found */ ")" { return new Node('block', [args], {name: '()'}); }

BlockVBars =
  "|" expr:Expression "|" { return new Node('block', [expr], {name: '||'}) }

////// main factor, tokens

SuperScript "superscript"= "^" _ arg:Factor { return arg; }

///////// numbers

Number "number"
  = sign:sign? _ $SimpleNumber {
    let value = parseFloat(text());
    return new Node('number', null, {value});
  }

SimpleNumber "number"
  = (num:[0-9][0-9]* frac? / frac) {
    let value = parseFloat(text());
    return new Node('number', null, {value});
  }

frac
  = "." _ [0-9][0-9]*

sign
  = '-' / '+'

//////////////

Name "name" = _name {
  let name = text();
  if(options.builtInFunctions.indexOf(name) > -1 || options.functions.indexOf(name) > -1){
    error(`the function "${name}" it used with no arguments! can't use the function a variable!`);
  }
  return new Node('id', null, {name})
}

_name = &{ return !options.singleCharName } multi_char_name / char

multi_char_name = (char/"_")+[0-9]*

// multi_char_name_no_number = &{ return !options.singleCharName } (char/"_")+[0-9]* {
//     return text();
//   }

///// primitives

w "letter or digit" = [a-zA-Z0-9]

char "letter"  = [a-zA-Z]

nl "newline" = "\n" / "\r\n" / "\r" / "\u2028" / "\u2029"

sp "space or tab"= [ \t]

s "whitespace" = nl / sp

_ "whitespace"
  = (nl !nl / sp)*

factorial = "!" 
