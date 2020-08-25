let parser = require('../../index.js');

function failed(msg){
  return { message: () => msg , pass:false };
}

expect.extend({
  /**
   * @param {parser.Node} node
   * @param {Obj} struct
   */
  toHaveStructure(node, struct) {
    // struct number{1}
    
    if(!(node instanceof parser.Node)) {
      return failed(`Received value has to be instance of parser.Node`);
    }

    if(!(struct instanceof Object)) {
      return failed(`"struct" is type of ${typeof struct}, toHaveStructure checks the match between parser.Node and object.`);
    }

    function _check(n, s){
      if(!n.check(s)){
        let _n  = {...n}, _s={...s};
        delete _n.args; delete _s.args;
        _n = JSON.stringify(_n); _s = JSON.stringify(_s);
        return failed(`properties of ${_n} in node, don't match these of ${_s} of struct`);
      }
      if(s.args && n.args){
        if(s.args.length !== n.args.length){
          let _n  = {...n}, _s={...s};
          delete _n.args; delete _s.args;
          _n = JSON.stringify(_n); _s = JSON.stringify(_s);
          return failed(`${_s} in struct and ${_n} in node args has different lengths`);
        }
        for(let i = 0; i < s.args.length; i++){
          let c = _check(n.args[i], s.args[i]);
          if(c) return c; // here a problem is found
        }
      }else if(s.args || n.args){
        let _n  = {...n}, _s={...s};
        delete _n.args; delete _s.args;
        _n = JSON.stringify(_n); _s = JSON.stringify(_s);
        if(s.args){
          return failed(`${_s} in struct has args but ${_n} in node doesn't`);
        } else {
          return failed(`${_n} in node has args but ${_s} in struct doesn't`);
        } 
      }
    }

    return (
      _check(node, struct) ||
      { message: ()=> "Parse-tree matches the structure object!", pass: true }
    );
  },
});

function parse(math, options={}) {
  try {
    return parser.parse(math, options);
  } catch (e) {
    if (e instanceof parser.SyntaxError) {
      console.log("SyntaxError:", e.message);

      let i = e.location.start.line - 1;
      let lines = math.split('\n');

      let log = function (){
        if (i - 2 > -1) 
        console.log(lines[i - 2]);
        if (i - 1 > -1) 
        console.log(lines[i - 1]);
        console.log();
        console.log(lines[i]);
        console.log((new Array(e.location.start.column - 1)).fill("_").join('') + "^");
        console.log();
        if (i + 1 < lines.length) 
        console.log(lines[i + 1]);
        if (i + 2 < lines.length) 
        console.log(lines[i + 2]);
      };

      log();

    } else {
      throw e;
    }
  }
}

describe('parse basic arithmetics', ()=>{
  
  test("1+2^1.2 / x * -5.236 --2", ()=>{
    expect(parse('1+2^1.2 / x * -5.236 --2')).toHaveStructure({
      type: 'operator', name: "-",
      "args": [
        {
          type: 'operator', name: '+',
          "args": [
            { value: 1, type: "number" },
            {
              type: 'operator', name: '*',
              "args": [
                {
                  type: 'operator', name: '/',
                  "args": [
                    {
                      type: 'operator', name: '^',
                      "args": [
                        { value: 2, type: "number" },
                        { value: 1.2, type: "number" },
                      ]
                    },
                    { name: "x", type: "id", }
                  ]
                },
                { value: -5.236, type: "number" },
              ]
            }
          ]
        },
        { value: -2, type: "number", }
      ]
    });
  });

});

describe('tests singleCharName=true', ()=>{

  describe("tests intellicense, automult", ()=>{
    
    test('tests 2xsiny', ()=>{
      expect(parse('2xsiny')).toHaveStructure({
        "type": "automult",
        "args": [
          {
            type: 'automult',
            args: [
              {
                "value": 2,
                "type": "number",
              }, {
                type: 'id',
                name: 'x'
              },
            ]
          },
          {
            type: 'function',
            name: 'sin',
            isBuiltIn: true,
            args: [
              {
                type: 'id',
                name: 'y'
              }
            ]
          }
        ]
      });
    });
    
    test('tests sinxcosx', ()=>{
      expect(parse('sinxcosx')).toHaveStructure({
        "type": "automult",
        "args": [
          {
            type: 'function',
            name: 'sin',
            isBuiltIn: true,
            args: [
              { type: 'id', name: 'x' }
            ]
          },
          {
            type: 'function',
            name: 'cos',
            isBuiltIn: true,
            args: [
              { type: 'id', name: 'x' }
            ]
          }
        ]
      });
    });
  
  });

});

describe('tests singleCharName=false', ()=>{
  
  let parserOptions = { singleCharName: false };

  describe("tests intellicense, automult", ()=>{
    
    test('tests 2asdxsinerty', ()=>{
      expect(parse('2asdxsinerty', parserOptions)).toHaveStructure({
        "type": "automult",
        "args": [
          { value: 2, "type": number, },
          {
            type: "automult",
            "args": [
              { type: 'id', name: 'asdx' },
              {
                type: 'function',
                name: 'sin',
                isBuiltIn: true,
                args: [
                  { type: 'id', name: 'erty' }
                ]
              }
            ]
          }
        ]
      });
    });
    
    test('tests sinxcosx', ()=>{
      expect(parse('sinxcosx', parserOptions)).toHaveStructure({
        type: 'function',
        name: 'sin',
        isBuiltIn: true,
        args: [
          { type: 'id', name: 'xcosx' }
        ]
      });
    });
  
  });
  
});

